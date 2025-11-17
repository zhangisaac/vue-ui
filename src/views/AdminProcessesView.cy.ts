import AdminProcessesView from './AdminProcessesView.vue'

describe('<AdminProcessesView />', () => {
  it('renders', () => {
    // see: https://on.cypress.io/mounting-vue
    cy.mount(AdminProcessesView)
  })
})