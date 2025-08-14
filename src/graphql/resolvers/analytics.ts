import { dataStore } from "@/lib/data/store";
import { UserRole } from "@/lib/types";

export const analyticsResolvers = {
  Query: {
    analytics: (
      _: any,
      {
        department,
        dateFrom,
        dateTo,
      }: {
        department?: string;
        dateFrom?: string;
        dateTo?: string;
      },
      context: { userId?: string }
    ) => {
      if (!context.userId) {
        throw new Error("Authentication required");
      }

      const user = dataStore.getUser(context.userId);
      if (!user || !canAccessAnalytics(user.role)) {
        throw new Error("Not authorized to access analytics");
      }

      let recognitions = dataStore.getAllRecognitions();

      // Apply filters
      if (department) {
        recognitions = recognitions.filter((r) => {
          const recipient = dataStore.getUser(r.recipientId);
          return recipient?.department === department;
        });
      }

      if (dateFrom) {
        recognitions = recognitions.filter(
          (r) => new Date(r.createdAt) >= new Date(dateFrom)
        );
      }

      if (dateTo) {
        recognitions = recognitions.filter(
          (r) => new Date(r.createdAt) <= new Date(dateTo)
        );
      }

      return {
        totalRecognitions: recognitions.length,
        recognitionsByTeam: calculateTeamStats(recognitions),
        recognitionsByKeyword: calculateKeywordStats(recognitions),
        topRecognizers: calculateTopRecognizers(recognitions),
        topRecipients: calculateTopRecipients(recognitions),
      };
    },
  },
};

function canAccessAnalytics(role: UserRole): boolean {
  return [
    UserRole.MANAGER,
    UserRole.HR,
    UserRole.CROSS_FUNCTIONAL_LEAD,
  ].includes(role);
}

function calculateTeamStats(recognitions: any[]) {
  const teamCounts: { [key: string]: number } = {};

  recognitions.forEach((recognition) => {
    const recipient = dataStore.getUser(recognition.recipientId);
    if (recipient?.department) {
      teamCounts[recipient.department] =
        (teamCounts[recipient.department] || 0) + 1;
    }
  });

  return Object.entries(teamCounts).map(([department, count]) => ({
    department,
    count,
  }));
}

function calculateKeywordStats(recognitions: any[]) {
  const keywordCounts: { [key: string]: number } = {};

  recognitions.forEach((recognition) => {
    recognition.keywords.forEach((keyword: string) => {
      keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1;
    });
  });

  return Object.entries(keywordCounts)
    .map(([keyword, count]) => ({ keyword, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10); // Top 10 keywords
}

function calculateTopRecognizers(recognitions: any[]) {
  const recognizerCounts: { [key: string]: number } = {};

  recognitions.forEach((recognition) => {
    if (recognition.senderId) {
      recognizerCounts[recognition.senderId] =
        (recognizerCounts[recognition.senderId] || 0) + 1;
    }
  });

  return Object.entries(recognizerCounts)
    .map(([userId, count]) => ({
      user: dataStore.getUser(userId),
      count,
    }))
    .filter((item) => item.user)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

function calculateTopRecipients(recognitions: any[]) {
  const recipientCounts: { [key: string]: number } = {};

  recognitions.forEach((recognition) => {
    recipientCounts[recognition.recipientId] =
      (recipientCounts[recognition.recipientId] || 0) + 1;
  });

  return Object.entries(recipientCounts)
    .map(([userId, count]) => ({
      user: dataStore.getUser(userId),
      count,
    }))
    .filter((item) => item.user)
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
