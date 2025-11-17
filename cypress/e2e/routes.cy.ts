describe('Route Protection', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should redirect unauthenticated users to login', () => {
    cy.visit('/');
    cy.url().should('include', '/login');
    cy.url().should('include', 'redirect=');
  });

  it('should allow access to protected routes when authenticated', () => {
    const validExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'valid-token');
      win.localStorage.setItem('tokenExpiresAt', validExpiry);
      win.localStorage.setItem('workflow-auth', JSON.stringify({
        username: 'user',
        roles: ['ROLE_USER'],
        token: 'valid-token',
      }));
    });

    cy.intercept('GET', '/api/tasks/my', {
      statusCode: 200,
      body: [],
    }).as('tasksRequest');

    cy.visit('/');
    cy.url().should('not.include', '/login');
    cy.wait('@tasksRequest');
  });

  it('should block non-admin users from admin routes', () => {
    const validExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'user-token');
      win.localStorage.setItem('tokenExpiresAt', validExpiry);
      win.localStorage.setItem('workflow-auth', JSON.stringify({
        username: 'user',
        roles: ['ROLE_USER'], // Not admin
        token: 'user-token',
      }));
    });

    cy.intercept('GET', '/api/tasks/my', {
      statusCode: 200,
      body: [],
    }).as('tasksRequest');

    cy.visit('/admin/processes');
    cy.url().should('not.include', '/admin/processes');
    cy.url().should('include', '/');
  });

  it('should allow admin users to access admin routes', () => {
    const validExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'admin-token');
      win.localStorage.setItem('tokenExpiresAt', validExpiry);
      win.localStorage.setItem('workflow-auth', JSON.stringify({
        username: 'admin',
        roles: ['ROLE_ADMIN', 'ROLE_USER'],
        token: 'admin-token',
      }));
    });

    cy.intercept('GET', '/api/processes/active', {
      statusCode: 200,
      body: [],
    }).as('processesRequest');

    cy.visit('/admin/processes');
    cy.url().should('include', '/admin/processes');
    cy.wait('@processesRequest');
  });
});

