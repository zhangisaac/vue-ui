#!/bin/bash

# Integrated Test Runner - Runs all tests (Unit + E2E) with coverage and SonarCloud analysis
# Usage: ./scripts/run-all-tests.sh [--skip-e2e] [--skip-unit] [--coverage-only] [--skip-sonar]

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Parse arguments
SKIP_E2E=false
SKIP_UNIT=false
COVERAGE_ONLY=false
SKIP_SONAR=false

for arg in "$@"; do
  case $arg in
    --skip-e2e)
      SKIP_E2E=true
      shift
      ;;
    --skip-unit)
      SKIP_UNIT=true
      shift
      ;;
    --coverage-only)
      COVERAGE_ONLY=true
      shift
      ;;
    --skip-sonar)
      SKIP_SONAR=true
      shift
      ;;
    *)
      # Unknown option
      ;;
  esac
done

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Integrated Test Suite Runner${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Function to check if dev server is running
check_dev_server() {
  if curl -s http://localhost:5173 > /dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Start dev server if not running (for E2E tests)
start_dev_server() {
  if ! check_dev_server; then
    echo -e "${YELLOW}Starting Vite dev server for E2E tests...${NC}"
    npm run dev > /dev/null 2>&1 &
    DEV_SERVER_PID=$!
    echo -e "${GREEN}Dev server started (PID: $DEV_SERVER_PID)${NC}"
    
    # Wait for server to be ready
    echo -e "${YELLOW}Waiting for dev server to be ready...${NC}"
    for i in {1..30}; do
      if check_dev_server; then
        echo -e "${GREEN}Dev server is ready!${NC}"
        return 0
      fi
      sleep 1
    done
    
    echo -e "${RED}Dev server failed to start${NC}"
    return 1
  else
    echo -e "${GREEN}Dev server is already running${NC}"
    return 0
  fi
}

# Stop dev server
stop_dev_server() {
  if [ ! -z "$DEV_SERVER_PID" ]; then
    echo -e "${YELLOW}Stopping dev server (PID: $DEV_SERVER_PID)...${NC}"
    kill $DEV_SERVER_PID 2>/dev/null || true
    wait $DEV_SERVER_PID 2>/dev/null || true
    echo -e "${GREEN}Dev server stopped${NC}"
  fi
}

# Trap to ensure dev server is stopped on exit
trap stop_dev_server EXIT

# Run Unit/Component Tests
if [ "$SKIP_UNIT" = false ]; then
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Running Unit & Component Tests${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  
  if [ "$COVERAGE_ONLY" = true ]; then
    npm run coverage
  else
    npm test
  fi
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Unit/Component tests passed${NC}"
  else
    echo -e "${RED}✗ Unit/Component tests failed${NC}"
    exit 1
  fi
  echo ""
else
  echo -e "${YELLOW}⏭ Skipping Unit/Component tests${NC}"
  echo ""
fi

# Run SonarCloud Analysis
if [ "$SKIP_SONAR" = false ]; then
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Running SonarCloud Analysis${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  
  # Ensure coverage exists (sonar:local will generate it if needed)
  if [ ! -f "coverage/lcov.info" ] && [ "$SKIP_UNIT" = false ]; then
    echo -e "${YELLOW}Coverage report not found. Generating coverage first...${NC}"
    npm run coverage
  fi
  
  npm run sonar:local
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SonarCloud analysis completed${NC}"
  else
    echo -e "${YELLOW}⚠ SonarCloud analysis had issues (continuing anyway)${NC}"
  fi
  echo ""
else
  echo -e "${YELLOW}⏭ Skipping SonarCloud analysis${NC}"
  echo ""
fi

# Run E2E Tests
if [ "$SKIP_E2E" = false ]; then
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}Running E2E Tests${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  
  # Start dev server if needed
  if ! start_dev_server; then
    echo -e "${RED}Failed to start dev server. E2E tests cannot run.${NC}"
    exit 1
  fi
  
  npm run cy:run
  
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ E2E tests passed${NC}"
  else
    echo -e "${RED}✗ E2E tests failed${NC}"
    exit 1
  fi
  echo ""
else
  echo -e "${YELLOW}⏭ Skipping E2E tests${NC}"
  echo ""
fi

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ All tests completed successfully!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Show coverage report location if generated
if [ "$COVERAGE_ONLY" = true ] || [ "$SKIP_UNIT" = false ]; then
  if [ -f "coverage/index.html" ]; then
    echo -e "${GREEN}Coverage report available at:${NC}"
    echo -e "${BLUE}  file://$(pwd)/coverage/index.html${NC}"
    echo ""
    echo -e "${YELLOW}To view: open coverage/index.html${NC}"
    echo ""
  fi
fi

# Show SonarCloud dashboard link if analysis was run
if [ "$SKIP_SONAR" = false ]; then
  echo -e "${GREEN}SonarCloud dashboard:${NC}"
  echo -e "${BLUE}  https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui${NC}"
  echo ""
fi

