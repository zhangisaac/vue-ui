<template>
  <div class="layout">
    <aside class="sidebar">
      <div class="brand">
        <span class="logo">WF</span>
        <h2>Workflow Hub</h2>
      </div>
      <nav>
        <RouterLink to="/" exact-active-class="active">My Tasks</RouterLink>
        <RouterLink to="/candidate" exact-active-class="active">Group Tasks</RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin/processes" exact-active-class="active">
          Process Admin
        </RouterLink>
      </nav>
      <footer>
        <p class="user">{{ auth.username }}</p>
        <button type="button" @click="handleLogout">Sign out</button>
      </footer>
    </aside>
    <main>
      <header class="topbar">
        <h1>{{ pageTitle }}</h1>
      </header>
      <section class="content">
        <RouterView />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();
const route = useRoute();

const pageTitle = computed(() => {
  if (route.path.startsWith('/admin')) {
    return 'Process Administration';
  }
  if (route.path === '/candidate') {
    return 'Group Tasks';
  }
  return 'My Tasks';
});

async function handleLogout() {
  auth.logout();
  await router.push('/login');
}
</script>

<style scoped>
.layout {
  display: grid;
  grid-template-columns: 260px 1fr;
  min-height: 100vh;
  background-color: #f1f5f9;
}

.sidebar {
  background-color: #1e3a8a;
  color: white;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  font-weight: 700;
  font-size: 1.2rem;
}

nav {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

a {
  padding: 0.75rem 1rem;
  border-radius: 10px;
  color: rgba(255, 255, 255, 0.8);
  transition: background-color 0.2s ease, color 0.2s ease;
}

a.active,
a:hover {
  background-color: rgba(255, 255, 255, 0.18);
  color: white;
}

footer {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

footer button {
  border: none;
  border-radius: 8px;
  padding: 0.6rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.user {
  font-weight: 600;
}

main {
  display: flex;
  flex-direction: column;
}

.topbar {
  background-color: white;
  padding: 1.25rem 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.content {
  padding: 2rem;
  flex: 1;
  overflow-y: auto;
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }

  .sidebar {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }

  nav {
    flex-direction: row;
  }
}
</style>


