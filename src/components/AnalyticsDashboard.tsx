"use client";

import { useQuery } from "@apollo/client";
import { GET_ANALYTICS } from "@/lib/queries";
import { useState } from "react";

interface AnalyticsDashboardProps {
  currentUserId?: string;
}

export default function AnalyticsDashboard({
  currentUserId,
}: AnalyticsDashboardProps) {
  const [department, setDepartment] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const { data, loading, error, refetch } = useQuery(GET_ANALYTICS, {
    variables: { department: department || undefined, dateFrom, dateTo },
    skip: !currentUserId,
  });

  if (!currentUserId) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Analytics Dashboard</h2>
        <p className="text-gray-500">Please select a user to view analytics</p>
      </div>
    );
  }

  if (loading) return <div>Loading analytics...</div>;

  if (error) {
    return (
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Analytics Dashboard</h2>
        <div className="text-red-500">
          {error.message.includes("Not authorized")
            ? "You need manager, HR, or cross-functional lead permissions to view analytics"
            : `Error: ${error.message}`}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Analytics Dashboard</h2>

      {/* Filters */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Marketing">Marketing</option>
            <option value="Sales">Sales</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">From Date</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">To Date</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <button
        onClick={() => refetch()}
        className="mb-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Refresh Analytics
      </button>

      {data?.analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 p-4 rounded">
              <h3 className="font-semibold text-blue-800">
                Total Recognitions
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {data.analytics.totalRecognitions}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Recognitions by Team</h3>
            <div className="space-y-2">
              {data.analytics.recognitionsByTeam.map((team: any) => (
                <div
                  key={team.department}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded"
                >
                  <span className="font-medium">{team.department}</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {team.count} recognitions
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Top Keywords</h3>
            <div className="flex flex-wrap gap-2">
              {data.analytics.recognitionsByKeyword.map((keyword: any) => (
                <span
                  key={keyword.keyword}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                >
                  {keyword.keyword} ({keyword.count})
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3">Top Recognizers</h3>
              <div className="space-y-2">
                {data.analytics.topRecognizers.map(
                  (recognizer: any, index: number) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-2 bg-yellow-50 rounded"
                    >
                      <span>
                        <span className="font-medium">#{index + 1}</span>{" "}
                        {recognizer.user.name}
                      </span>
                      <span className="text-yellow-700 font-semibold">
                        {recognizer.count} sent
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3">Top Recipients</h3>
              <div className="space-y-2">
                {data.analytics.topRecipients.map(
                  (recipient: any, index: number) => (
                    <div
                      key={recipient.user.id}
                      className="flex justify-between items-center p-2 bg-purple-50 rounded"
                    >
                      <span>
                        <span className="font-medium">#{index + 1}</span>{" "}
                        {recipient.user.name}
                      </span>
                      <span className="text-purple-700 font-semibold">
                        {recipient.count} received
                      </span>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
