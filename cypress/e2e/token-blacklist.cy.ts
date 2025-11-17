describe('Token Blacklisting', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should handle blacklisted token by attempting refresh', () => {
    const validExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'blacklisted-token');
      win.localStorage.setItem('tokenExpiresAt', validExpiry);
      win.localStorage.setItem('refreshToken', 'valid-refresh-token');
      win.localStorage.setItem('refreshTokenExpiresAt', validExpiry);
      win.localStorage.setItem('workflow-auth', JSON.stringify({
        username: 'admin',
        roles: ['ROLE_USER'],
        token: 'blacklisted-token',
        expiresAt: validExpiry,
      }));
    });

    let requestCount = 0;
    // First request returns 401 (blacklisted), retry succeeds
    cy.intercept('GET', '/api/tasks/my', (req) => {
      requestCount++;
      if (requestCount === 1) {
        req.reply({ statusCode: 401, body: { message: 'Token is blacklisted' } });
      } else {
        req.reply({ statusCode: 200, body: [] });
      }
    }).as('tasksRequest');

    // Refresh succeeds
    cy.intercept('POST', '/api/auth/refresh', {
      statusCode: 200,
      headers: {
        'Date': new Date().toUTCString(),
      },
      body: {
        tokenType: 'Bearer',
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token',
        expiresAt: validExpiry,
        refreshExpiresAt: validExpiry,
        username: 'admin',
        roles: ['ROLE_USER'],
      },
    }).as('refreshRequest');

    cy.visit('/');
    cy.wait('@tasksRequest', { timeout: 10000 }); // First request (401)
    cy.wait('@refreshRequest', { timeout: 10000 }); // Refresh
    cy.wait('@tasksRequest', { timeout: 10000 }); // Retry (200)
    cy.window().its('localStorage').should('have.property', 'accessToken', 'new-token');
  });

  it('should logout when refresh fails after blacklist', () => {
    const validExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'blacklisted-token');
      win.localStorage.setItem('tokenExpiresAt', validExpiry);
      win.localStorage.setItem('refreshToken', 'revoked-refresh-token');
      win.localStorage.setItem('refreshTokenExpiresAt', validExpiry);
      win.localStorage.setItem('workflow-auth', JSON.stringify({
        username: 'admin',
        roles: ['ROLE_USER'],
        token: 'blacklisted-token',
        expiresAt: validExpiry,
      }));
    });

    // First request returns 401 (blacklisted)
    cy.intercept('GET', '/api/tasks/my', {
      statusCode: 401,
    }).as('blacklistedRequest');

    // Refresh request will be made but fails (refresh token revoked)
    cy.intercept('POST', '/api/auth/refresh', {
      statusCode: 401,
      body: { message: 'Refresh token revoked' },
    }).as('refreshRequest');

    cy.visit('/');
    // Wait for the first request (401)
    cy.wait('@blacklistedRequest', { timeout: 10000 });
    // Then refresh will be attempted and fail
    cy.wait('@refreshRequest', { timeout: 10000 });
    // After refresh fails, should redirect to login
    cy.url({ timeout: 5000 }).should('include', '/login');
    cy.window().its('localStorage').should('not.have.property', 'accessToken');
  });
});

