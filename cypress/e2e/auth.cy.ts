describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    cy.visit('/login');
  });

  it('should display login form', () => {
    cy.get('form').should('exist');
    cy.get('input[placeholder="Enter username"]').should('exist');
    cy.get('input[type="password"]').should('exist');
    cy.get('button[type="submit"]').should('exist');
  });

  it('should login successfully with valid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 200,
      body: {
        tokenType: 'Bearer',
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
        refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        username: 'admin',
        roles: ['ROLE_ADMIN', 'ROLE_USER'],
      },
    }).as('loginRequest');

    cy.get('input[placeholder="Enter username"]').type('admin');
    cy.get('input[type="password"]').type('admin');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.url().should('not.include', '/login');
    cy.window().its('localStorage').should('have.property', 'accessToken');
    cy.window().its('localStorage').should('have.property', 'refreshToken');
  });

  it('should show error on invalid credentials', () => {
    cy.intercept('POST', '/api/auth/login', {
      statusCode: 401,
      body: { message: 'Invalid credentials' },
    }).as('loginRequest');

    cy.get('input[placeholder="Enter username"]').type('invalid');
    cy.get('input[type="password"]').type('invalid');
    cy.get('button[type="submit"]').click();

    cy.wait('@loginRequest');
    cy.get('.error').should('be.visible');
    cy.url().should('include', '/login');
  });

  it('should redirect authenticated users away from login page', () => {
    cy.window().then((win) => {
      win.localStorage.setItem('accessToken', 'mock-token');
      win.localStorage.setItem('workflow-auth', JSON.stringify({
        username: 'admin',
        roles: ['ROLE_USER'],
        token: 'mock-token',
      }));
    });

    cy.visit('/login');
    cy.url().should('not.include', '/login');
  });
});

