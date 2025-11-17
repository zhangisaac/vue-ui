describe('Logout Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should logout successfully and clear tokens', () => {
    const validExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    // Login first
    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'valid-token');
      win.localStorage.setItem('refreshToken', 'valid-refresh-token');
      win.localStorage.setItem('tokenExpiresAt', validExpiry);
      win.localStorage.setItem('refreshTokenExpiresAt', validExpiry);
      win.localStorage.setItem('workflow-auth', JSON.stringify({
        username: 'admin',
        roles: ['ROLE_USER'],
        token: 'valid-token',
      }));
    });

    cy.intercept('POST', '/api/auth/logout', {
      statusCode: 200,
    }).as('logoutRequest');

    cy.visit('/');
    // Find and click the "Sign out" button in the footer
    cy.contains('button', 'Sign out').click();

    cy.wait('@logoutRequest', { timeout: 5000 }).then(() => {
      cy.url().should('include', '/login');
      cy.window().its('localStorage').should('not.have.property', 'accessToken');
      cy.window().its('localStorage').should('not.have.property', 'refreshToken');
    });
  });

  it('should skip backend logout if token is expired', () => {
    const expiredTime = new Date(Date.now() - 1000).toISOString();

    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'expired-token');
      win.localStorage.setItem('tokenExpiresAt', expiredTime);
      win.localStorage.setItem('refreshToken', 'refresh-token');
    });

    cy.intercept('POST', '/api/auth/logout', {
      statusCode: 403,
    }).as('logoutRequest');

    cy.visit('/');
    // Trigger logout
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('auth:logout'));
    });

    // Should not call backend
    cy.get('@logoutRequest').should('not.exist');
    cy.url().should('include', '/login');
    cy.window().its('localStorage').should('not.have.property', 'accessToken');
  });
});

