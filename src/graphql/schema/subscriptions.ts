import { gql } from "graphql-tag";

export const subscriptions = gql`
  type Subscription {
    # Real-time recognition notifications
    recognitionCreated(userId: ID): Recognition!
    recognitionUpdated(recognitionId: ID!): Recognition!

    # Real-time reactions and comments
    reactionAdded(recognitionId: ID!): Reaction!
    commentAdded(recognitionId: ID!): Comment!

    # Batch notifications (fallback for real-time)
    batchNotifications(userId: ID!): [Recognition!]!
  }
`;
