import { v4 as uuidv4 } from "uuid";
import { dataStore } from "@/lib/data/store";
import { Reaction, Comment } from "@/lib/types";
import { publishReactionAdded, publishCommentAdded } from "./subscriptions";

interface AddReactionInput {
  recognitionId: string;
  emoji: string;
}

interface AddCommentInput {
  recognitionId: string;
  message: string;
}

export const reactionResolvers = {
  Mutation: {
    addReaction: (
      _: any,
      { input }: { input: AddReactionInput },
      context: { userId?: string }
    ) => {
      if (!context.userId) {
        throw new Error("Authentication required");
      }

      const recognition = dataStore.getRecognition(input.recognitionId);
      if (!recognition) {
        throw new Error("Recognition not found");
      }

      const reaction: Reaction = {
        id: uuidv4(),
        recognitionId: input.recognitionId,
        userId: context.userId,
        emoji: input.emoji,
        createdAt: new Date().toISOString(),
      };

      const savedReaction = dataStore.addReaction(reaction);

      publishReactionAdded(savedReaction);

      return savedReaction;
    },

    removeReaction: (
      _: any,
      { recognitionId, emoji }: { recognitionId: string; emoji: string },
      context: { userId?: string }
    ) => {
      if (!context.userId) {
        throw new Error("Authentication required");
      }

      return true;
    },

    addComment: (
      _: any,
      { input }: { input: AddCommentInput },
      context: { userId?: string }
    ) => {
      if (!context.userId) {
        throw new Error("Authentication required");
      }

      const recognition = dataStore.getRecognition(input.recognitionId);
      if (!recognition) {
        throw new Error("Recognition not found");
      }

      const comment: Comment = {
        id: uuidv4(),
        recognitionId: input.recognitionId,
        userId: context.userId,
        message: input.message,
        createdAt: new Date().toISOString(),
      };

      publishCommentAdded(comment);

      return comment;
    },

    deleteComment: (
      _: any,
      { id }: { id: string },
      context: { userId?: string }
    ) => {
      if (!context.userId) {
        throw new Error("Authentication required");
      }

      return true;
    },
  },

  Reaction: {
    recognition: (parent: Reaction) => {
      return dataStore.getRecognition(parent.recognitionId);
    },

    user: (parent: Reaction) => {
      return dataStore.getUser(parent.userId);
    },
  },

  Comment: {
    recognition: (parent: Comment) => {
      return dataStore.getRecognition(parent.recognitionId);
    },

    user: (parent: Comment) => {
      return dataStore.getUser(parent.userId);
    },
  },
};
