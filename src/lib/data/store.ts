import { User, Recognition, Reaction, Comment } from "@/lib/types";

class DataStore {
  private users: Map<string, User> = new Map();
  private recognitions: Map<string, Recognition> = new Map();
  private reactions: Map<string, Reaction> = new Map();
  private comments: Map<string, Comment> = new Map();

  // User methods
  addUser(user: User): User {
    this.users.set(user.id, user);
    return user;
  }

  getUser(id: string): User | undefined {
    return this.users.get(id);
  }

  getAllUsers(): User[] {
    return Array.from(this.users.values());
  }

  // Recognition methods with validation
  addRecognition(recognition: Recognition): Recognition {
    // Validate that recipient exists
    const recipient = this.getUser(recognition.recipientId);
    if (!recipient) {
      throw new Error(
        `Cannot create recognition: recipient with ID ${recognition.recipientId} not found`
      );
    }

    // Validate that sender exists (if not anonymous)
    if (!recognition.isAnonymous && recognition.senderId) {
      const sender = this.getUser(recognition.senderId);
      if (!sender) {
        throw new Error(
          `Cannot create recognition: sender with ID ${recognition.senderId} not found`
        );
      }
    }

    this.recognitions.set(recognition.id, recognition);
    return recognition;
  }

  getRecognition(id: string): Recognition | undefined {
    return this.recognitions.get(id);
  }

  getAllRecognitions(): Recognition[] {
    return Array.from(this.recognitions.values());
  }

  // Get valid recognitions (where both sender and recipient exist)
  getValidRecognitions(): Recognition[] {
    return this.getAllRecognitions().filter((recognition) => {
      const recipient = this.getUser(recognition.recipientId);
      if (!recipient) {
        console.warn(
          `Filtering out recognition ${recognition.id}: recipient not found`
        );
        return false;
      }

      if (!recognition.isAnonymous && recognition.senderId) {
        const sender = this.getUser(recognition.senderId);
        if (!sender) {
          console.warn(
            `Filtering out recognition ${recognition.id}: sender not found`
          );
          return false;
        }
      }

      return true;
    });
  }

  // Reaction methods
  addReaction(reaction: Reaction): Reaction {
    // Validate that recognition exists
    const recognition = this.getRecognition(reaction.recognitionId);
    if (!recognition) {
      throw new Error(
        `Cannot add reaction: recognition with ID ${reaction.recognitionId} not found`
      );
    }

    // Validate that user exists
    const user = this.getUser(reaction.userId);
    if (!user) {
      throw new Error(
        `Cannot add reaction: user with ID ${reaction.userId} not found`
      );
    }

    this.reactions.set(reaction.id, reaction);
    return reaction;
  }

  getReactionsByRecognition(recognitionId: string): Reaction[] {
    return Array.from(this.reactions.values()).filter(
      (r) => r.recognitionId === recognitionId
    );
  }

  // Clean up orphaned data
  cleanup(): void {
    const validUserIds = new Set(this.users.keys());

    // Remove recognitions with invalid users
    for (const [id, recognition] of this.recognitions.entries()) {
      const recipientExists = validUserIds.has(recognition.recipientId);
      const senderExists =
        recognition.isAnonymous ||
        !recognition.senderId ||
        validUserIds.has(recognition.senderId);

      if (!recipientExists || !senderExists) {
        console.log(`Removing invalid recognition ${id}`);
        this.recognitions.delete(id);
      }
    }

    // Remove reactions with invalid users or recognitions
    const validRecognitionIds = new Set(this.recognitions.keys());
    for (const [id, reaction] of this.reactions.entries()) {
      const userExists = validUserIds.has(reaction.userId);
      const recognitionExists = validRecognitionIds.has(reaction.recognitionId);

      if (!userExists || !recognitionExists) {
        console.log(`Removing invalid reaction ${id}`);
        this.reactions.delete(id);
      }
    }
  }
}

export const dataStore = new DataStore();
