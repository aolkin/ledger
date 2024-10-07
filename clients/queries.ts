import { queryOptions } from '@tanstack/vue-query'

const trpc = useTrpc()

export const queryMeta = (ledgerId: string) =>
  queryOptions({
    queryKey: ['meta', { id: ledgerId }],
    queryFn: () => trpc.ledger.get.query({ ledgerId }),
  })
