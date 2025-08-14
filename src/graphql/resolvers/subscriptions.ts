import { PubSub } from "graphql-subscriptions";
import { Recognition, Reaction, Comment } from "@/lib/types";

// In-memory pub/sub for this demo - in production use Redis or similar
export const pubsub = new PubSub();

// Subscription event types
export const SUBSCRIPTION_EVENTS = {
  RECOGNITION_CREATED: "RECOGNITION_CREATED",
  RECOGNITION_UPDATED: "RECOGNITION_UPDATED",
  REACTION_ADDED: "REACTION_ADDED",
  COMMENT_ADDED: "COMMENT_ADDED",
  BATCH_NOTIFICATIONS: "BATCH_NOTIFICATIONS",
} as const;

export const subscriptionResolvers = {
  Subscription: {
    recognitionCreated: {
      subscribe: (_: any, { userId }: { userId?: string }) => {
        // If userId provided, filter for that user's notifications
        if (userId) {
          return pubsub.asyncIterator([
            `${SUBSCRIPTION_EVENTS.RECOGNITION_CREATED}_${userId}`,
          ]);
        }
        return pubsub.asyncIterator([SUBSCRIPTION_EVENTS.RECOGNITION_CREATED]);
      },
    },

    recognitionUpdated: {
      subscribe: (_: any, { recognitionId }: { recognitionId: string }) => {
        return pubsub.asyncIterator([
          `${SUBSCRIPTION_EVENTS.RECOGNITION_UPDATED}_${recognitionId}`,
        ]);
      },
    },

    reactionAdded: {
      subscribe: (_: any, { recognitionId }: { recognitionId: string }) => {
        return pubsub.asyncIterator([
          `${SUBSCRIPTION_EVENTS.REACTION_ADDED}_${recognitionId}`,
        ]);
      },
    },

    commentAdded: {
      subscribe: (_: any, { recognitionId }: { recognitionId: string }) => {
        return pubsub.asyncIterator([
          `${SUBSCRIPTION_EVENTS.COMMENT_ADDED}_${recognitionId}`,
        ]);
      },
    },

    batchNotifications: {
      subscribe: (_: any, { userId }: { userId: string }) => {
        return pubsub.asyncIterator([
          `${SUBSCRIPTION_EVENTS.BATCH_NOTIFICATIONS}_${userId}`,
        ]);
      },
    },
  },
};

// Helper functions to publish events
export const publishRecognitionCreated = (recognition: Recognition) => {
  // Publish to general feed
  pubsub.publish(SUBSCRIPTION_EVENTS.RECOGNITION_CREATED, {
    recognitionCreated: recognition,
  });

  // Publish to recipient's personal feed
  pubsub.publish(
    `${SUBSCRIPTION_EVENTS.RECOGNITION_CREATED}_${recognition.recipientId}`,
    {
      recognitionCreated: recognition,
    }
  );
};

export const publishRecognitionUpdated = (recognition: Recognition) => {
  pubsub.publish(
    `${SUBSCRIPTION_EVENTS.RECOGNITION_UPDATED}_${recognition.id}`,
    {
      recognitionUpdated: recognition,
    }
  );
};

export const publishReactionAdded = (reaction: Reaction) => {
  pubsub.publish(
    `${SUBSCRIPTION_EVENTS.REACTION_ADDED}_${reaction.recognitionId}`,
    {
      reactionAdded: reaction,
    }
  );
};

export const publishCommentAdded = (comment: Comment) => {
  pubsub.publish(
    `${SUBSCRIPTION_EVENTS.COMMENT_ADDED}_${comment.recognitionId}`,
    {
      commentAdded: comment,
    }
  );
};
