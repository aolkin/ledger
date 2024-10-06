import { TRPCClientError } from '@trpc/client'
import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { AppRouter } from './trpc-app'

type RouterInput = inferRouterInputs<AppRouter>
type RouterOutput = inferRouterOutputs<AppRouter>

export type CreateLedgerInput = RouterInput['ledger']['create']
export type CreateLedgerOutput = RouterOutput['ledger']['create']
export type ListLedgersOutput = RouterOutput['ledger']['list']

export type CreateTemplateInput = RouterInput['template']['create']

export function isTRPCClientError(
  cause: Error,
): cause is TRPCClientError<AppRouter> {
  return cause instanceof TRPCClientError
}
