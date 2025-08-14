"use client";

import { useQuery } from "@apollo/client";
import { GET_RECOGNITIONS } from "@/lib/queries";

export default function RecognitionList() {
  const { data, loading, error, refetch } = useQuery(GET_RECOGNITIONS, {
    variables: { limit: 10 },
    pollInterval: 5000, //poll every 5 sec for demo
  });

  if (loading) return <div>Loading recognitions...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Recent Recognitions</h2>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Refresh
        </button>
      </div>

      {data?.recognitions?.length === 0 ? (
        <div className="text-gray-500 text-center py-8">
          No recognitions yet. Send the first one!
        </div>
      ) : (
        <div className="space-y-4">
          {data?.recognitions?.map((recognition: any) => (
            <div
              key={recognition.id}
              className="bg-white p-4 rounded-lg shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-semibold">
                    {recognition.isAnonymous
                      ? "Anonymous"
                      : recognition.sender?.name || "Unknown"}
                  </span>
                  <span className="text-gray-500"> → </span>
                  <span className="font-semibold">
                    {recognition.recipient.name}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  {new Date(recognition.createdAt).toLocaleDateString()}
                </div>
              </div>

              <p className="mb-2">{recognition.message}</p>

              {recognition.emojis.length > 0 && (
                <div className="flex gap-1 mb-2">
                  {recognition.emojis.map((emoji: string, index: number) => (
                    <span key={index} className="text-lg">
                      {emoji}
                    </span>
                  ))}
                </div>
              )}

              {recognition.keywords.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-2">
                  {recognition.keywords.map(
                    (keyword: string, index: number) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Visibility: {recognition.visibility}</span>
                {recognition.reactions.length > 0 && (
                  <span>{recognition.reactions.length} reactions</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
