import { createRouter, createWebHistory } from 'vue-router';
import { authGuard } from './guards';
import { routes } from './routes';

const APP_TITLE = 'Cambio de divisas';

export const router = createRouter({ history: createWebHistory(), routes });

router.beforeEach(authGuard);

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} · ${APP_TITLE}` : APP_TITLE;
});
