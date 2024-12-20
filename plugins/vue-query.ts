import type { DehydratedState } from '@tanstack/vue-query'
import {
  dehydrate,
  hydrate,
  QueryClient,
  VueQueryPlugin,
} from '@tanstack/vue-query'
import type { TRPC_ERROR_CODE_KEY } from '@trpc/server/rpc'
import { isTRPCClientError } from '../worker/router-types'

const RETRYABLE_ERRORS: TRPC_ERROR_CODE_KEY[] = [
  'CLIENT_CLOSED_REQUEST',
  'CONFLICT',
  'INTERNAL_SERVER_ERROR',
  'TIMEOUT',
  'TOO_MANY_REQUESTS',
]

export function translateError(error: any) {
  if (isTRPCClientError(error)) {
    const code = error.data?.code as TRPC_ERROR_CODE_KEY
    switch (code) {
      case 'UNAUTHORIZED':
        return 'Session invalid; Please login again.'
      case 'FORBIDDEN':
        return 'Permission denied.'
      default:
        return code
    }
  }
  return error
}

export default defineNuxtPlugin((nuxt) => {
  const vueQueryState = useState<DehydratedState | null>('vue-query')
  const toast = useToast()

  // Modify your Vue Query global settings here
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: false,
        retry(failureCount, error): boolean {
          if (isTRPCClientError(error)) {
            const errorCode = error.data?.code as TRPC_ERROR_CODE_KEY
            if (errorCode && RETRYABLE_ERRORS.includes(errorCode)) {
              return failureCount < 3
            } else {
              console.error('TRPCClientError', error, error.data?.code)
            }
          } else {
            console.error('Unexpected error', error)
          }
          return false
        },
        // staleTime: 5000
      },
      mutations: {
        onError(error, variables, context) {
          console.log(error, variables, context)
          toast.add({
            severity: 'error',
            summary: 'Operation Failed',
            detail: translateError(error),
            life: 5000,
          })
        },
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
