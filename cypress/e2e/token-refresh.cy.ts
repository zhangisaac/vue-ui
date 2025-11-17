describe('Token Refresh Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should automatically refresh token before expiry', () => {
    const expiredTime = new Date(Date.now() - 1000).toISOString(); // Already expired
    const newExpiredTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    // Set expired token
    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'old-token');
      win.localStorage.setItem('tokenExpiresAt', expiredTime);
      win.localStorage.setItem('refreshToken', 'valid-refresh-token');
      win.localStorage.setItem('refreshTokenExpiresAt', newExpiredTime);
      win.localStorage.setItem('workflow-auth', JSON.stringify({
        username: 'admin',
        roles: ['ROLE_USER'],
        token: 'old-token',
        expiresAt: expiredTime,
      }));
    });

    cy.intercept('POST', '/api/auth/refresh', {
      statusCode: 200,
      headers: {
        'Date': new Date().toUTCString(),
      },
      body: {
        tokenType: 'Bearer',
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
        expiresAt: newExpiredTime,
        refreshExpiresAt: newExpiredTime,
        username: 'admin',
        roles: ['ROLE_USER'],
      },
    }).as('refreshRequest');

    cy.intercept('GET', '/api/tasks/my', {
      statusCode: 200,
      body: [],
    }).as('tasksRequest');

    cy.visit('/');
    cy.wait('@refreshRequest');
    cy.wait('@tasksRequest');
    cy.window().its('localStorage').should('have.property', 'accessToken', 'new-access-token');
  });

  it('should refresh token on 401 response', () => {
    // Use a valid (not expired) token that will be rejected by server (e.g., blacklisted)
    const validExpiry = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const newExpiredTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();

    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'valid-but-rejected-token');
      win.localStorage.setItem('tokenExpiresAt', validExpiry);
      win.localStorage.setItem('refreshToken', 'valid-refresh-token');
      win.localStorage.setItem('refreshTokenExpiresAt', newExpiredTime);
      win.localStorage.setItem('workflow-auth', JSON.stringify({
        username: 'admin',
        roles: ['ROLE_USER'],
        token: 'valid-but-rejected-token',
        expiresAt: validExpiry,
      }));
    });

    let requestCount = 0;
    // First request will fail with 401, retry will succeed
    cy.intercept('GET', '/api/tasks/my', (req) => {
      requestCount++;
      if (requestCount === 1) {
        req.reply({ statusCode: 401 });
      } else {
        req.reply({ statusCode: 200, body: [] });
      }
    }).as('tasksRequest');

    // Refresh will succeed
    cy.intercept('POST', '/api/auth/refresh', {
      statusCode: 200,
      headers: {
        'Date': new Date().toUTCString(),
      },
      body: {
        tokenType: 'Bearer',
        accessToken: 'refreshed-token',
        refreshToken: 'new-refresh-token',
        expiresAt: newExpiredTime,
        refreshExpiresAt: newExpiredTime,
        username: 'admin',
        roles: ['ROLE_USER'],
      },
    }).as('refreshRequest');

    cy.visit('/');
    // Wait for the component to load and make the API call
    cy.wait('@tasksRequest', { timeout: 10000 }); // First request (401)
    cy.wait('@refreshRequest', { timeout: 10000 }); // Refresh
    cy.wait('@tasksRequest', { timeout: 10000 }); // Retry (200)
  });

  it('should logout when refresh token expires', () => {
    // Use expired access token and expired refresh token
    // When access token expires, interceptor will try to refresh
    // But refresh token is also expired, so refreshAccessToken returns null
    // Request proceeds without token → 401 → response interceptor tries refresh again → null → logout
    const expiredTime = new Date(Date.now() - 1000).toISOString();

    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'expired-token');
      win.localStorage.setItem('tokenExpiresAt', expiredTime);
      win.localStorage.setItem('refreshToken', 'expired-refresh-token');
      win.localStorage.setItem('refreshTokenExpiresAt', expiredTime);
      win.localStorage.setItem('workflow-auth', JSON.stringify({
        username: 'admin',
        roles: ['ROLE_USER'],
        token: 'expired-token',
        expiresAt: expiredTime,
      }));
    });

    // Request will be made without token (or with expired token) → 401
    cy.intercept('GET', '/api/tasks/my', {
      statusCode: 401,
    }).as('tasksRequest');

    cy.visit('/');
    // Request interceptor: token expired → try refresh → refresh token expired → null → clear tokens → request without token
    // Response interceptor: 401 → try refresh → refresh token expired → null → dispatch logout
    cy.wait('@tasksRequest', { timeout: 10000 });
    // Should redirect to login after logout event
    cy.url({ timeout: 5000 }).should('include', '/login');
    cy.window().its('localStorage').should('not.have.property', 'accessToken');
  });
});

