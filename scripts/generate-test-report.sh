#!/bin/bash

# Generate comprehensive test report
echo "Generating Test Reports..."

# Create reports directory
mkdir -p reports

# Run E2E tests and capture output
echo "Running E2E tests..."
npm run cy:run > reports/e2e-output.txt 2>&1

# Extract test results
echo "Extracting test results..."
grep -A 20 "Run Finished" reports/e2e-output.txt > reports/e2e-summary.txt

# Run unit tests with coverage
echo "Running unit tests with coverage..."
npm run coverage > reports/coverage-output.txt 2>&1

# Generate summary
cat > reports/test-summary.txt << EOF
Test Execution Summary
======================
Generated: $(date)

E2E Tests (Cypress):
$(grep -E "(Tests|Passing|Failing)" reports/e2e-summary.txt | head -5)

Unit/Component Tests (Vitest):
$(grep -E "(Test Files|Tests|Coverage)" reports/coverage-output.txt | head -10)

EOF

echo "Reports generated in reports/ directory"
echo "- reports/e2e-summary.txt"
echo "- reports/coverage-output.txt"
echo "- reports/test-summary.txt"

