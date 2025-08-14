import { dataStore } from "@/lib/data/store";
import { User, UserRole } from "@/lib/types";

export const userResolvers = {
  Query: {
    me: (_: any, __: any, context: { userId?: string }) => {
      console.log("me query called, userId:", context.userId);
      if (!context.userId) return null;
      const user = dataStore.getUser(context.userId);
      console.log("me query result:", user);
      return user;
    },

    user: (_: any, { id }: { id: string }) => {
      console.log("user query called, id:", id);
      const user = dataStore.getUser(id);
      console.log("user query result:", user);
      return user;
    },

    users: (
      _: any,
      { role, department }: { role?: UserRole; department?: string }
    ) => {
      console.log("users query called, role:", role, "department:", department);

      try {
        let users = dataStore.getAllUsers();
        console.log("All users from store:", users.length);

        if (role) {
          users = users.filter((user) => user.role === role);
          console.log("After role filter:", users.length);
        }

        if (department) {
          users = users.filter((user) => user.department === department);
          console.log("After department filter:", users.length);
        }

        console.log("Final users result:", users);
        return users;
      } catch (error) {
        console.error("Error in users resolver:", error);
        throw error;
      }
    },
  },

  User: {
    manager: (parent: User) => {
      console.log("manager resolver called for user:", parent.id);
      if (!parent.managerId) return null;
      return dataStore.getUser(parent.managerId);
    },
  },
};
