import { gql } from "graphql-tag";

export const typeDefs = gql`
  enum UserRole {
    EMPLOYEE
    MANAGER
    HR
    CROSS_FUNCTIONAL_LEAD
  }

  enum VisibilityType {
    PUBLIC
    PRIVATE
    TEAM_ONLY
  }

  type User {
    id: ID!
    email: String!
    name: String!
    role: UserRole!
    department: String
    managerId: ID
    manager: User
    createdAt: String!
  }

  type Recognition {
    id: ID!
    message: String!
    emojis: [String!]!
    visibility: VisibilityType!
    isAnonymous: Boolean!
    sender: User
    recipient: User!
    keywords: [String!]!
    createdAt: String!
    updatedAt: String!
    reactions: [Reaction!]!
    comments: [Comment!]!
  }

  type Reaction {
    id: ID!
    recognition: Recognition!
    user: User!
    emoji: String!
    createdAt: String!
  }

  type Comment {
    id: ID!
    recognition: Recognition!
    user: User!
    message: String!
    createdAt: String!
  }

  type AnalyticsData {
    totalRecognitions: Int!
    recognitionsByTeam: [TeamRecognitionCount!]!
    recognitionsByKeyword: [KeywordCount!]!
    topRecognizers: [UserRecognitionCount!]!
    topRecipients: [UserRecognitionCount!]!
  }

  type TeamRecognitionCount {
    department: String!
    count: Int!
  }

  type KeywordCount {
    keyword: String!
    count: Int!
  }

  type UserRecognitionCount {
    user: User!
    count: Int!
  }
`;
