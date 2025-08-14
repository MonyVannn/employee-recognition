export enum UserRole {
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
  HR = "HR",
  CROSS_FUNCTIONAL_LEAD = "CROSS_FUNCTIONAL_LEAD",
}

export enum VisibilityType {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  TEAM_ONLY = "TEAM_ONLY",
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  department?: string;
  managerId?: string;
  createdAt: string;
}

export interface Recognition {
  id: string;
  message: string;
  emojis: string[];
  visibility: VisibilityType;
  isAnonymous: boolean;
  senderId?: string;
  recipientId: string;
  keywords: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  recognitionId: string;
  userId: string;
  emoji: string;
  createdAt: string;
}

export interface Comment {
  id: string;
  recognitionId: string;
  userId: string;
  message: string;
  createdAt: string;
}
