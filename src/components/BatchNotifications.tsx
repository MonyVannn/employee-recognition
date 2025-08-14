"use client";

import { useQuery } from "@apollo/client";
import { GET_RECOGNITIONS } from "@/lib/queries";
import { useState, useEffect } from "react";

interface BatchNotificationsProps {
  currentUserId?: string;
}

export default function BatchNotifications({
  currentUserId,
}: BatchNotificationsProps) {
  const [lastBatchTime, setLastBatchTime] = useState<Date>(new Date());
  const [batchNotifications, setBatchNotifications] = useState<any[]>([]);
  const [showBatch, setShowBatch] = useState(false);

  // Query for recognitions since last batch
  const { data, refetch } = useQuery(GET_RECOGNITIONS, {
    variables: { limit: 100 },
    skip: !currentUserId,
    fetchPolicy: "network-only",
  });

  // Check for batch updates every 10 minutes
  useEffect(() => {
    if (!currentUserId) return;

    const interval = setInterval(() => {
      checkForBatchUpdates();
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearInterval(interval);
  }, [currentUserId, lastBatchTime]);

  const checkForBatchUpdates = async () => {
    const result = await refetch();

    if (result.data?.recognitions) {
      const newRecognitions = result.data.recognitions.filter(
        (recognition: any) => {
          const recognitionDate = new Date(recognition.createdAt);
          return (
            recognitionDate > lastBatchTime &&
            (recognition.recipientId === currentUserId ||
              recognition.visibility === "PUBLIC")
          );
        }
      );

      if (newRecognitions.length > 0) {
        setBatchNotifications(newRecognitions);
        setShowBatch(true);
        setLastBatchTime(new Date());
      }
    }
  };

  const dismissBatch = () => {
    setShowBatch(false);
    setBatchNotifications([]);
  };

  if (!showBatch || batchNotifications.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm">
      <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-lg p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm text-gray-800">
            📬 Batch Update ({batchNotifications.length} new)
          </h3>
          <button
            onClick={dismissBatch}
            className="text-gray-400 hover:text-gray-600 text-lg leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {batchNotifications.slice(0, 5).map((recognition: any) => (
            <div
              key={recognition.id}
              className="text-xs p-2 bg-gray-50 rounded"
            >
              <div className="font-medium">
                {recognition.isAnonymous
                  ? "Anonymous"
                  : recognition.sender?.name}{" "}
                → {recognition.recipient.name}
              </div>
              <div className="text-gray-600 mt-1">
                {recognition.message.substring(0, 60)}...
              </div>
            </div>
          ))}

          {batchNotifications.length > 5 && (
            <div className="text-xs text-gray-500 text-center">
              +{batchNotifications.length - 5} more recognitions
            </div>
          )}
        </div>

        <div className="mt-3 text-xs text-gray-500">
          Last checked: {lastBatchTime.toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}
