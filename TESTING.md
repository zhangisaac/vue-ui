# Testing Guide

Complete guide for testing in this project, covering unit tests, component tests, E2E tests, coverage, reports, and CI/CD integration.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Test Stack](#test-stack)
3. [Test Automation & Triggers](#test-automation--triggers)
4. [Running Tests](#running-tests)
5. [Test Structure](#test-structure)
6. [Test Coverage](#test-coverage)
7. [Test Reports](#test-reports)
8. [E2E Testing](#e2e-testing)
9. [CI/CD Integration](#cicd-integration)
10. [Writing Tests](#writing-tests)
11. [Troubleshooting](#troubleshooting)

---

## Quick Start

```bash
# Run all tests (unit + E2E) - Recommended
npm run test:all

# Run all tests with coverage
npm run test:all:coverage

# Unit/Component tests only
npm test
npm run test:unit-only

# E2E tests only
npm run cy:open      # Interactive UI
npm run cy:run       # Headless
npm run test:e2e-only

# Generate coverage report
npm run coverage
open coverage/index.html
```

---

## Test Stack

- **Unit & Component Tests**: Vitest + @vue/test-utils + jsdom
- **E2E Tests**: Cypress (component + e2e)
- **Coverage**: c8 (Istanbul) via @vitest/coverage-v8
- **Code Quality**: SonarCloud + SonarLint (VSCode)
- **Linting**: ESLint + TypeScript ESLint + Vue ESLint
- **Security**: npm audit (Vulnerability Assessment)

---

## Test Automation & Triggers

### Summary

| Test Type | Pre-Build | Pre-Commit | CI/CD | Manual | Integrated |
|-----------|-----------|------------|-------|--------|------------|
| **Unit Tests** | ✅ Yes | ✅ Yes | ✅ Yes | `npm test` | `npm run test:all` |
| **Component Tests** | ✅ Yes | ✅ Yes | ✅ Yes | `npm test` | `npm run test:all` |
| **Coverage Report** | ❌ No | ❌ No | ✅ Yes | `npm run coverage` | `npm run test:all:coverage` |
| **E2E Tests** | ❌ No | ❌ No | ✅ Yes* | `npm run cy:open/run` | `npm run test:all` |
| **Linting (ESLint)** | ✅ Yes | ✅ Yes | ✅ Yes | `npm run lint` | `npm run quality:check` |
| **VA (npm audit)** | ❌ No | ❌ No | ✅ Yes | `npm run audit` | `npm run quality:check` |
| **SonarCloud** | ❌ No | ❌ No | ✅ Yes | `npm run sonar:local` | CI/CD only |

*E2E tests in CI run with `continue-on-error: true` (backend may not be available)

### Detailed Trigger Points

#### 1. Pre-Build Trigger
**When**: Before `npm run build`  
**What Runs**: Unit + Component tests  
**Command**: `npm run test`  
**Behavior**: Build aborts if tests fail  
**Location**: `package.json` → `"build": "npm run test && vue-tsc --noEmit && vite build"`

#### 2. Pre-Commit Trigger
**When**: Before `git commit`  
**What Runs**: Tests for staged files only  
**Command**: `vitest --run --related`  
**Behavior**: Commit aborts if tests fail  
**Location**: `.husky/pre-commit` + `lint-staged` config in `package.json`

#### 3. CI/CD Trigger (GitHub Actions)
**When**: On push to `main`/`develop` or on pull requests  
**What Runs**: 
- Check manifest versions
- Run Vulnerability Assessment (npm audit)
- Run linting (ESLint)
- Unit tests with coverage
- Coverage upload to Codecov
- Start Vite dev server
- E2E tests (with continue-on-error)
- Stop dev server
- Type checking
- **SonarCloud analysis** with quality gate

**Location**: `.github/workflows/ci.yml`

**E2E Integration**: 
- Dev server starts automatically
- Waits for server to be ready (up to 60 seconds)
- Runs E2E tests headless
- Cleans up dev server after completion

**SonarCloud Integration**:
- Runs after tests complete
- Uploads coverage (LCOV) to SonarCloud
- Analyzes code quality, security, and coverage
- Enforces quality gate (blocks merge if fails)
- Results visible in SonarCloud dashboard

---

## Running Tests

### Integrated Test Runner (Recommended)

```bash
# Run all tests (unit + E2E) - Auto-starts/stops dev server
npm run test:all

# Run all tests with coverage
npm run test:all:coverage

# Run only unit/component tests
npm run test:unit-only

# Run only E2E tests
npm run test:e2e-only
```

### Unit & Component Tests

```bash
# Run all tests once
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm run test:watch

# Run tests with UI (interactive)
npm run test:ui

# Generate coverage report
npm run coverage

# Coverage with interactive UI
npm run coverage:ui
```

### E2E Tests

```bash
# Open Cypress UI (interactive)
npm run cy:open

# Run Cypress headless
npm run cy:run

# Run specific test file
npx cypress run --spec "cypress/e2e/auth.cy.ts"

# Run with browser visible
npx cypress run --headed
```

### Code Quality & Security

```bash
# Linting
npm run lint              # Check code style
npm run lint:fix          # Auto-fix issues

# Vulnerability Assessment
npm run audit             # Check dependencies
npm run audit:fix         # Fix vulnerabilities

# Complete quality check
npm run quality:check     # Lint + test + audit

# SonarCloud analysis
npm run sonar:local       # Run local analysis
```

**See [SONARCLOUD.md](./SONARCLOUD.md) for complete SonarCloud guide.**

---

## Test Structure

```
tests/
├── unit/              # Unit tests (api.ts, stores, etc.)
│   ├── api.spec.ts
│   ├── auth.store.spec.ts
│   └── auth.store.comprehensive.spec.ts
├── component/         # Component tests
│   └── LoginView.spec.ts
└── setupTests.ts      # Test setup/configuration

cypress/
├── e2e/               # E2E test specs
│   ├── auth.cy.ts
│   ├── routes.cy.ts
│   ├── logout.cy.ts
│   ├── token-refresh.cy.ts
│   ├── token-blacklist.cy.ts
│   └── clock-skew.cy.ts
├── component/         # Component tests (Cypress)
└── support/           # Cypress support files
```

---

## Test Coverage

### Current Coverage

- **Overall**: 83.96% statements, 61.36% branches
- **Views**: 100% coverage ✅
- **Router**: 87.91% coverage
- **Stores**: 85.35% coverage
- **Services**: 24.92% (interceptors tested via E2E)

### Coverage Goals

- **Target**: 90% code coverage
- **Current**: 83.96% (run `npm run coverage` for details)
- **Report**: Open `coverage/index.html` in browser

### Viewing Coverage

```bash
# Generate coverage report
npm run coverage

# Open HTML report (macOS)
open coverage/index.html

# Open HTML report (Linux)
xdg-open coverage/index.html

# Open HTML report (Windows)
start coverage/index.html
```

### Coverage Report Location

**Full Path**: `/Users/zhangisaac/VSCodeProjects/vue-ui/coverage/index.html`  
**Relative Path**: `coverage/index.html` (from project root)

**Report Contents**:
- Summary page with overall statistics
- File browser to navigate through source files
- Line-by-line coverage highlighting:
  - ✅ Green: Covered lines
  - ❌ Red: Uncovered lines
  - ⚪ Gray: Non-executable lines (comments, etc.)
- Coverage metrics: Statement, Branch, Function, Line coverage

### SonarCloud Coverage Integration

Coverage is also integrated into the SonarCloud dashboard:

**Dashboard URL**: https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui

**Coverage in SonarCloud**:
- **Overview Tab**: Coverage percentage displayed prominently
- **Measures Tab**: Detailed coverage metrics, trends, and breakdown by file
- **Code Tab**: Coverage information shown inline with source code
- **Quality Gate**: Coverage thresholds enforced (≥80% recommended)

**See [SONARCLOUD.md](./SONARCLOUD.md) for complete SonarCloud guide.**

---

## Test Reports

### Report Locations

#### E2E Test Reports

**Console Output**:
- **Command**: `npm run cy:run`
- **Location**: Terminal output
- **Contains**: Test execution summary, pass/fail status, duration

**Screenshots (on failure)**:
- **Location**: `cypress/screenshots/`
- **Format**: PNG images
- **When**: Generated automatically on test failures

**Videos (if enabled)**:
- **Location**: `cypress/videos/`
- **Format**: MP4 files
- **When**: Generated if video recording is enabled in `cypress.config.ts`

**Generated Reports**:
- **Location**: `reports/` (after running `npm run test:report`)
- **Files**:
  - `reports/e2e-summary.txt` - E2E test summary
  - `reports/e2e-output.txt` - Full E2E test output
  - `reports/test-summary.txt` - Combined test summary

#### Unit/Component Test Reports

**Coverage Report (HTML)**:
- **Location**: `coverage/index.html`
- **Generate**: `npm run coverage`
- **Contains**: Line coverage, branch coverage, function coverage, statement coverage, file-by-file breakdown

**Coverage Report (LCOV)**:
- **Location**: `coverage/lcov.info`
- **Format**: LCOV format
- **Use**: CI/CD integration (Codecov, SonarCloud, etc.)

**Coverage Report (Text)**:
- **Location**: Console output from `npm run coverage`
- **Contains**: Summary statistics

#### CI/CD Reports

**GitHub Actions**:
- **Location**: GitHub repository → Actions tab
- **Contains**: Test execution logs, coverage reports, build status
- **Workflow**: `.github/workflows/ci.yml`

**Codecov**:
- **Location**: Codecov.io dashboard
- **Contains**: Historical coverage trends
- **Integration**: Automatic via GitHub Actions

**SonarCloud**:
- **URL**: https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui
- **Contains**: Quality gate status, coverage, bugs, vulnerabilities, security hotspots, VA issues, manifest issues, SBT issues
- **See [SONARCLOUD.md](./SONARCLOUD.md) for complete guide**

### Viewing Reports

#### E2E Test Results

**Terminal Output**:
```bash
npm run cy:run
```

**Interactive UI**:
```bash
npm run cy:open
```

**Generated Report**:
```bash
npm run test:report
cat reports/test-summary.txt
```

#### Coverage Report

**HTML Report (Recommended)**:
```bash
npm run coverage
open coverage/index.html
```

**Terminal Output**:
```bash
npm run coverage
```

**Coverage UI**:
```bash
npm run coverage:ui
```

### Test Results Summary

**Current Status**:
- **Pass Rate**: 100% (30/30 tests passing)
  - Unit/Component: 14/14 ✅
  - E2E: 16/16 ✅
- **Coverage**: 83.96% statements, 61.36% branches
- **Duration**: ~6-8 seconds (E2E), ~2 seconds (Unit)

**Test Suites**:

**Unit & Component Tests**:
- `tests/unit/api.spec.ts` - API service tests (2 tests)
- `tests/unit/auth.store.spec.ts` - Auth store tests (2 tests)
- `tests/unit/auth.store.comprehensive.spec.ts` - Comprehensive auth tests (7 tests)
- `tests/unit/app.spec.ts` - App component test (1 test)
- `tests/unit/main.spec.ts` - Main entry test (1 test)
- `tests/component/LoginView.spec.ts` - Login component test (1 test)

**E2E Tests**:
- `cypress/e2e/auth.cy.ts` - Authentication flow (4 tests)
- `cypress/e2e/routes.cy.ts` - Route protection (4 tests)
- `cypress/e2e/logout.cy.ts` - Logout flow (2 tests)
- `cypress/e2e/token-refresh.cy.ts` - Token refresh (3 tests)
- `cypress/e2e/token-blacklist.cy.ts` - Token blacklisting (2 tests)
- `cypress/e2e/clock-skew.cy.ts` - Clock skew handling (1 test)

---

## E2E Testing

### Test Scenarios Coverage

#### 1. Authentication Flow (`cypress/e2e/auth.cy.ts`)
- ✅ Login form display
- ✅ Successful login with valid credentials
- ✅ Error handling for invalid credentials
- ✅ Redirect authenticated users away from login page

#### 2. Token Refresh Flow (`cypress/e2e/token-refresh.cy.ts`)
- ✅ Automatic token refresh before expiry (proactive)
- ✅ Token refresh on 401 response (reactive)
- ✅ Logout when refresh token expires
- ✅ Server time offset handling

#### 3. Logout Flow (`cypress/e2e/logout.cy.ts`)
- ✅ Successful logout clears tokens and redirects
- ✅ Skip backend logout if token is expired (prevents 403)
- ✅ Local token cleanup even if backend call fails

#### 4. Route Protection (`cypress/e2e/routes.cy.ts`)
- ✅ Redirect unauthenticated users to login
- ✅ Allow access to protected routes when authenticated
- ✅ Block non-admin users from admin routes
- ✅ Allow admin users to access admin routes

#### 5. Token Blacklisting (`cypress/e2e/token-blacklist.cy.ts`)
- ✅ Handle blacklisted token by attempting refresh
- ✅ Logout when refresh fails after blacklist
- ✅ Token validation with blacklist check

#### 6. Clock Skew Handling (`cypress/e2e/clock-skew.cy.ts`)
- ✅ Adjust token expiry based on server time
- ✅ Use HTTP Date header for time synchronization
- ✅ Proactive refresh accounting for time offset

### Prerequisites

1. **Backend must be running** on `http://localhost:8080` (for full functionality)
2. **Frontend dev server** - Auto-started by integrated runner, or manually start with `npm run dev`

### Test Environment Setup

**Integrated Test Runner** (`npm run test:all`):
- Automatically starts Vite dev server before E2E tests
- Waits for server to be ready
- Runs E2E tests
- Automatically stops dev server after completion

**Manual Execution**:
- Requires Vite dev server running: `npm run dev`
- Uses proxy configuration from `vite.config.ts`
- Clears localStorage between tests
- Mocks API responses using `cy.intercept()`

### Test Data & Mocking

All E2E tests use `cy.intercept()` to mock backend responses:

```typescript
cy.intercept('POST', '/api/auth/login', {
  statusCode: 200,
  body: {
    tokenType: 'Bearer',
    accessToken: 'mock-token',
    refreshToken: 'mock-refresh-token',
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    refreshExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    username: 'admin',
    roles: ['ROLE_ADMIN', 'ROLE_USER'],
  },
}).as('loginRequest');
```

### Test Users

- **Admin User**: `admin` / `admin` - Has `ROLE_ADMIN` and `ROLE_USER`
- **Regular User**: `user` / `user` - Has only `ROLE_USER`

### Debugging E2E Tests

**View Test Execution**:
```bash
npm run cy:open  # Opens Cypress UI with video recording
```

**Debug Failed Tests**:
1. Check Cypress screenshots in `cypress/screenshots/`
2. Check videos in `cypress/videos/`
3. Use `cy.debug()` in test code
4. Use browser DevTools in Cypress UI

**Common Issues**:
1. **Backend not running**: Error: `ECONNREFUSED` or timeout - Solution: Start backend on port 8080
2. **Token expiry issues**: Tests fail due to expired tokens - Solution: Ensure mock tokens have valid expiry times
3. **Route redirects**: Unexpected redirects - Solution: Check localStorage state and auth store initialization

### Adding New E2E Tests

1. Create test file in `cypress/e2e/`
2. Follow existing test patterns
3. Mock API responses with `cy.intercept()`
4. Clear localStorage in `beforeEach()`
5. Use descriptive test names
6. Group related tests in `describe()` blocks

Example:
```typescript
describe('New Feature', () => {
  beforeEach(() => {
    cy.clearLocalStorage();
    // Setup test data
  });

  it('should do something', () => {
    cy.intercept('GET', '/api/endpoint', {
      statusCode: 200,
      body: { data: 'test' },
    }).as('apiCall');

    cy.visit('/');
    cy.wait('@apiCall');
    // Assertions
  });
});
```

---

## CI/CD Integration

### Overview

E2E testing and code quality analysis are integrated both **locally** and on the **server side (CI/CD)**, with SonarCloud providing comprehensive quality metrics across the entire SDLC.

### CI/CD Workflow Steps

1. **Setup Environment**
   - Checkout code
   - Setup Node.js 20
   - Install dependencies

2. **Quality Checks**
   - Check manifest versions (package.json)
   - Run Vulnerability Assessment (npm audit)
   - Run linting (ESLint)

3. **Run Unit Tests with Coverage**
   - Executes: `npm run coverage`
   - Uploads coverage to Codecov

4. **Start Vite Dev Server**
   - Starts dev server in background
   - Waits for server to be ready (up to 60 seconds)

5. **Run E2E Tests**
   - Executes: `npm run cy:run`
   - Uses `CYPRESS_baseUrl: http://localhost:5173`
   - Continues on error (backend may not be available)

6. **Stop Dev Server**
   - Cleans up dev server process

7. **Type Check**
   - Runs TypeScript type checking

8. **SonarCloud Analysis**
   - Runs SonarCloud scanner
   - Uploads coverage (LCOV) to SonarCloud
   - Analyzes code quality, security, and coverage
   - Enforces quality gate (blocks merge if fails)

### Test Execution Flow

**Local Development**:
```
Developer runs: npm run test:all
Developer runs: npm run sonar:local (optional)
  ↓
1. Run unit/component tests
  ↓
2. Start Vite dev server (if not running)
  ↓
3. Run E2E tests
  ↓
4. Stop dev server
  ↓
5. Show results
```

**CI/CD Pipeline**:
```
GitHub Actions triggered (push/PR)
  ↓
1. Setup environment
  ↓
2. Check manifest versions
  ↓
3. Run Vulnerability Assessment (npm audit)
  ↓
4. Run linting (ESLint)
  ↓
5. Run unit tests + coverage
  ↓
6. Upload coverage to Codecov
  ↓
7. Start Vite dev server
  ↓
8. Run E2E tests
  ↓
9. Stop dev server
  ↓
10. Type check
  ↓
11. SonarCloud analysis + quality gate
  ↓
12. Report results
```

### Verification

**Check Local Integration**:
```bash
# Run integrated test suite
npm run test:all

# Should see:
# ✓ Unit/Component tests
# ✓ E2E tests
# ✓ All passing
```

**Check CI/CD Integration**:
1. Push code to `main` or `develop` branch
2. Check GitHub Actions tab
3. Verify workflow runs:
   - ✅ Unit tests pass
   - ✅ E2E tests run (may show warnings if backend unavailable)
   - ✅ Coverage uploaded
   - ✅ SonarCloud analysis completes

---

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useAuthStore } from '@/stores/auth';

describe('Auth Store', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should login and persist tokens', async () => {
    const store = useAuthStore();
    // ... test implementation
  });
});
```

### Component Test Example

```typescript
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import LoginView from '@/views/LoginView.vue';

describe('LoginView', () => {
  it('should render login form', () => {
    const wrapper = mount(LoginView);
    expect(wrapper.find('form').exists()).toBe(true);
  });
});
```

### Test Naming Convention

- **E2E**: `*.cy.ts` (e.g., `auth.cy.ts`)
- **Unit**: `*.spec.ts` (e.g., `api.spec.ts`)

### Best Practices

- Use descriptive test names
- Group related tests in `describe()` blocks
- Mock external dependencies
- Clean up state between tests
- Use appropriate assertions

---

## Troubleshooting

### Tests fail in CI but pass locally
- Check Node.js version matches CI (see `.github/workflows/ci.yml`)
- Ensure all dependencies are installed: `npm ci`
- Check if backend service is required for E2E tests

### E2E tests fail locally
- Ensure Vite dev server is running: `npm run dev`
- Or use integrated runner: `npm run test:all` (auto-starts server)
- Check backend service is running on `http://localhost:8080`

### Coverage not generating
- Check `vite.config.ts` has coverage configuration
- Ensure `@vitest/coverage-v8` is installed
- Run `npm run coverage` to generate report

### Pre-commit hook not running
- Run `npm run prepare` to install Husky hooks
- Ensure `.husky/pre-commit` is executable: `chmod +x .husky/pre-commit`

### Dev server not starting in CI
- Check GitHub Actions logs
- Verify port 5173 is available
- Check timeout settings in workflow

### Local E2E Tests Failing
- **Issue**: Dev server not running
- **Solution**: Run `npm run test:all` (auto-starts server) or manually start with `npm run dev`

### CI/CD E2E Tests Failing
- **Issue**: Backend not available
- **Solution**: This is expected - tests use `continue-on-error: true`
- **To fix**: Set up backend service in CI or use service containers

### Coverage Report Not Generating
```bash
# Check if coverage package is installed
npm list @vitest/coverage-v8

# Reinstall if needed
npm install --save-dev @vitest/coverage-v8
```

### E2E Test Reports Missing
```bash
# Ensure Cypress is installed
npm list cypress

# Run tests to generate reports
npm run cy:run
```

**See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for more solutions.**

---

## Related Documentation

- **[SONARCLOUD.md](./SONARCLOUD.md)** - Complete SonarCloud integration guide
- **[ARCHITECTURE_FLOW.md](./ARCHITECTURE_FLOW.md)** - Architecture and flow diagrams
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
