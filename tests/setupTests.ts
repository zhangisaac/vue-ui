// Basic JSDOM setup and test globals
import { expect, afterEach, vi, beforeEach } from 'vitest';

// Mock window.dispatchEvent to avoid errors in headless runs
if (!window.dispatchEvent) {
  // @ts-ignore
  window.dispatchEvent = () => true;
}

// Mock localStorage for tests (jsdom provides it, but ensure clean state)
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
});


