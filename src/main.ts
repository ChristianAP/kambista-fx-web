import { createPinia } from 'pinia';
import { createApp } from 'vue';
import { router } from '@/app/router';
import { onUnauthorized } from '@/core/http/http-client';
import { useSessionStore } from '@/features/auth/stores/session.store';
import App from './App.vue';
import './styles/main.css';

const app = createApp(App);
app.use(createPinia());
app.use(router);

onUnauthorized(() => {
  useSessionStore().logout();
  void router.replace({ name: 'login', query: { redirect: router.currentRoute.value.fullPath } });
});

app.mount('#app');
