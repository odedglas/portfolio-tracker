import { route } from 'quasar/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
  RouteLocationNormalized,
} from 'vue-router';
import { authentication } from 'src/service/firebase';

import routes, { ROUTE_PATHS } from './routes';

export const getAuthenticationRedirectRoute = (authState: unknown) => {
  switch (authState) {
    case 'required':
      if (!authentication.authenticationUser) {
        return ROUTE_PATHS.LOGIN;
      }
      break;
    case 'none':
      if (authentication.authenticationUser) {
        return ROUTE_PATHS.DASHBOARD;
      }
      break;
  }
};

const authenticationGuard = (to: RouteLocationNormalized) =>
  getAuthenticationRedirectRoute(to.meta.authState);

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory;

  const router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  router.beforeEach(authenticationGuard);

  return router;
});
