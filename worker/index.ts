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
      // log: ['query', 'info', 'warn', 'error'],
    })

    const headers: Record<string, string> = {
      // TODO: make this more secure
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
        //debug: true,
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
          redirect({ url, baseUrl }) {
            // TODO: make this more secure
            return url
          },
        },
      },
    )
    if (isAuthRequest) {
      if (
        request.headers.get('Accept') === 'application/json' ||
        auth.headers.get('Content-Type') === 'application/json'
      ) {
        const authHeaders = new Headers()
        auth.headers?.forEach((value, key) => authHeaders.append(key, value))
        Object.entries(headers).forEach(([key, value]) =>
          authHeaders.append(key, value),
        )
        const redirect = auth.headers.get('Location')
        if (auth.status === 302 && redirect) {
          const redirectUrl = new URL(redirect)
          const result: { redirect?: string; error?: string } = {}
          if (
            redirectUrl.origin === url.origin &&
            redirectUrl.pathname !== '/'
          ) {
            result.error =
              redirectUrl.searchParams.get('error') || 'UnknownError'
          } else {
            result.redirect = redirect
          }
          authHeaders.delete('Location')
          return new Response(JSON.stringify(result), {
            headers: authHeaders,
          })
        }
        return new Response(auth.body, {
          status: auth.status,
          statusText: auth.statusText,
          headers: authHeaders,
        })
      }
      return auth
    } else {
      const session = (await auth.json()) satisfies Session | null
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
