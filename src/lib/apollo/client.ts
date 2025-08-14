import { ApolloClient, InMemoryCache, createHttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = createHttpLink({
  uri: "/api/graphql",
});

// authentication link to add user ID header (for demo purposes)
const authLink = setContext((_, { headers }) => {
  //in a real app, you'd get this from authentication state
  const userId =
    typeof window !== "undefined" ? localStorage.getItem("userId") : null;

  return {
    headers: {
      ...headers,
      "x-user-id": userId,
    },
  };
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});
