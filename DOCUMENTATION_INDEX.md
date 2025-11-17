# Documentation Index

Complete guide to all project documentation with unified vision of testing and quality integration.

## 📚 Core Documentation

### Getting Started
- **[README.md](./README.md)** - Project overview, quick start, features, and setup
  - Includes comprehensive testing section
  - Quick test commands
  - Project structure with test directories
  - Complete documentation links

### Architecture & Design
- **[ARCHITECTURE_FLOW.md](./ARCHITECTURE_FLOW.md)** - Complete architecture diagrams
  - Vue to Spring Boot connection flow
  - CORS handling
  - Token refresh and blacklisting flows
  - **E2E Testing Architecture** (NEW)
  - **E2E Test Execution Flow** (NEW)
  - **Test Coverage Architecture** (NEW)
  - Testing integration details

## 🧪 Testing Documentation

### Testing Documentation
- **[TESTING.md](./TESTING.md)** - Complete testing guide
  - Quick start and test stack
  - Test automation & triggers (pre-build, pre-commit, CI/CD)
  - Running tests (unit, component, E2E)
  - Test structure and coverage
  - Test reports and viewing
  - E2E testing details
  - CI/CD integration
  - Writing tests
  - Troubleshooting

## 🛠️ Scripts & Tools

- **[scripts/README.md](./scripts/README.md)** - Test script documentation
  - Integrated test runner (`run-all-tests.sh`)
  - Test report generator
  - Quick reference commands

## 🔍 Code Quality & Security Documentation

### SonarCloud Integration
- **[SONARCLOUD.md](./SONARCLOUD.md)** - Complete SonarCloud integration guide
  - Quick start guide
  - Setup instructions (account, VSCode, CI/CD)
  - Dashboard guide (all sections, metrics, quality gates)
  - Running analysis locally
  - Troubleshooting common issues
  - Dashboard links and access

## 🔧 Troubleshooting

- **[TROUBLESHOOTING.md](./TROUBLESHOOTING.md)** - Common issues and solutions
  - CORS errors
  - Token refresh issues
  - Logout problems
  - Test failures
  - Coverage issues
  - E2E test failures
  - Unit test failures
  - SonarCloud issues

## 📊 Current Status

### Test Results
- **Pass Rate**: 100% (30/30 tests)
  - Unit/Component: 14/14 ✅
  - E2E: 16/16 ✅
- **Coverage**: 83.96% statements, 61.36% branches

### Test Integration
- ✅ **Local**: Integrated test runner with auto dev server management
- ✅ **CI/CD**: Full E2E integration in GitHub Actions
- ✅ **Pre-Build**: Unit tests run automatically
- ✅ **Pre-Commit**: Tests run on staged files

## 🚀 Quick Commands

```bash
# Run all tests (unit + E2E) - Recommended
npm run test:all

# Run all tests with coverage
npm run test:all:coverage

# Unit/Component tests only
npm test
npm run test:unit-only

# E2E tests only
npm run test:e2e-only
npm run cy:open      # Interactive
npm run cy:run       # Headless

# Coverage report
npm run coverage
open coverage/index.html

# Generate test reports
npm run test:report
```

## 📖 Documentation Structure

```
Documentation/
├── README.md                    # Main project documentation
├── ARCHITECTURE_FLOW.md         # Architecture & flow diagrams
├── TESTING.md                   # Complete testing guide (unit, component, E2E, coverage, reports, CI/CD)
├── SONARCLOUD.md                # Complete SonarCloud integration guide
├── TROUBLESHOOTING.md           # Common issues & solutions
├── DOCUMENTATION_INDEX.md       # This file
└── scripts/
    └── README.md                # Test scripts documentation
```

## 🎯 Unified Vision

All documentation reflects the integrated testing and quality approach:

1. **Local Development**: 
   - Integrated test runner (`npm run test:all`) automatically manages dev server lifecycle
   - SonarLint provides real-time code quality feedback in VSCode
   - Local SonarCloud analysis available (`npm run sonar:local`)

2. **CI/CD Pipeline**: 
   - GitHub Actions workflow automatically starts/stops dev server for E2E tests
   - SonarCloud analysis runs automatically with quality gate enforcement
   - Vulnerability Assessment (npm audit) integrated
   - Coverage uploaded to both Codecov and SonarCloud

3. **Test Coverage**: 
   - 83.96% overall, 100% pass rate across all test types
   - Coverage integrated with SonarCloud quality metrics
   - Quality gates enforce coverage thresholds

4. **Code Quality**: 
   - SonarCloud dashboard as golden reference
   - VA issues, manifest issues, SBT issues tracked
   - Quality gates block merges if standards not met

5. **Test Automation**: 
   - Pre-build, pre-commit, and CI/CD triggers for comprehensive coverage
   - Quality checks integrated into build process

6. **Documentation**: 
   - All docs updated to reflect unified testing and quality strategy

## 🔗 Related Resources

- **GitHub Actions**: `.github/workflows/ci.yml`
- **Cypress Config**: `cypress.config.ts`
- **Vitest Config**: `vite.config.ts` (test section)
- **Test Scripts**: `scripts/run-all-tests.sh`, `scripts/generate-test-report.sh`
- **SonarCloud Config**: `sonar-project.properties`
- **VSCode Settings**: `.vscode/settings.json` (SonarLint, ESLint)
- **ESLint Config**: `.eslintrc.cjs`
- **SonarCloud Dashboard**: https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui

