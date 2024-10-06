import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

import type { AppRouter } from '../worker/trpc-app' // Import the AppRouter type from your backend

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: 'http://localhost:8787/trpc', // Replace with your Worker's URL
    }),
  ],
  transformer: superjson,
})

export function useTrpc() {
  return trpc
}
