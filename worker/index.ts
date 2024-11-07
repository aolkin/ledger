import { Auth } from '@auth/core'
import Google from '@auth/core/providers/google'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaD1 } from '@prisma/adapter-d1'
import { PrismaClient } from '@prisma/client'
import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { Session } from './router-types'
import { appRouter } from './trpc-app'

type Env = {
  DB: D1Database
  AUTH_SECRET: string
  AUTH_GOOGLE_ID: string
  AUTH_GOOGLE_SECRET: string
}

function makeSessionRequest(url: URL, request: Request) {
  return new Request(`${url.origin}/auth/session`, {
    headers: { cookie: request.headers.get('cookie') ?? '' },
  })
}

// Create and export the worker
export default {
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext,
  ): Promise<Response> {
    if (request.url.endsWith('/favicon.ico')) {
      return new Response('', { status: 404 })
    }

    const prisma = new PrismaClient({
      adapter: new PrismaD1(env.DB),
      log: ['query', 'info', 'warn', 'error'],
    })

    const headers: Record<string, string> = {
      'Access-Control-Allow-Origin': request.headers.get('origin') ?? '*',
      'Access-Control-Allow-Methods': 'GET,POST',
      'Access-Control-Allow-Credentials': 'true',
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

    const url = new URL(request.url)
    const isAuthRequest = url.pathname.startsWith('/auth')
    const google = Google({
      clientId: env.AUTH_GOOGLE_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
    })
    const auth = await Auth(
      isAuthRequest ? request : makeSessionRequest(url, request),
      {
        trustHost: true,
        adapter: PrismaAdapter(prisma),
        providers: [google],
        secret: env.AUTH_SECRET,
        debug: true,
        callbacks: {
          async session({ session, token, user }) {
            return {
              expires: session.expires,
              userId: session.userId,
              user: {
                name: user.name,
                email: user.email,
                image: user.image,
              },
            }
          },
        },
      },
    )
    if (isAuthRequest) {
      return auth
    } else {
      const session = (await auth.json()) satisfies Session
      if (!session) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
          }),
          { status: 401, headers },
        )
      }
      console.log(session)
      return fetchRequestHandler({
        endpoint: '/trpc',
        req: request,
        router: appRouter,
        createContext: () => ({ prisma, session }),
        responseMeta: () => ({ headers }),
      })
    }
  },
}
