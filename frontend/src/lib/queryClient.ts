import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,        // 30s — readings update via SSE, so REST can be slightly stale
      gcTime: 5 * 60_000,       // 5m garbage collection
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})
