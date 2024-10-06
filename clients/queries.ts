import { queryOptions } from '@tanstack/vue-query'

const trpc = useTrpc()

export const queryMeta = (slug: string) =>
  queryOptions({
    queryKey: ['meta', { id: slug }],
    queryFn: () => trpc.ledger.get.query({ slug: slug }),
  })
