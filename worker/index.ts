import { PrismaD1 } from '@prisma/adapter-d1'
import { Prisma, PrismaClient } from '@prisma/client'
import { TRPCError } from '@trpc/server'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter } from './trpc-app'

// Create and export the worker
export default {
  async fetch(
    request: Request,
    env: { DB: D1Database },
    ctx: ExecutionContext,
  ): Promise<Response> {
    const prisma = new PrismaClient({
      adapter: new PrismaD1(env.DB),
    })

    const headers: Record<string, string> = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST',
    }
    const acrHeaders = request.headers.get('Access-Control-Request-Headers')
    if (acrHeaders) {
      headers['Access-Control-Allow-Headers'] = acrHeaders
    }

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers,
      })
    }

    return fetchRequestHandler({
      endpoint: '/trpc',
      req: request,
      router: appRouter,
      createContext: () => ({ prisma }),
      responseMeta: () => ({ headers }),
    })
  },
}
