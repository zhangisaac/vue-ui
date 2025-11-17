import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import * as api from '@/services/api';

vi.mock('@/services/api', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

vi.mock('@/router', () => {
  const mockPush = vi.fn();
  return {
    default: {
      currentRoute: { value: { name: 'my-tasks', fullPath: '/' } },
      push: mockPush,
    },
  };
});

describe('auth store - Comprehensive Coverage', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('Error Handling', () => {
    it('handles login error with Error instance', async () => {
      const store = useAuthStore();
      (api.login as any).mockRejectedValueOnce(new Error('Network error'));

      await expect(store.login('admin', 'password')).rejects.toThrow('Network error');
      expect(store.error).toBe('Network error');
      expect(store.state).toBeNull();
    });

    it('handles login error with 403 status', async () => {
      const store = useAuthStore();
      const axiosError = {
        response: {
          status: 403,
          statusText: 'Forbidden',
          data: {},
        },
      };
      (api.login as any).mockRejectedValueOnce(axiosError);

      await expect(store.login('admin', 'password')).rejects.toEqual(axiosError);
      expect(store.error).toBe('Access forbidden. Please check backend CORS/CSRF configuration.');
      expect(store.state).toBeNull();
    });

    it('handles login error with other status codes', async () => {
      const store = useAuthStore();
      const axiosError = {
        response: {
          status: 500,
          statusText: 'Internal Server Error',
          data: {},
        },
      };
      (api.login as any).mockRejectedValueOnce(axiosError);

      await expect(store.login('admin', 'password')).rejects.toEqual(axiosError);
      expect(store.error).toBe('Login failed: 500 Internal Server Error');
      expect(store.state).toBeNull();
    });

    it('handles login error with status but no statusText', async () => {
      const store = useAuthStore();
      const axiosError = {
        response: {
          status: 400,
          data: {},
        },
      };
      (api.login as any).mockRejectedValueOnce(axiosError);

      await expect(store.login('admin', 'password')).rejects.toEqual(axiosError);
      expect(store.error).toBe('Login failed: 400 ');
      expect(store.state).toBeNull();
    });

    it('handles login error with non-Error, non-response object', async () => {
      const store = useAuthStore();
      (api.login as any).mockRejectedValueOnce('String error');

      await expect(store.login('admin', 'password')).rejects.toBe('String error');
      expect(store.error).toBe('Login failed');
      expect(store.state).toBeNull();
    });
  });

  describe('Cleanup', () => {
    it('removes auth:logout event listener on cleanup', () => {
      const store = useAuthStore();
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
      
      store.cleanup();
      
      expect(removeEventListenerSpy).toHaveBeenCalledWith('auth:logout', expect.any(Function));
    });
  });

  describe('Logout Navigation', () => {
    it('calls logout API and clears state', async () => {
      const store = useAuthStore();
      store['state'] = {
        username: 'admin',
        roles: ['ROLE_USER'],
        token: 'token',
        refreshToken: 'refresh',
        expiresAt: new Date(Date.now() + 3600_000).toISOString(),
        refreshExpiresAt: new Date(Date.now() + 7200_000).toISOString(),
      } as any;

      (api.logout as any).mockResolvedValueOnce(undefined);
      
      await store.logout();
      
      expect(api.logout).toHaveBeenCalled();
      expect(store.state).toBeNull();
    });
  });
});

