import { v4 as uuidv4 } from "uuid";
import { dataStore } from "@/lib/data/store";
import { Recognition, VisibilityType, UserRole } from "@/lib/types";

interface CreateRecognitionInput {
  message: string;
  emojis: string[];
  visibility: VisibilityType;
  isAnonymous?: boolean;
  recipientId: string;
  keywords: string[];
}

interface UpdateRecognitionInput {
  id: string;
  message?: string;
  emojis?: string[];
  visibility?: VisibilityType;
  keywords?: string[];
}

export const recognitionResolvers = {
  Query: {
    recognition: (
      _: any,
      { id }: { id: string },
      context: { userId?: string }
    ) => {
      const recognition = dataStore.getRecognition(id);
      if (!recognition) return null;

      // Check visibility permissions
      if (!canViewRecognition(recognition, context.userId)) {
        return null;
      }

      return recognition;
    },

    recognitions: (
      _: any,
      {
        recipientId,
        senderId,
        visibility,
        department,
        keywords,
        limit = 20,
        offset = 0,
      }: {
        recipientId?: string;
        senderId?: string;
        visibility?: VisibilityType;
        department?: string;
        keywords?: string[];
        limit: number;
        offset: number;
      },
      context: { userId?: string }
    ) => {
      // Use valid recognitions only
      let recognitions = dataStore.getValidRecognitions();

      // Apply filters
      if (recipientId) {
        recognitions = recognitions.filter(
          (r) => r.recipientId === recipientId
        );
      }

      if (senderId) {
        recognitions = recognitions.filter((r) => r.senderId === senderId);
      }

      if (visibility) {
        recognitions = recognitions.filter((r) => r.visibility === visibility);
      }

      if (department) {
        recognitions = recognitions.filter((r) => {
          const recipient = dataStore.getUser(r.recipientId);
          return recipient?.department === department;
        });
      }

      if (keywords && keywords.length > 0) {
        recognitions = recognitions.filter((r) =>
          keywords.some((keyword) =>
            r.keywords.some((k) =>
              k.toLowerCase().includes(keyword.toLowerCase())
            )
          )
        );
      }

      // Filter by visibility permissions
      recognitions = recognitions.filter((r) =>
        canViewRecognition(r, context.userId)
      );

      // Sort by creation date (newest first)
      recognitions.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Apply pagination
      return recognitions.slice(offset, offset + limit);
    },

    searchRecognitions: (
      _: any,
      { query }: { query: string },
      context: { userId?: string }
    ) => {
      const recognitions = dataStore.getAllRecognitions();
      const searchTerm = query.toLowerCase();

      return recognitions
        .filter((r) => canViewRecognition(r, context.userId))
        .filter(
          (r) =>
            r.message.toLowerCase().includes(searchTerm) ||
            r.keywords.some((k) => k.toLowerCase().includes(searchTerm))
        );
    },
  },

  Mutation: {
    createRecognition: (
      _: any,
      { input }: { input: CreateRecognitionInput },
      context: { userId?: string }
    ) => {
      if (!context.userId) {
        throw new Error("Authentication required");
      }

      // Extract keywords from message if not provided
      const extractedKeywords =
        input.keywords.length > 0
          ? input.keywords
          : extractKeywordsFromMessage(input.message);

      const recognition: Recognition = {
        id: uuidv4(),
        message: input.message,
        emojis: input.emojis,
        visibility: input.visibility,
        isAnonymous: input.isAnonymous || false,
        senderId: input.isAnonymous ? undefined : context.userId,
        recipientId: input.recipientId,
        keywords: extractedKeywords,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return dataStore.addRecognition(recognition);
    },

    updateRecognition: (
      _: any,
      { input }: { input: UpdateRecognitionInput },
      context: { userId?: string }
    ) => {
      if (!context.userId) {
        throw new Error("Authentication required");
      }

      const recognition = dataStore.getRecognition(input.id);
      if (!recognition) {
        throw new Error("Recognition not found");
      }

      // Check if user can edit (sender or admin)
      if (
        recognition.senderId !== context.userId &&
        !isAdminUser(context.userId)
      ) {
        throw new Error("Not authorized to edit this recognition");
      }

      const updatedRecognition: Recognition = {
        ...recognition,
        message: input.message ?? recognition.message,
        emojis: input.emojis ?? recognition.emojis,
        visibility: input.visibility ?? recognition.visibility,
        keywords: input.keywords ?? recognition.keywords,
        updatedAt: new Date().toISOString(),
      };

      return dataStore.addRecognition(updatedRecognition);
    },

    deleteRecognition: (
      _: any,
      { id }: { id: string },
      context: { userId?: string }
    ) => {
      if (!context.userId) {
        throw new Error("Authentication required");
      }

      const recognition = dataStore.getRecognition(id);
      if (!recognition) {
        return false;
      }

      // Check if user can delete (sender or admin)
      if (
        recognition.senderId !== context.userId &&
        !isAdminUser(context.userId)
      ) {
        throw new Error("Not authorized to delete this recognition");
      }

      // In a real implementation, we'd have a delete method
      // For now, we'll just return true
      return true;
    },
  },

  // Update the Recognition type resolver section:

  Recognition: {
    sender: (parent: Recognition) => {
      if (parent.isAnonymous || !parent.senderId) return null;
      const sender = dataStore.getUser(parent.senderId);
      if (!sender) {
        console.warn(
          `Sender with ID ${parent.senderId} not found for recognition ${parent.id}`
        );
        return null;
      }
      return sender;
    },

    recipient: (parent: Recognition) => {
      const recipient = dataStore.getUser(parent.recipientId);
      if (!recipient) {
        console.error(
          `Recipient with ID ${parent.recipientId} not found for recognition ${parent.id}`
        );
        // Since recipient is non-nullable, we need to throw an error or return a placeholder
        throw new Error(`Recipient not found for recognition ${parent.id}`);
      }
      return recipient;
    },

    reactions: (parent: Recognition) => {
      return dataStore.getReactionsByRecognition(parent.id);
    },

    comments: (parent: Recognition) => {
      return []; // TODO: Implement comments
    },
  },
};

// Helper functions
function canViewRecognition(
  recognition: Recognition,
  userId?: string
): boolean {
  if (!userId) return false;

  switch (recognition.visibility) {
    case VisibilityType.PUBLIC:
      return true;
    case VisibilityType.PRIVATE:
      return (
        recognition.senderId === userId || recognition.recipientId === userId
      );
    case VisibilityType.TEAM_ONLY:
      const user = dataStore.getUser(userId);
      const recipient = dataStore.getUser(recognition.recipientId);
      return user?.department === recipient?.department;
    default:
      return false;
  }
}

function isAdminUser(userId?: string): boolean {
  if (!userId) return false;
  const user = dataStore.getUser(userId);
  return (
    user?.role === UserRole.HR || user?.role === UserRole.CROSS_FUNCTIONAL_LEAD
  );
}

function extractKeywordsFromMessage(message: string): string[] {
  // Simple keyword extraction - in production, you'd use NLP
  const words = message.toLowerCase().split(/\s+/);
  const stopWords = [
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
  ];
  return words
    .filter((word) => word.length > 3 && !stopWords.includes(word))
    .slice(0, 5); // Limit to 5 keywords
}
