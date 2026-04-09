"use client";

import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { type ReactNode, useMemo } from "react";

export function ApolloWrapper({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    const uri =
      process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:3001/graphql";
    return new ApolloClient({
      cache: new InMemoryCache(),
      link: new HttpLink({ uri, credentials: "include" }),
    });
  }, []);

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}
