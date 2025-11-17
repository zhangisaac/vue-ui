import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('main.ts', () => {
  beforeEach(() => {
    // Clear any existing app
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('can be imported without errors', async () => {
    // Just verify the module can be imported
    // Actual mounting is tested in E2E tests
    await expect(import('@/main')).resolves.toBeDefined();
  });
});

