import { mount } from 'cypress/vue';

declare global {
  // eslint-disable-next-line no-var
  var mount: typeof mount;
}

// Make mount available globally
// @ts-ignore
window.mount = mount;


