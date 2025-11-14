import { createRouter, createWebHistory } from 'vue-router';
import LoginView from '@/views/LoginView.vue';
import ShellView from '@/views/ShellView.vue';
import UserTasksView from '@/views/UserTasksView.vue';
import CandidateTasksView from '@/views/CandidateTasksView.vue';
import AdminProcessesView from '@/views/AdminProcessesView.vue';
import { useAuthStore } from '@/stores/auth';

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    requiresAdmin?: boolean;
    public?: boolean;
  }
}

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { public: true },
    },
    {
      path: '/',
      component: ShellView,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          name: 'my-tasks',
          component: UserTasksView,
        },
        {
          path: 'candidate',
          name: 'candidate-tasks',
          component: CandidateTasksView,
        },
        {
          path: 'admin/processes',
          name: 'admin-processes',
          component: AdminProcessesView,
          meta: { requiresAdmin: true },
        },
      ],
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
});

let initialized = false;

router.beforeEach(async (to, from, next) => {
  const auth = useAuthStore();

  if (!initialized) {
    await auth.initialize();
    initialized = true;
  }

  if (to.meta.public) {
    if (auth.isAuthenticated) {
      return next('/');
    }
    return next();
  }

  if (to.meta.requiresAuth && !auth.isAuthenticated) {
    return next({ name: 'login', query: { redirect: to.fullPath } });
  }

  if (to.meta.requiresAdmin && !auth.isAdmin) {
    return next('/');
  }

  return next();
});

export default router;


