"use client";

import { useQuery } from "@apollo/client";
import { GET_RECOGNITIONS } from "@/lib/queries";
import { useState, useEffect, useRef } from "react";

interface RealtimeNotificationsProps {
  currentUserId?: string;
}

export default function RealtimeNotifications({
  currentUserId,
}: RealtimeNotificationsProps) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [lastRecognitionCount, setLastRecognitionCount] = useState(0);
  const previousRecognitions = useRef<any[]>([]);

  // Poll for new recognitions every 5 seconds when enabled
  const { data, error } = useQuery(GET_RECOGNITIONS, {
    variables: { limit: 50 },
    pollInterval: isEnabled ? 5000 : 0,
    skip: !isEnabled || !currentUserId,
    fetchPolicy: "cache-and-network", // always check for updates
  });

  useEffect(() => {
    if (data?.recognitions && isEnabled) {
      const currentRecognitions = data.recognitions;

      // check for new recognitions
      if (previousRecognitions.current.length > 0) {
        const newRecognitions = currentRecognitions.filter(
          (current: any) =>
            !previousRecognitions.current.some(
              (prev: any) => prev.id === current.id
            )
        );

        // add notifications for new recognitions
        newRecognitions.forEach((recognition: any) => {
          //only notify if it's for the current user or if they can see it
          const isForCurrentUser = recognition.recipientId === currentUserId;
          const isFromCurrentUser = recognition.senderId === currentUserId;
          const isPublic = recognition.visibility === "PUBLIC";

          if (isForCurrentUser || (isPublic && !isFromCurrentUser)) {
            const newNotification = {
              ...recognition,
              timestamp: Date.now(),
              type: isForCurrentUser ? "received" : "public",
            };

            setNotifications((prev) => [newNotification, ...prev.slice(0, 4)]); // Keep last 5

            //auto-remove after 8 seconds
            setTimeout(() => {
              setNotifications((prev) =>
                prev.filter((n) => n.timestamp !== newNotification.timestamp)
              );
            }, 8000);
          }
        });
      }

      previousRecognitions.current = currentRecognitions;
      setLastRecognitionCount(currentRecognitions.length);
    }
  }, [data, isEnabled, currentUserId]);

  if (!currentUserId) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      <div className="bg-white p-3 rounded-lg shadow-lg border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-sm">Real-time Updates</h3>
          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`px-2 py-1 text-xs rounded ${
              isEnabled
                ? "bg-green-100 text-green-800"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {isEnabled ? "ON" : "OFF"}
          </button>
        </div>

        {isEnabled && (
          <div className="space-y-1">
            <p className="text-green-600 text-xs">Polling every 5 seconds</p>
            <p className="text-gray-500 text-xs">
              (WebSocket subscriptions fallback)
            </p>
            {data && (
              <p className="text-blue-600 text-xs">
                Monitoring {data.recognitions?.length || 0} recognitions
              </p>
            )}
          </div>
        )}

        {error && (
          <p className="text-red-500 text-xs">Error: {error.message}</p>
        )}
      </div>

      {notifications.map((notification) => (
        <div
          key={notification.timestamp}
          className={`p-3 rounded-lg shadow-lg max-w-sm animate-slide-in ${
            notification.type === "received"
              ? "bg-blue-500 text-white"
              : "bg-green-500 text-white"
          }`}
        >
          <div className="text-sm font-semibold">
            {notification.type === "received"
              ? "You got recognized!"
              : "New Recognition!"}
          </div>
          <div className="text-xs">
            {notification.isAnonymous ? "Someone" : notification.sender?.name}{" "}
            recognized {notification.recipient.name}
          </div>
          <div className="text-xs opacity-75 mt-1">
            "{notification.message.substring(0, 50)}
            {notification.message.length > 50 ? "..." : ""}"
          </div>
          <div className="flex gap-1 mt-1">
            {notification.emojis?.map((emoji: string, index: number) => (
              <span key={index} className="text-sm">
                {emoji}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
