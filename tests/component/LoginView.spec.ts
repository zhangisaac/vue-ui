import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import LoginView from '@/views/LoginView.vue';
import { createPinia, setActivePinia } from 'pinia';
import { useAuthStore } from '@/stores/auth';

describe('LoginView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('renders and submits login', async () => {
    const wrapper = mount(LoginView, {
      global: {
        plugins: [createPinia()],
      },
    });
    
    const auth = useAuthStore();
    auth.login = vi.fn().mockResolvedValue(undefined) as any;
    
    const inputs = wrapper.findAll('input');
    await inputs[0].setValue('admin');
    await inputs[1].setValue('admin');
    await wrapper.find('form').trigger('submit.prevent');
    
    expect(auth.login).toHaveBeenCalled();
  });
});
