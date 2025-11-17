describe('Clock Skew Handling', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
  });

  it('should adjust token expiry based on server time', () => {
    const clientTime = Date.now();
    const serverTime = clientTime + 5 * 60 * 1000; // Server is 5 minutes ahead
    const serverDateHeader = new Date(serverTime).toUTCString();

    // Token expires in 1 minute according to client, but already expired on server
    const tokenExpiry = new Date(clientTime + 60 * 1000).toISOString();
    const refreshExpiry = new Date(clientTime + 2 * 60 * 60 * 1000).toISOString();

    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'token');
      win.localStorage.setItem('tokenExpiresAt', tokenExpiry);
      win.localStorage.setItem('refreshToken', 'refresh-token');
      win.localStorage.setItem('refreshTokenExpiresAt', refreshExpiry);
      win.localStorage.setItem('workflow-auth', JSON.stringify({
        username: 'admin',
        roles: ['ROLE_USER'],
        token: 'token',
        expiresAt: tokenExpiry,
      }));
    });

    // First request will trigger refresh due to expiry check
    cy.intercept('GET', '/api/tasks/my', {
      statusCode: 200,
      headers: {
        'Date': serverDateHeader,
      },
      body: [],
    }).as('tasksRequest');

    cy.intercept('POST', '/api/auth/refresh', {
      statusCode: 200,
      headers: {
        'Date': serverDateHeader,
      },
      body: {
        tokenType: 'Bearer',
        accessToken: 'new-token',
        refreshToken: 'new-refresh-token',
        expiresAt: new Date(serverTime + 2 * 60 * 60 * 1000).toISOString(),
        refreshExpiresAt: new Date(serverTime + 7 * 24 * 60 * 60 * 1000).toISOString(),
        username: 'admin',
        roles: ['ROLE_USER'],
      },
    }).as('refreshRequest');

    cy.visit('/');
    // Should detect expiry based on server time and refresh
    cy.wait('@refreshRequest', { timeout: 10000 });
    cy.wait('@tasksRequest', { timeout: 10000 });
  });
});

