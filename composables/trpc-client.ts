import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

const config = useRuntimeConfig()

import type { AppRouter } from '../worker/trpc-app' // Import the AppRouter type from your backend

const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${config.public.apiOrigin}/trpc`, // Replace with your Worker's URL
      fetch: (input, data) =>
        input instanceof URL || typeof input === 'string'
          ? fetch(input, { ...data, credentials: 'include' })
          : fetch(
              {
                ...input,
                credentials: 'include',
              },
              data,
            ),
    }),
  ],
  transformer: superjson,
})

export function useTrpc() {
  return trpc
}
