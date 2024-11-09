import { TRPCClientError } from '@trpc/client'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { AppRouter } from './trpc-app'

export enum AccessLevel {
  ADMIN = 'ADMIN',
  WRITE = 'WRITE',
  RECORD = 'RECORD',
  READ = 'READ',
}

export type Session = {
  expires: string
  userId: string
  user: {
    name: string
    email: string
    image: string
  }
}

type RouterOutput = inferRouterOutputs<AppRouter>
type RouterInput = inferRouterInputs<AppRouter>

export type CreateLedgerInput = RouterInput['ledger']['create']
export type CreateLedgerOutput = RouterOutput['ledger']['create']
export type ListLedgersOutput = RouterOutput['ledger']['list']
export type LedgerMeta = ListLedgersOutput[0]
export type UpdateLedgerMetaInput = RouterInput['ledger']['update']

export type CreateTemplateInput = RouterInput['template']['create']
export type ListTemplatesOutput = RouterOutput['template']['getForLedger']
export type LedgerTemplate = ListTemplatesOutput[0]
export type UpdateTemplateInput = RouterInput['template']['update']

export type CreateEntryInput = RouterInput['entry']['create']
export type ListEntriesOutput = RouterOutput['entry']['getForLedger']
export type LedgerEntry = ListEntriesOutput[0]

export function isTRPCClientError(
  cause: Error,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError
}
