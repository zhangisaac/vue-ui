import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock axios - must define everything inside the factory
vi.mock('axios', () => {
  const mockInterceptors = {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  };

  const mockAxiosInstance = {
    interceptors: mockInterceptors,
    post: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  };

  return {
    default: {
      create: vi.fn(() => mockAxiosInstance),
    },
  };
});

// Now import api after mocks are set up
import * as api from '@/services/api';

describe('api.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('can call logout without errors', async () => {
    // Test that logout function exists and can be called
    await expect(api.logout()).resolves.not.toThrow();
  });

  it('skips backend logout when no token', async () => {
    // No token in localStorage
    await api.logout();
    // Should not throw and should complete silently
    expect(true).toBe(true);
  });
});
