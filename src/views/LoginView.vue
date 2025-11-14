<template>
  <div class="login-page">
    <section class="card">
      <h1>Workflow Portal</h1>
      <p class="subtitle">Sign in to manage your tasks and processes</p>
      <form @submit.prevent="handleLogin">
        <label>
          Username
          <input v-model="username" placeholder="Enter username" required />
        </label>
        <label>
          Password
          <input v-model="password" type="password" placeholder="Enter password" required />
        </label>
        <button type="submit" :disabled="auth.loading">
          <span v-if="auth.loading">Signing in…</span>
          <span v-else>Sign In</span>
        </button>
        <p v-if="auth.error" class="error">{{ auth.error }}</p>
      </form>
      <div class="hint">
        <p>Demo accounts:</p>
        <ul>
          <li><code>admin / admin</code></li>
          <li><code>user / user</code></li>
          <li><code>manager / manager</code></li>
          <li><code>hr / hr</code></li>
        </ul>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const router = useRouter();

const username = ref('');
const password = ref('');

async function handleLogin() {
  try {
    await auth.login(username.value, password.value);
    await router.push('/');
  } catch {
    // error is handled in the store
  }
}
</script>

<style scoped>
.login-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%);
  padding: 1.5rem;
}

.card {
  background-color: white;
  width: 100%;
  max-width: 420px;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.2);
}

h1 {
  margin: 0;
  font-size: 2rem;
  color: #0f172a;
}

.subtitle {
  margin: 0.5rem 0 2rem;
  color: #475569;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  font-weight: 600;
  color: #1f2937;
  gap: 0.25rem;
}

input {
  border: 1px solid #cbd5f5;
  border-radius: 8px;
  padding: 0.75rem;
  font-size: 1rem;
}

button {
  margin-top: 0.5rem;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  transition: background-color 0.2s ease;
}

button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.error {
  color: #dc2626;
  margin: 0.25rem 0 0;
}

.hint {
  margin-top: 1.5rem;
  font-size: 0.9rem;
  color: #475569;
}

.hint ul {
  margin: 0.5rem 0 0;
  padding-left: 1.25rem;
}
</style>


