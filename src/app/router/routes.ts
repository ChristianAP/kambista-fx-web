import type { RouteRecordRaw } from 'vue-router';

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/layouts/AppLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      { path: '', redirect: { name: 'exchange' } },
      {
        path: 'exchange',
        name: 'exchange',
        component: () => import('@/features/exchange/views/ExchangeView.vue'),
        meta: { title: 'Cambiar divisas' },
      },
      {
        path: 'history',
        name: 'history',
        component: () => import('@/features/history/views/HistoryView.vue'),
        meta: { title: 'Historial' },
      },
    ],
  },
  {
    path: '/',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/features/auth/views/LoginView.vue'),
        meta: { title: 'Iniciar sesión' },
      },
      {
        path: 'register',
        name: 'register',
        component: () => import('@/features/auth/views/RegisterView.vue'),
        meta: { title: 'Crear cuenta' },
      },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: { name: 'exchange' } },
];
