# Employee Recognition System

## Overview

This project implements a real-time employee recognition platform using **Next.js**, **Apollo Server**, and **GraphQL**.  
It satisfies the assessment requirements by providing:

- Recognition creation with messages, emojis, and visibility controls
- Role-based access control for sensitive data
- Real-time updates with a batch fallback mechanism
- Analytics for organizational insights
- An extensible architecture for future features

The implementation prioritizes **clean schema design**, **modular resolvers**, and **clear separation of concerns** between API, data layer, and UI.

---

## Technical Implementation

### 1. GraphQL API Design

**Approach:**
- Schema defined in modular SDL files: `types.ts`, `queries.ts`, `mutations.ts`, `subscriptions.ts`
- Enums (`UserRole`, `VisibilityType`) enforce valid values
- Non-nullable fields used where data integrity is guaranteed
- Nullable fields for optional relationships (e.g., `sender` in anonymous recognitions)

**Key Types:**
- `User`: Represents employees with role and department metadata
- `Recognition`: Core entity with message, emojis, visibility, and relationships
- `AnalyticsData`: Aggregated statistics for leadership insights

---

### 2. Resolver Architecture

**Approach:**
- Resolvers organized by domain (`user.ts`, `recognition.ts`, `analytics.ts`, `reactions.ts`, `subscriptions.ts`)
- Context-based authentication: `userId` extracted from `x-user-id` header
- Centralized visibility enforcement via `canViewRecognition()`
- Role checks via `isAdminUser()` and `canAccessAnalytics()`
- Validation before creating/updating recognitions to ensure referenced users exist

---

### 3. Data Layer

**Approach:**
- Implemented `DataStore` class with in-memory Maps for O(1) access
- Validation on insert to maintain referential integrity
- `cleanup()` method removes orphaned recognitions and reactions
- `getValidRecognitions()` filters out invalid data before returning results

**Trade-off:**
- In-memory storage chosen for simplicity; no persistence between restarts

---

### 4. Real-Time Updates Strategy

**Requirement:** "Real-time updates are a must… unless they’re hard. Then batch everything every 10 minutes."

**Approach:**
- **Primary:** Apollo Client polling every 5 seconds for near real-time updates
- **Fallback:** Batch notifications every 10 minutes
- Subscription schema defined for future WebSocket implementation
- Event publishing functions (`publishRecognitionCreated()`, etc.) prepared for integration

---

### 5. Analytics Implementation

**Approach:**
- Aggregation performed in-memory in `analytics.ts` resolvers
- Computes:
  - Total recognitions
  - Recognitions by team
  - Recognitions by keyword
  - Top recognizers and recipients
- Optional filters: department, date range
- Access restricted to `MANAGER`, `HR`, and `CROSS_FUNCTIONAL_LEAD` roles

---

### 6. Access Control

**Approach:**
- Role-based permissions enforced in resolvers
- Visibility rules:
  - `PUBLIC`: Visible to all
  - `PRIVATE`: Only sender and recipient
  - `TEAM_ONLY`: Only users in the same department
- Context injection from API route ensures consistent user identity

---

### 7. API Route Implementation

**Approach:**
- Next.js App Router API route at `/api/graphql`
- Uses `ApolloServer.executeOperation()` for request handling
- Extracts `userId` from headers and injects into context
- Returns `result.body.singleResult` to match Apollo Client expectations

---

### 8. Frontend Integration

**Approach:**
- Apollo Client configured with `createHttpLink` and `setContext` to inject `x-user-id`
- Components:
  - `UserSelector`: Simulates authentication
  - `RecognitionForm`: Creates recognitions
  - `RecognitionList`: Displays recognitions with server-side filtering
  - `AnalyticsDashboard`: Displays analytics with filters
  - `RealtimeNotifications`: Implements polling-based updates
  - `BatchNotifications`: Implements 10-minute batch updates

---

### 9. Error Handling

**Approach:**
- Data integrity errors: Throw descriptive messages when referenced entities are missing
- Authorization errors: Return "Not authorized" when role or visibility checks fail
- Client-side: Display GraphQL errors in UI components

---

### 10. Extensibility

**Approach:**
- Schema includes `reactions` and `comments` fields for future features
- Event publishing functions can be connected to external webhooks (Slack, Teams)
- Modular resolver and component structure supports easy feature addition

---

## Trade-offs and Assumptions

**Trade-offs:**
- In-memory storage for simplicity; no persistence
- Polling instead of WebSockets for real-time updates
- Header-based authentication for demonstration purposes

**Assumptions:**
- Users are pre-created and managed externally
- Department structure is flat
- All users want notifications when enabled

---

## Running the Project

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
- App: http://localhost:3000
- GraphQL Playground: http://localhost:3000/api/graphql

---

## Testing the API

**Example Query:**
```graphql
query {
  users {
    id
    name
    role
    department
  }
}
```

**Example Mutation:**
```graphql
mutation {
  createRecognition(input: {
    message: "Great work on the project!"
    emojis: ["👏", "🚀"]
    visibility: PUBLIC
    recipientId: "recipient-user-id"
    keywords: ["teamwork", "project"]
  }) {
    id
    message
    recipient { name }
  }
}
```

**Authentication Header:**
```json
{
  "x-user-id": "sender-user-id"
}
```

---

## Future Enhancements
- Replace in-memory store with persistent database (PostgreSQL + Prisma)
- Implement JWT-based authentication
- Add WebSocket subscriptions for true real-time updates
- Extend analytics with time-series and trend analysis
- Integrate with Slack/Teams for cross-platform notifications
