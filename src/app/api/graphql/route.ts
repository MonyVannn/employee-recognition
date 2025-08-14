// src/app/api/graphql/route.ts
import { ApolloServer } from "@apollo/server";
import { startServerAndCreateNextHandler } from "@as-integrations/next";
import { ApolloServerPluginLandingPageLocalDefault } from "@apollo/server/plugin/landingPage/default";
import { schema } from "@/graphql/schema";
import { resolvers } from "@/graphql/resolvers";
import { initializeMockData } from "@/lib/data/mock-data";

// Initialize mock data ONCE at server start
initializeMockData();

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  introspection: true,
  plugins: [ApolloServerPluginLandingPageLocalDefault()],
});

export const handler = startServerAndCreateNextHandler(server, {
  context: async (req: any) => {
    const userId = req.headers.get("x-user-id") || undefined;

    return {
      userId,
    };
  },
});

export { handler as GET, handler as POST };
