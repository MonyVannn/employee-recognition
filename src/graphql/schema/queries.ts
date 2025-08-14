import { gql } from "graphql-tag";

export const queries = gql`
  type Query {
    # User queries
    me: User
    user(id: ID!): User
    users(role: UserRole, department: String): [User!]!

    # Recognition queries
    recognition(id: ID!): Recognition
    recognitions(
      recipientId: ID
      senderId: ID
      visibility: VisibilityType
      department: String
      keywords: [String!]
      limit: Int = 20
      offset: Int = 0
    ): [Recognition!]!

    # Analytics queries (role-based access)
    analytics(
      department: String
      dateFrom: String
      dateTo: String
    ): AnalyticsData!

    # Search
    searchRecognitions(query: String!): [Recognition!]!
  }
`;
