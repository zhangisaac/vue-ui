# Workflow BPMN Dashboard

Vue 3 + TypeScript dashboard for the Workflow BPMN Service. This frontend application provides a user interface for authentication, task management, and administrator operations with comprehensive testing coverage.

## Features

- **Authentication:** JWT-based login with role-based access control, token refresh, and blacklisting
- **Task Management:** View and complete assigned tasks, claim group tasks
- **Process Administration:** Deploy BPMN definitions, start process instances, monitor active and completed processes (admin only)
- **Modern UI:** Clean, responsive design built with Vue 3 Composition API
- **Comprehensive Testing:** Unit, component, and E2E tests with 83.96% code coverage
- **Code Quality:** SonarCloud integration for code quality, security, and coverage analysis

## Prerequisites

- Node.js 18+
- npm or yarn
- Backend service running on `http://localhost:8080` (for full functionality)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:8080`.

3. **Run tests:**
   ```bash
   # Run all tests (unit + E2E)
   npm run test:all
   
   # Run only unit/component tests
   npm test
   
   # Run only E2E tests
   npm run test:e2e-only
   ```

4. **Production build:**
   ```bash
   npm run build
   npm run preview
   ```

## Project Structure

```
vue-ui/
├── src/
│   ├── components/     # Reusable Vue components
│   ├── router/         # Vue Router configuration
│   ├── services/       # API client and service functions
│   ├── stores/         # Pinia state management (auth store)
│   ├── types/          # TypeScript type definitions
│   └── views/          # Page components
│       ├── LoginView.vue
│       ├── ShellView.vue
│       ├── UserTasksView.vue
│       ├── CandidateTasksView.vue
│       └── AdminProcessesView.vue
├── tests/
│   ├── unit/           # Unit tests (Vitest)
│   ├── component/      # Component tests (Vitest)
│   └── setupTests.ts   # Test configuration
├── cypress/
│   ├── e2e/            # E2E test specs (Cypress)
│   └── support/        # Cypress support files
├── scripts/
│   ├── run-all-tests.sh        # Integrated test runner
│   └── generate-test-report.sh # Test report generator
├── .vscode/
│   ├── settings.json           # VSCode settings (SonarLint, ESLint)
│   ├── extensions.json         # Recommended extensions
│   └── launch.json             # Debug configurations
├── sonar-project.properties    # SonarCloud configuration
└── .github/
    └── workflows/
        └── ci.yml      # CI/CD pipeline with tests and SonarCloud
```

## Testing

This project has comprehensive test coverage with **100% pass rate** and **83.96% code coverage**.

### Test Stack

- **Unit & Component Tests**: Vitest + @vue/test-utils + jsdom
- **E2E Tests**: Cypress (component + e2e)
- **Coverage**: c8 (Istanbul) via @vitest/coverage-v8

### Quick Test Commands

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

# Coverage report
npm run coverage
open coverage/index.html
```

### Test Automation

- ✅ **Pre-Build**: Unit tests run automatically before build
- ✅ **Pre-Commit**: Tests run on staged files (via Husky)
- ✅ **CI/CD**: Full test suite runs on push/PR (GitHub Actions)
  - Unit tests with coverage
  - E2E tests (with dev server auto-start)
  - Coverage upload to Codecov

### Test Coverage

- **Overall**: 83.96% statements, 61.36% branches
- **Views**: 100% coverage
- **Router**: 87.91% coverage
- **Stores**: 85.35% coverage
- **Services**: 24.92% (interceptors tested via E2E)

**See [TESTING.md](./TESTING.md) for detailed testing guide.**

## Backend Integration

This frontend connects to the Workflow BPMN Service backend API. Ensure the backend is running on `http://localhost:8080` before starting the frontend.

### API Endpoints Used

- `POST /api/auth/login` - User authentication
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout and blacklist token
- `GET /api/tasks/my` - Get tasks assigned to current user
- `GET /api/tasks/candidate` - Get group tasks available to current user
- `POST /api/tasks/{id}/claim` - Claim a group task
- `POST /api/tasks/{id}/complete` - Complete a task
- `POST /api/processes/deploy` - Deploy BPMN definition (admin only)
- `POST /api/processes/start` - Start a process instance (admin only)
- `GET /api/processes/active` - List active instances (admin only)
- `GET /api/processes/completed` - List completed instances (admin only)
- `POST /api/processes/{id}/suspend|activate` - Control instance state (admin only)
- `DELETE /api/processes/{id}` - Delete an instance (admin only)

### Connection Flow

The frontend connects to the backend through:
1. **Vite Dev Server Proxy** - Forwards `/api` requests to `localhost:8080`
2. **CORS Handling** - Backend allows `localhost:5173` origin
3. **JWT Authentication** - Access tokens + refresh tokens with automatic refresh
4. **Token Blacklisting** - Tokens are blacklisted on logout

**See [ARCHITECTURE_FLOW.md](./ARCHITECTURE_FLOW.md) for detailed architecture diagrams.**

## Default Users

| Username | Password | Roles                     | Candidate Groups       |
|----------|----------|---------------------------|------------------------|
| admin    | admin    | ROLE_ADMIN, ROLE_USER     | managers, hr_staff     |
| user     | user     | ROLE_USER                 | employees              |
| manager  | manager  | ROLE_USER                 | managers               |
| hr       | hr       | ROLE_USER                 | hr_staff               |

## Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Vue Router** - Official router for Vue.js
- **Pinia** - State management for Vue
- **Axios** - HTTP client for API requests
- **Vitest** - Unit and component testing
- **Cypress** - E2E testing framework
- **SonarCloud** - Code quality and security analysis
- **ESLint** - Code linting and style checking

## Development

### Development Server

The development server uses Vite's HMR (Hot Module Replacement) for fast development. Changes to Vue components will be reflected immediately without a full page reload.

```bash
npm run dev
```

### Running Tests During Development

```bash
# Watch mode (auto-rerun on file changes)
npm run test:watch

# Interactive test UI
npm run test:ui

# E2E tests in interactive mode
npm run cy:open
```

## Code Quality & Security

This project uses **SonarCloud** for comprehensive code quality, security, and coverage analysis.

### SonarCloud Dashboard

**Dashboard URL**: https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui

**Features**:
- ✅ **Code Quality Metrics**: Bugs, vulnerabilities, code smells
- ✅ **Security Analysis**: OWASP Top 10, security hotspots, dependency vulnerabilities
- ✅ **Coverage Integration**: Test coverage (83.96%) integrated with quality metrics
- ✅ **Vulnerability Assessment (VA)**: npm audit integration
- ✅ **Manifest Version Issues**: package.json analysis
- ✅ **Build Tool (SBT) Issues**: Build process analysis
- ✅ **Quality Gates**: Enforce quality standards

### Local Analysis

```bash
# Run SonarCloud analysis locally
npm run sonar:local

# Or step by step
npm run coverage
sonar-scanner
```

### VSCode Integration

- **SonarLint Extension**: Real-time code quality feedback in IDE
- **Connected Mode**: Syncs with SonarCloud for consistent rules
- **Auto-fix Suggestions**: Quick fixes for common issues

**See [SONARCLOUD.md](./SONARCLOUD.md) for complete SonarCloud guide.**

## CI/CD Pipeline

The project includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. Checks manifest versions
2. Runs Vulnerability Assessment (npm audit)
3. Runs linting (ESLint)
4. Runs unit tests with coverage
5. Uploads coverage to Codecov
6. Starts Vite dev server
7. Runs E2E tests
8. Performs type checking
9. **Runs SonarCloud analysis** with quality gate enforcement

**See [TESTING.md](./TESTING.md) for complete testing guide including CI/CD details.**

## Documentation

### Core Documentation
- **[ARCHITECTURE_FLOW.md](./ARCHITECTURE_FLOW.md)** - Architecture diagrams and connection flows
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Complete documentation index

### Testing Documentation
- **[TESTING.md](./TESTING.md)** - Complete testing guide (unit, component, E2E, coverage, reports, CI/CD)

### Code Quality & Security
- **[SONARCLOUD.md](./SONARCLOUD.md)** - Complete SonarCloud integration guide (setup, dashboard, local analysis, troubleshooting)

### Troubleshooting & Reference
- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions

## License

MIT (see `LICENSE` if provided) or adapt to your organisational standards.
