"use client";

import { SetContextLink } from "@apollo/client/link/context";
import {
  ApolloClient,
  ApolloLink,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { type ReactNode, useMemo } from "react";
import { AuthProvider } from "./AuthContext";
import { getToken } from "./lib/auth-storage";

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const uri =
      process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:3001/graphql";

    const httpLink = new HttpLink({
      uri,
      credentials: "include",
    });

    //before each request, add the token to the headers
    const authLink = new SetContextLink((prevContext) => {
      const token = getToken();
      return {
        headers: {
          ...((prevContext.headers as Record<string, string> | undefined) ??
            {}),
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      };
    });

    return new ApolloClient({
      cache: new InMemoryCache(),
      // (important) order of links - first authLink adds the token to the headers, then httpLink sends the request
      link: ApolloLink.from([authLink, httpLink]),
    });
  }, []);

  return (
    <ApolloProvider client={client}>
      <AuthProvider>{children}</AuthProvider>
    </ApolloProvider>
  );
}
