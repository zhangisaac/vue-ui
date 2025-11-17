# Test Scripts

## Integrated Test Runner

### `run-all-tests.sh` - Run All Tests (Unit + E2E)

Runs both unit/component tests and E2E tests in sequence.

**Usage:**
```bash
# Run all tests (unit + E2E)
npm run test:all

# Or directly
./scripts/run-all-tests.sh
```

**Options:**
```bash
# Run with coverage report
npm run test:all:coverage
# Or
./scripts/run-all-tests.sh --coverage-only

# Run only unit tests
npm run test:unit-only
# Or
./scripts/run-all-tests.sh --skip-e2e

# Run only E2E tests
npm run test:e2e-only
# Or
./scripts/run-all-tests.sh --skip-unit
```

**Features:**
- Automatically starts Vite dev server for E2E tests if not running
- Stops dev server after tests complete
- Color-coded output
- Exit codes for CI/CD integration
- Coverage report generation

## Test Report Generator

### `generate-test-report.sh` - Generate Test Reports

Generates comprehensive test reports including E2E and coverage.

**Usage:**
```bash
npm run test:report
# Or
./scripts/generate-test-report.sh
```

**Output:**
- `reports/e2e-summary.txt` - E2E test summary
- `reports/coverage-output.txt` - Coverage output
- `reports/test-summary.txt` - Combined summary

## Quick Reference

| Command | Description |
|---------|-------------|
| `npm run test:all` | Run all tests (unit + E2E) |
| `npm run test:all:coverage` | Run all tests with coverage |
| `npm run test:unit-only` | Run only unit/component tests |
| `npm run test:e2e-only` | Run only E2E tests |
| `npm run test:report` | Generate test reports |
| `npm test` | Run unit/component tests only |
| `npm run cy:run` | Run E2E tests only |
| `npm run coverage` | Generate coverage report |

