import { Env } from './env'
import type { LedgerData } from './ledger-data'

export { LedgerData } from './ledger-data'

/**
 * Welcome to Cloudflare Workers! This is your first Durable Objects application.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your Durable Object in action
 * - Run `npm run deploy` to publish your application
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/durable-objects
 */

export default {
  /**
   * This is the standard fetch handler for a Cloudflare Worker
   *
   * @param request - The request submitted to the Worker from the client
   * @param env - The interface to reference bindings declared in wrangler.toml
   * @param ctx - The execution context of the Worker
   * @returns The response to be sent back to the client
   */
  async fetch(request, env: Env, ctx): Promise<Response> {
    // We will create a `DurableObjectId` using the pathname from the Worker request
    // This id refers to a unique instance of our 'MyDurableObject' class above
    let id: DurableObjectId = env.LEDGER.idFromName(
      new URL(request.url).pathname,
    )

    // This stub creates a communication channel with the Durable Object instance
    // The Durable Object constructor will be invoked upon the first call for a given id
    let stub = env.LEDGER.get(id)

    // We call the `sayHello()` RPC method on the stub to invoke the method on the remote
    // Durable Object instance
    let greeting = await stub.sayHello('world')

    return new Response(greeting)
  },
} satisfies ExportedHandler<Env>
