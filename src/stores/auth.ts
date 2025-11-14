import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as apiLogin } from '@/services/api';
import type { LoginResponse } from '@/types/workflow';

interface AuthState {
  username: string;
  roles: string[];
  token: string;
  expiresAt?: string;
}

const STORAGE_KEY = 'workflow-auth';
const TOKEN_KEY = 'accessToken';

export const useAuthStore = defineStore('auth', () => {
  const state = ref<AuthState | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!state.value?.token);
  const isAdmin = computed(() => state.value?.roles.includes('ROLE_ADMIN') ?? false);
  const username = computed(() => state.value?.username ?? '');

  function persist(authState: AuthState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    localStorage.setItem(TOKEN_KEY, authState.token);
    state.value = authState;
  }

  function clear() {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    state.value = null;
  }

  async function initialize() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AuthState;
        if (parsed.token) {
          state.value = parsed;
          localStorage.setItem(TOKEN_KEY, parsed.token);
        }
      } catch {
        clear();
      }
    }
  }

  async function login(usernameInput: string, password: string) {
    loading.value = true;
    error.value = null;
    try {
      const response: LoginResponse = await apiLogin(usernameInput, password);
      persist({
        username: response.username,
        roles: response.roles,
        token: response.accessToken,
        expiresAt: response.expiresAt,
      });
    } catch (err: unknown) {
      let errorMessage = 'Login failed';
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null && 'response' in err) {
        const axiosError = err as { response?: { status?: number; statusText?: string; data?: unknown } };
        if (axiosError.response?.status === 403) {
          errorMessage = 'Access forbidden. Please check backend CORS/CSRF configuration.';
        } else if (axiosError.response?.status) {
          errorMessage = `Login failed: ${axiosError.response.status} ${axiosError.response.statusText || ''}`;
        }
      }
      error.value = errorMessage;
      clear();
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function logout() {
    clear();
  }

  return {
    state,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    username,
    initialize,
    login,
    logout,
  };
});


