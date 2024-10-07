import { queryOptions, useQuery } from '@tanstack/vue-query'

const trpc = useTrpc()

const queryMeta = (ledgerId: string) =>
  queryOptions({
    queryKey: ['meta', { id: ledgerId }],
    queryFn: () => trpc.ledger.get.query({ ledgerId }),
  })
export const useQueryMeta = (ledgerId: string) => useQuery(queryMeta(ledgerId))

export const templatesQueryKey = (ledgerId: string) => [
  'templates',
  { ledgerId },
]
const queryTemplates = (ledgerId: string) =>
  queryOptions({
    queryKey: templatesQueryKey(ledgerId),
    queryFn: () => trpc.template.getForLedger.query({ ledgerId }),
  })
export const useQueryTemplates = (ledgerId: string) =>
  useQuery(queryTemplates(ledgerId))

export const entriesQueryKey = (ledgerId: string) => ['entries', { ledgerId }]
const queryEntries = (ledgerId: string) =>
  queryOptions({
    queryKey: entriesQueryKey(ledgerId),
    queryFn: () => trpc.entry.getForLedger.query({ ledgerId }),
  })
export const useQueryEntries = (ledgerId: string) =>
  useQuery(queryEntries(ledgerId))
