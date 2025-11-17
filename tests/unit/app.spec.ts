import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import App from '@/App.vue';
import { createRouter, createWebHistory } from 'vue-router';

describe('App.vue', () => {
  it('renders without errors', () => {
    const router = createRouter({
      history: createWebHistory(),
      routes: [{ path: '/', component: { template: '<div>Test</div>' } }],
    });

    const wrapper = mount(App, {
      global: {
        plugins: [router],
      },
    });

    expect(wrapper.exists()).toBe(true);
  });
});

