import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query GetUsers($role: UserRole, $department: String) {
    users(role: $role, department: $department) {
      id
      name
      email
      role
      department
    }
  }
`;

export const GET_RECOGNITIONS = gql`
  query GetRecognitions(
    $recipientId: ID
    $senderId: ID
    $visibility: VisibilityType
    $limit: Int
    $offset: Int
  ) {
    recognitions(
      recipientId: $recipientId
      senderId: $senderId
      visibility: $visibility
      limit: $limit
      offset: $offset
    ) {
      id
      message
      emojis
      visibility
      isAnonymous
      keywords
      createdAt
      sender {
        id
        name
        email
      }
      recipient {
        id
        name
        email
      }
      reactions {
        id
        emoji
        user {
          name
        }
      }
    }
  }
`;

export const CREATE_RECOGNITION = gql`
  mutation CreateRecognition($input: CreateRecognitionInput!) {
    createRecognition(input: $input) {
      id
      message
      emojis
      visibility
      isAnonymous
      keywords
      createdAt
      sender {
        name
      }
      recipient {
        name
      }
    }
  }
`;

export const GET_ANALYTICS = gql`
  query GetAnalytics($department: String, $dateFrom: String, $dateTo: String) {
    analytics(department: $department, dateFrom: $dateFrom, dateTo: $dateTo) {
      totalRecognitions
      recognitionsByTeam {
        department
        count
      }
      recognitionsByKeyword {
        keyword
        count
      }
      topRecognizers {
        user {
          name
        }
        count
      }
      topRecipients {
        user {
          name
        }
        count
      }
    }
  }
`;
