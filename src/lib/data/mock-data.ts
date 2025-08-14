import { v4 as uuidv4 } from "uuid";
import { User, Recognition, UserRole, VisibilityType } from "@/lib/types";
import { dataStore } from "./store";

// Sample users
const mockUsers: User[] = [
  {
    id: uuidv4(),
    email: "john.doe@company.com",
    name: "John Doe",
    role: UserRole.EMPLOYEE,
    department: "Engineering",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    email: "jane.smith@company.com",
    name: "Jane Smith",
    role: UserRole.MANAGER,
    department: "Engineering",
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    email: "hr.admin@company.com",
    name: "HR Admin",
    role: UserRole.HR,
    department: "Human Resources",
    createdAt: new Date().toISOString(),
  },
];

export function initializeMockData() {
  try {
    console.log("Adding mock users...");

    // Add users first
    mockUsers.forEach((user, index) => {
      console.log(`Adding user ${index + 1}:`, user.name);
      dataStore.addUser(user);
    });

    // Then add recognitions (they depend on users existing)
    const mockRecognitions: Recognition[] = [
      {
        id: uuidv4(),
        message: "Great job on the project delivery! 🚀",
        emojis: ["🚀", "👏"],
        visibility: VisibilityType.PUBLIC,
        isAnonymous: false,
        senderId: mockUsers[1].id,
        recipientId: mockUsers[0].id,
        keywords: ["project", "delivery"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    console.log("Adding mock recognitions...");
    mockRecognitions.forEach((recognition, index) => {
      console.log(`Adding recognition ${index + 1}`);
      dataStore.addRecognition(recognition);
    });

    // Clean up any orphaned data
    dataStore.cleanup();

    console.log("Mock data initialized successfully");
    console.log("Total users:", dataStore.getAllUsers().length);
    console.log(
      "Total valid recognitions:",
      dataStore.getValidRecognitions().length
    );
  } catch (error) {
    console.error("Error initializing mock data:", error);
    throw error;
  }
}
