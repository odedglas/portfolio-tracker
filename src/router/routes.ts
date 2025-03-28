import { Platform } from 'quasar';
import { RouteRecordRaw } from 'vue-router';

export const ROUTE_PATHS = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  MANAGE_PORTFOLIOS: '/manage-portfolios',
  TRANSACTIONS: '/transactions',
  HOLDINGS: '/holdings',
  CASH: '/cash',
  ALLOCATION_PLANNER: '/allocation-planner',
  ANALYTICS: '/analytics',
  STOCK_PLANS: '/stock-plans',
  BALANCE_HISTORY: '/balance-history',
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
    component: () => {
      if (Platform.is.mobile) {
        return import('layouts/MobileLayout.vue');
      }

      return import('layouts/MainLayout.vue');
    },
    children: [
      { path: '', component: () => import('pages/Dashboard.vue') },
      {
        path: ROUTE_PATHS.TRANSACTIONS,
        component: () => import('pages/Transactions.vue'),
      },
      {
        path: ROUTE_PATHS.HOLDINGS,
        component: () => import('pages/Holdings.vue'),
      },
      {
        path: ROUTE_PATHS.MANAGE_PORTFOLIOS,
        component: () => import('pages/ManagePortfolios.vue'),
      },
      {
        path: ROUTE_PATHS.CASH,
        component: () => import('pages/CashFlow.vue'),
      },
      {
        path: ROUTE_PATHS.ANALYTICS,
        component: () => import('pages/Analytics.vue'),
      },
      {
        path: ROUTE_PATHS.STOCK_PLANS,
        component: () => import('pages/StockPlans.vue'),
      },
      {
        path: ROUTE_PATHS.ALLOCATION_PLANNER,
        component: () => import('pages/AllocationPlanner.vue'),
      },
      {
        path: ROUTE_PATHS.BALANCE_HISTORY,
        component: () => import('pages/Balance.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
