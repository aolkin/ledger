import type { RouterConfig } from '@nuxt/schema'

export default {
  // https://router.vuejs.org/api/interfaces/routeroptions.html#routes
  routes: (_routes) => {
    _routes.forEach((route) => (route.props = true))
    return _routes
  },
} satisfies RouterConfig
