"use client";

import { useQuery } from "@apollo/client";
import { GET_USERS } from "@/lib/queries";
import { useEffect } from "react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
}

interface UserSelectorProps {
  onUserSelect: (userId: string) => void;
  currentUserId?: string;
}

export default function UserSelector({
  onUserSelect,
  currentUserId,
}: UserSelectorProps) {
  const { data, loading, error } = useQuery(GET_USERS);

  useEffect(() => {
    // Set default user for demo
    if (data?.users?.length > 0 && !currentUserId) {
      const defaultUser = data.users[0];
      localStorage.setItem("userId", defaultUser.id);
      onUserSelect(defaultUser.id);
    }
  }, [data, currentUserId, onUserSelect]);

  if (loading) return <div>Loading users...</div>;
  if (error) return <div>Error loading users: {error.message}</div>;

  return (
    <div className="mb-6 p-4 bg-gray-100 rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Select Current User (Demo)</h3>
      <select
        value={currentUserId || ""}
        onChange={(e) => {
          const userId = e.target.value;
          localStorage.setItem("userId", userId);
          onUserSelect(userId);
        }}
        className="w-full p-2 border rounded"
      >
        <option value="">Select a user...</option>
        {data?.users?.map((user: User) => (
          <option key={user.id} value={user.id}>
            {user.name} ({user.role}) - {user.department}
          </option>
        ))}
      </select>
    </div>
  );
}
