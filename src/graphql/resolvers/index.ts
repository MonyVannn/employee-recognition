import { userResolvers } from "./user";
import { recognitionResolvers } from "./recognition";
import { analyticsResolvers } from "./analytics";
import { subscriptionResolvers } from "./subscriptions";
import { reactionResolvers } from "./reactions";

export const resolvers = {
  Query: {
    ...userResolvers.Query,
    ...recognitionResolvers.Query,
    ...analyticsResolvers.Query,
  },

  Mutation: {
    ...recognitionResolvers.Mutation,
    ...reactionResolvers.Mutation,
  },

  Subscription: {
    ...subscriptionResolvers.Subscription,
  },

  User: {
    ...userResolvers.User,
  },

  Recognition: {
    ...recognitionResolvers.Recognition,
  },

  Reaction: {
    ...reactionResolvers.Reaction,
  },

  Comment: {
    ...reactionResolvers.Comment,
  },
};
