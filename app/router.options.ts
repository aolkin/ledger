import type { RouterConfig } from '@nuxt/schema'
import type { RouteRecordRaw } from 'vue-router'

function updateRouteProps(route: RouteRecordRaw) {
  route.props = true
  route.children?.forEach(updateRouteProps)
  return route
}

export default {
  // https://router.vuejs.org/api/interfaces/routeroptions.html#routes
  routes: (_routes) => _routes.map(updateRouteProps),
} satisfies RouterConfig
