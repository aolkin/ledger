import type { DehydratedState } from '@tanstack/vue-query'
import {
  dehydrate,
  hydrate,
  QueryClient,
  VueQueryPlugin,
} from '@tanstack/vue-query'
import { isTRPCClientError } from '../worker/router-types'

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')

  // Modify your Vue Query global settings here
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: false,
        retry(failureCount, error): boolean {
          if (isTRPCClientError(error)) {
            if (error.data?.code === 'NOT_FOUND') {
              return false
            } else {
              console.log('TRPCClientError', error, error.data?.code)
            }
          } else {
            console.error('Unexpected error', error)
          }
          return failureCount < 3
        },
        // staleTime: 5000
      },
    },
  })
  nuxt.vueApp.use(VueQueryPlugin, {
    queryClient,
    enableDevtoolsV6Plugin: true,
  })

  if (import.meta.server) {
    nuxt.hooks.hook('app:rendered', () => {
      vueQueryState.value = dehydrate(queryClient)
    })
  }

  if (import.meta.client) {
    nuxt.hooks.hook('app:created', () => {
      hydrate(queryClient, vueQueryState.value)
    })
  }
})
