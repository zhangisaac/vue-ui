import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';
import * as api from '@/services/api';

vi.mock('@/services/api', () => ({
  login: vi.fn(),
  logout: vi.fn(),
}));

// Mock router - define mockPush inside factory
vi.mock('@/router', () => {
  const mockPush = vi.fn();
  return {
    default: {
      currentRoute: { value: { name: 'my-tasks', fullPath: '/' } },
      push: mockPush,
    },
  };
});

describe('auth store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('persists tokens and user on login', async () => {
    (api.login as any).mockResolvedValue({
      username: 'admin',
      roles: ['ROLE_ADMIN', 'ROLE_USER'],
      accessToken: 'access',
      refreshToken: 'refresh',
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      refreshExpiresAt: new Date(Date.now() + 7200_000).toISOString(),
    });

    const store = useAuthStore();
    await store.login('admin', 'admin');
    expect(store.state?.username).toBe('admin');
    expect(localStorage.getItem('accessToken')).toBe('access');
    expect(localStorage.getItem('refreshToken')).toBe('refresh');
  });

  it('clears state on logout', async () => {
    const store = useAuthStore();
    // Pre-populate
    store['state'] = {
      username: 'admin',
      roles: ['ROLE_ADMIN'],
      token: 'access',
      refreshToken: 'refresh',
      expiresAt: new Date(Date.now() + 3600_000).toISOString(),
      refreshExpiresAt: new Date(Date.now() + 7200_000).toISOString(),
    } as any;

    await store.logout();
    expect(api.logout).toHaveBeenCalled();
    expect(store.state).toBeNull();
  });
});
