import { gql } from "graphql-tag";

export const mutations = gql`
  input CreateRecognitionInput {
    message: String!
    emojis: [String!]!
    visibility: VisibilityType!
    isAnonymous: Boolean = false
    recipientId: ID!
    keywords: [String!]
  }

  input UpdateRecognitionInput {
    id: ID!
    message: String
    emojis: [String!]
    visibility: VisibilityType
    keywords: [String!]
  }

  input AddReactionInput {
    recognitionId: ID!
    emoji: String!
  }

  input AddCommentInput {
    recognitionId: ID!
    message: String!
  }

  type Mutation {
    # Recognition mutations
    createRecognition(input: CreateRecognitionInput!): Recognition!
    updateRecognition(input: UpdateRecognitionInput!): Recognition!
    deleteRecognition(id: ID!): Boolean!

    # Interaction mutations
    addReaction(input: AddReactionInput!): Reaction!
    removeReaction(recognitionId: ID!, emoji: String!): Boolean!
    addComment(input: AddCommentInput!): Comment!
    deleteComment(id: ID!): Boolean!
  }
`;
