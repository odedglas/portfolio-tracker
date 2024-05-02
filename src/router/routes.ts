import { RouteRecordRaw } from 'vue-router';

export const ROUTE_PATHS = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
};

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: ROUTE_PATHS.DASHBOARD,
  },
  {
    path: ROUTE_PATHS.LOGIN,
    component: () => import('layouts/LoginLayout.vue'),
    meta: {
      authState: 'none',
    },
    children: [{ path: '', component: () => import('pages/Login.vue') }],
  },
  {
    path: ROUTE_PATHS.DASHBOARD,
    meta: {
      authState: 'required',
    },
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/Dashboard.vue') },
      {
        path: '/manage-portfolios',
        component: () => import('pages/Portfolios.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
