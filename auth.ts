import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { login as apiLogin, logout as apiLogout } from '@/services/api';
import type { LoginResponse } from '@/types/workflow';
import router from '@/router';

interface AuthState {
  username: string;
  roles: string[];
  token: string;
  refreshToken?: string;
  expiresAt?: string;
  refreshExpiresAt?: string;
}

const STORAGE_KEY = 'workflow-auth';
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_EXPIRES_AT_KEY = 'tokenExpiresAt';
const REFRESH_TOKEN_EXPIRES_AT_KEY = 'refreshTokenExpiresAt';

export const useAuthStore = defineStore('auth', () => {
  const state = ref<AuthState | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  const isAuthenticated = computed(() => !!state.value?.token);
  const isAdmin = computed(() => state.value?.roles.includes('ROLE_ADMIN') ?? false);
  const username = computed(() => state.value?.username ?? '');

  // Handle auth logout event from API service (when token refresh fails)
  function handleAuthLogout() {
    clear();
  }

  function persist(authState: AuthState) {
    // Store in Pinia state
    state.value = authState;
    
    // Store in localStorage for persistence (api.ts also uses these keys)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    localStorage.setItem(ACCESS_TOKEN_KEY, authState.token);
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, authState.expiresAt || '');
    
    if (authState.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, authState.refreshToken);
      localStorage.setItem(REFRESH_TOKEN_EXPIRES_AT_KEY, authState.refreshExpiresAt || '');
    }
  }

  function clear() {
    // Clear Pinia state
    state.value = null;
    
    // Clear localStorage (api.ts will also clear these, but we do it here for consistency)
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
    localStorage.removeItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
  }

  async function initialize() {
    const stored = localStorage.getItem(STORAGE_KEY);
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
    const refreshExpiresAt = localStorage.getItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
    
    if (stored && accessToken) {
      try {
        const parsed = JSON.parse(stored) as AuthState;
        if (parsed.token) {
          // Sync with localStorage values (in case they were updated by api.ts refresh)
          const currentToken = localStorage.getItem(ACCESS_TOKEN_KEY);
          const currentRefreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
          const currentExpiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
          const currentRefreshExpiresAt = localStorage.getItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
          
          state.value = {
            ...parsed,
            token: currentToken || parsed.token,
            refreshToken: currentRefreshToken || parsed.refreshToken,
            expiresAt: currentExpiresAt || parsed.expiresAt,
            refreshExpiresAt: currentRefreshExpiresAt || parsed.refreshExpiresAt,
          };
        }
      } catch {
        clear();
      }
    }
    
    // Listen for auth logout events from API service
    window.addEventListener('auth:logout', handleAuthLogout);
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
        refreshToken: response.refreshToken,
        expiresAt: response.expiresAt,
        refreshExpiresAt: response.refreshExpiresAt,
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

  async function logout() {
    const refreshToken = state.value?.refreshToken || localStorage.getItem(REFRESH_TOKEN_KEY) || undefined;
    await apiLogout(refreshToken);
    clear();
    // Navigate to login immediately for a clean UX
    if (router.currentRoute.value.name !== 'login') {
      router.push({ name: 'login' });
    }
    // Event listener cleanup will be done by router/component unmount
  }

  function cleanup() {
    window.removeEventListener('auth:logout', handleAuthLogout);
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
    cleanup,
  };
});


