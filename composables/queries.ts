import { queryOptions, useQuery } from '@tanstack/vue-query'

const trpc = useTrpc()

const queryMeta = (ledgerId: string) =>
  queryOptions({
    queryKey: ['meta', { id: ledgerId }],
    queryFn: () => trpc.ledger.get.query({ ledgerId }),
  })
export const useQueryMeta = (ledgerId: string) => useQuery(queryMeta(ledgerId))

const queryTemplates = (ledgerId: string) =>
  queryOptions({
    queryKey: ['templates', { ledgerId }],
    queryFn: () => trpc.template.getForLedger.query({ ledgerId }),
  })
export const useQueryTemplates = (ledgerId: string) =>
  useQuery(queryTemplates(ledgerId))
