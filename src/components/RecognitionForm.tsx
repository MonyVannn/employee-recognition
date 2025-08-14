"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client";
import { CREATE_RECOGNITION, GET_USERS, GET_RECOGNITIONS } from "@/lib/queries";

interface RecognitionFormProps {
  currentUserId?: string;
}

export default function RecognitionForm({
  currentUserId,
}: RecognitionFormProps) {
  const [message, setMessage] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [visibility, setVisibility] = useState("PUBLIC");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [emojis, setEmojis] = useState<string[]>([]);
  const [keywords, setKeywords] = useState("");

  const { data: usersData } = useQuery(GET_USERS);
  const [createRecognition, { loading, error }] = useMutation(
    CREATE_RECOGNITION,
    {
      refetchQueries: [{ query: GET_RECOGNITIONS }],
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUserId) {
      alert("Please select a user first");
      return;
    }

    try {
      await createRecognition({
        variables: {
          input: {
            message,
            recipientId,
            visibility,
            isAnonymous,
            emojis,
            keywords: keywords
              .split(",")
              .map((k) => k.trim())
              .filter((k) => k),
          },
        },
      });

      setMessage("");
      setRecipientId("");
      setEmojis([]);
      setKeywords("");
      alert("Recognition created successfully!");
    } catch (err) {
      console.error("Error creating recognition:", err);
    }
  };

  const toggleEmoji = (emoji: string) => {
    setEmojis((prev) =>
      prev.includes(emoji) ? prev.filter((e) => e !== emoji) : [...prev, emoji]
    );
  };

  const availableEmojis = ["👏", "🚀", "💪", "🌟", "🎉", "❤️", "🔥", "💯"];

  return (
    <div className="mb-8 p-6 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Send Recognition</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Recipient</label>
          <select
            value={recipientId}
            onChange={(e) => setRecipientId(e.target.value)}
            required
            className="w-full p-2 border rounded"
          >
            <option value="">Select recipient...</option>
            {usersData?.users
              ?.filter((user: any) => user.id !== currentUserId)
              .map((user: any) => (
                <option key={user.id} value={user.id}>
                  {user.name} - {user.department}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            rows={3}
            className="w-full p-2 border rounded"
            placeholder="Write your recognition message..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Emojis</label>
          <div className="flex flex-wrap gap-2">
            {availableEmojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => toggleEmoji(emoji)}
                className={`p-2 text-xl border rounded ${
                  emojis.includes(emoji)
                    ? "bg-blue-100 border-blue-300"
                    : "bg-gray-50"
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Visibility</label>
          <select
            value={visibility}
            onChange={(e) => setVisibility(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="PUBLIC">Public</option>
            <option value="PRIVATE">Private</option>
            <option value="TEAM_ONLY">Team Only</option>
          </select>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="mr-2"
            />
            Send anonymously
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Keywords (comma-separated)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="teamwork, project, leadership"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? "Sending..." : "Send Recognition"}
        </button>

        {error && (
          <div className="text-red-500 text-sm">Error: {error.message}</div>
        )}
      </form>
    </div>
  );
}
