"use client";

import { useState } from "react";
import UserSelector from "@/components/UserSelector";
import RecognitionForm from "@/components/RecognitionForm";
import RecognitionList from "@/components/RecognitionList";
import AnalyticsDashboard from "@/components/AnalyticsDashboard";
import RealtimeNotifications from "@/components/RealtimeNotifications";
import BatchNotifications from "@/components/BatchNotifications";

export default function Home() {
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"feed" | "analytics">("feed");

  return (
    <div className="min-h-screen bg-gray-50">
      <RealtimeNotifications currentUserId={currentUserId} />
      <BatchNotifications currentUserId={currentUserId} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          Employee Recognition System
        </h1>

        <UserSelector
          onUserSelect={setCurrentUserId}
          currentUserId={currentUserId}
        />

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab("feed")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "feed"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Recognition Feed
              </button>
              <button
                onClick={() => setActiveTab("analytics")}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "analytics"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Analytics Dashboard
              </button>
            </nav>
          </div>
        </div>

        {activeTab === "feed" ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <RecognitionForm currentUserId={currentUserId} />
            </div>

            <div>
              <RecognitionList />
            </div>
          </div>
        ) : (
          <AnalyticsDashboard currentUserId={currentUserId} />
        )}
      </div>
    </div>
  );
}
