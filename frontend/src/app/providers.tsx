'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Data stays fresh for 2 minutes
        staleTime: 2 * 60 * 1000,
        // Cache persists for 10 minutes
        gcTime: 10 * 60 * 1000,
        retry: 1,
        // Don't refetch on window focus in production (reduces API calls)
        refetchOnWindowFocus: process.env.NODE_ENV === 'development',
        // Don't refetch on reconnect unless stale
        refetchOnReconnect: 'always',
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
  if (typeof window === 'undefined') {
    // Server: always make a new query client
    return makeQueryClient();
  } else {
    // Browser: reuse the same query client
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
  }
}

export function Providers({ children }: { children: ReactNode }) {
  const queryClient = getQueryClient();
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}