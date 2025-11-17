# SonarCloud Integration Guide

Complete guide for SonarCloud integration with VSCode IDE, covering setup, dashboard usage, local analysis, and troubleshooting. This serves as the golden reference for code quality, security, and coverage across the entire SDLC.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Setup Guide](#setup-guide)
3. [Dashboard Guide](#dashboard-guide)
4. [Running Analysis Locally](#running-analysis-locally)
5. [Troubleshooting](#troubleshooting)
6. [Dashboard Links](#dashboard-links)

---

## Quick Start

### 1. Install Dependencies
```bash
npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin eslint-plugin-vue
```

### 2. Create SonarCloud Account
1. Go to https://sonarcloud.io
2. Sign in with GitHub
3. Create organization → Note your **organization key** (e.g., `zhangisaac`)
4. Create project from GitHub repository → Note your **project key** (e.g., `zhangisaac_vue-ui`)
5. Get token: My Account → Security → Generate token

### 3. Configure Project
1. **Set Environment Variable**:
   ```bash
   # macOS/Linux
   export SONAR_TOKEN=your-sonarcloud-token-here
   
   # Windows (PowerShell)
   $env:SONAR_TOKEN="your-sonarcloud-token-here"
   ```

2. **Update Configuration Files**:
   - `sonar-project.properties`: Already configured with `zhangisaac_vue-ui`
   - `.vscode/settings.json`: Already configured (uses `SONAR_TOKEN` env var)

3. **Add GitHub Secret**:
   - Repository → Settings → Secrets → Actions
   - Add `SONAR_TOKEN` with your SonarCloud token

### 4. Install VSCode Extensions
- SonarLint (by SonarSource)
- ESLint (by Microsoft)
- Volar (by Vue.js)

### 5. Verify
- Check SonarLint output: "Connected to SonarCloud"
- Run: `npm run sonar:local`
- Check dashboard: https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui

---

## Setup Guide

### Prerequisites

- GitHub account
- SonarCloud account (free for public repos)
- VSCode installed
- Node.js 18+ installed
- Project dependencies installed

### Step 1: Create SonarCloud Account and Project

#### 1.1 Sign Up for SonarCloud

1. Go to https://sonarcloud.io
2. Click "Log in" → "Log in with GitHub"
3. Authorize SonarCloud to access your GitHub account
4. Complete the signup process

#### 1.2 Create Organization (if needed)

1. In SonarCloud, go to "My Account" → "Organizations"
2. Click "Create Organization"
3. Choose plan (Free for public repos)
4. Note your **Organization Key** (e.g., `zhangisaac`)

#### 1.3 Create Project

1. Go to "Projects" → "Create Project"
2. Select "From GitHub"
3. Choose your repository: `vue-ui` (or your repo name)
4. Click "Set Up"
5. Choose "With GitHub Actions" (recommended)
6. Note your **Project Key** (e.g., `zhangisaac_vue-ui`)

#### 1.4 Get Authentication Token

1. Go to "My Account" → "Security"
2. Generate a new token (name it "VSCode" or "CI/CD")
3. **Copy and save the token** (you won't see it again!)
4. This is your `SONAR_TOKEN`

### Step 2: Configure VSCode IDE

#### 2.1 Install Required Extensions

1. Open VSCode
2. Go to Extensions (Cmd+Shift+X / Ctrl+Shift+X)
3. Install these extensions:
   - **SonarLint** (by SonarSource)
   - **ESLint** (by Microsoft)
   - **Volar** (by Vue.js)
   - **Prettier** (by Prettier)

Or use the provided `.vscode/extensions.json`:
- VSCode will prompt to install recommended extensions

#### 2.2 Configure SonarLint Connection

**Using Environment Variable (Recommended)**:

1. **Set Environment Variable**:
   ```bash
   # macOS/Linux
   export SONAR_TOKEN=your-sonarcloud-token-here
   
   # Windows (PowerShell)
   $env:SONAR_TOKEN="your-sonarcloud-token-here"
   
   # To make permanent (macOS/Linux)
   echo 'export SONAR_TOKEN=your-sonarcloud-token-here' >> ~/.bashrc
   source ~/.bashrc
   ```

2. **Verify `.vscode/settings.json`**:
   - Should reference `${env:SONAR_TOKEN}`
   - Organization: `zhangisaac`
   - Project Key: `zhangisaac_vue-ui`

3. **Restart VSCode** to apply settings

#### 2.3 Verify Connection

1. Open any `.ts` or `.vue` file
2. Check SonarLint output:
   - Open Output panel (Cmd+Shift+U / Ctrl+Shift+U)
   - Select "SonarLint" from dropdown
   - Look for "Connected to SonarCloud" message
3. Check Problems panel:
   - Issues should show "SonarLint" prefix
   - Connected mode issues will sync with SonarCloud

### Step 3: Configure CI/CD (GitHub Actions)

The CI/CD workflow (`.github/workflows/ci.yml`) is already configured with:

- ✅ SonarCloud scan step
- ✅ Coverage upload (LCOV format)
- ✅ Quality gate enforcement
- ✅ npm audit (Vulnerability Assessment)

**To enable**:

1. Add GitHub Secret:
   - Repository → Settings → Secrets → Actions
   - Add `SONAR_TOKEN` with your SonarCloud token

2. Push code to trigger workflow
3. Check GitHub Actions tab for SonarCloud scan results

### Step 4: Project Configuration

The project is already configured with:

- ✅ `sonar-project.properties` - SonarCloud project configuration
- ✅ `.vscode/settings.json` - VSCode SonarLint connection
- ✅ `.sonarlint/sonarlint.json` - SonarLint project binding
- ✅ `.eslintrc.cjs` - ESLint configuration
- ✅ `package.json` scripts - Quality check commands

**Current Configuration**:
- **Project Key**: `zhangisaac_vue-ui`
- **Organization**: `zhangisaac`
- **Sources**: `src/`
- **Tests**: `tests/`, `cypress/e2e/`
- **Coverage**: `coverage/lcov.info`

---

## Dashboard Guide

### Dashboard Overview

**Main Dashboard URL**: https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui

The SonarCloud dashboard provides a comprehensive view of your project's health across multiple dimensions.

### Main Dashboard Sections

1. **Overview** - Executive summary of all metrics
2. **Issues** - Detailed list of code issues
3. **Measures** - Detailed metrics and trends
4. **Code** - Source code with inline issue markers
5. **Security** - Security vulnerabilities and hotspots
6. **Activity** - Historical trends and evolution

### Key Metrics Explained

#### Code Quality Metrics

**Bugs**
- Code defects that will cause errors
- Severity: Blocker, Critical, Major, Minor, Info
- Target: 0 bugs

**Vulnerabilities**
- Security vulnerabilities (OWASP Top 10)
- Severity: Critical, High, Medium, Low
- Target: 0 vulnerabilities

**Security Hotspots**
- Security-sensitive code requiring review
- Severity: High, Medium, Low
- Target: Review and fix all hotspots

**Code Smells**
- Maintainability issues
- Severity: Major, Minor, Info
- Target: Keep maintainability rating at A

#### Test Coverage Metrics

**Coverage**
- Current: 83.96% (from Vitest reports)
- Target: ≥ 80% (configurable in quality gate)
- Breakdown:
  - Line Coverage: Percentage of lines executed
  - Branch Coverage: Percentage of branches executed
  - Uncovered Lines: Specific lines not covered

**Coverage by File**
- Shows coverage percentage per file
- Identifies files needing more tests
- Highlights critical files with low coverage

#### Vulnerability Assessment (VA) Issues

**Dependency Vulnerabilities**
- Source: npm audit results
- Display: Shown in Security section
- Details: Package name, CVE, severity, recommended fix

**Manifest Version Issues**
- Source: package.json analysis
- Display: Shown in Issues section
- Details: Outdated dependencies, version conflicts, missing peer dependencies

**Security Vulnerabilities in Code**
- Source: SonarCloud security analysis
- Display: Shown in Security section
- Details: OWASP Top 10 violations, injection vulnerabilities, authentication issues

#### Build Tool (SBT) Issues

**Build Errors**
- Source: CI/CD build logs
- Display: Shown in Activity section
- Details: Compilation errors, TypeScript errors, build failures

**Build Warnings**
- Source: CI/CD build logs
- Display: Shown in Activity section
- Details: Deprecation warnings, unused dependencies

### Quality Gates

**What is a Quality Gate?**
- A set of conditions that must be met before code can be merged
- Enforced automatically in CI/CD pipeline
- Blocks merge if conditions not met

**Default Quality Gate Conditions**:
- ✅ Coverage on New Code ≥ 80%
- ✅ Duplicated Lines on New Code < 3%
- ✅ Maintainability Rating = A
- ✅ Reliability Rating = A
- ✅ Security Rating = A
- ✅ Security Hotspots Reviewed = 100%

**Quality Gate Status**:
- ✅ **Pass**: All conditions met, merge allowed
- ❌ **Fail**: One or more conditions not met, merge blocked

### Dashboard Features

**Overview Tab**
- Quality gate status (Pass/Fail)
- Coverage percentage
- Bugs, vulnerabilities, code smells count
- Security hotspots count
- Recent activity timeline

**Issues Tab**
- All code quality issues
- Filterable by severity, type, status
- Assignable to team members
- Commentable and trackable

**Security Tab**
- Security vulnerabilities
- Security hotspots
- OWASP Top 10 violations
- Dependency vulnerabilities (VA)

**Measures Tab**
- Detailed metrics and trends
- Coverage breakdown by file
- Technical debt
- Code complexity
- Duplication

**Code Tab**
- Source code with inline issue markers
- Coverage information per line
- Navigate to issues directly

**Activity Tab**
- Analysis history
- Quality gate history
- Coverage trends over time
- Issue resolution trends

---

## Running Analysis Locally

### Prerequisites

1. ✅ SonarCloud account created
2. ✅ Project configured in SonarCloud
3. ✅ SonarCloud token generated
4. ✅ `SONAR_TOKEN` environment variable set

### Option 1: Using SonarScanner CLI (Recommended)

#### Step 1: Install SonarScanner

**macOS (using Homebrew)**:
```bash
brew install sonar-scanner
```

**Linux**:
```bash
wget https://binaries.sonarsource.com/Distribution/sonar-scanner-cli/sonar-scanner-cli-5.0.1.3006-linux.zip
unzip sonar-scanner-cli-5.0.1.3006-linux.zip
sudo mv sonar-scanner-5.0.1.3006-linux /opt/sonar-scanner
export PATH=$PATH:/opt/sonar-scanner/bin
```

**Windows**:
1. Download from: https://docs.sonarcloud.io/advanced-setup/ci-based-analysis/sonarscanner/
2. Extract to `C:\sonar-scanner`
3. Add `C:\sonar-scanner\bin` to PATH

**Using npm (Alternative)**:
```bash
npm install -g sonarqube-scanner
```

#### Step 2: Generate Coverage Report

Before running SonarCloud analysis, ensure coverage report exists:

```bash
# Run tests with coverage
npm run coverage

# Verify coverage file exists
ls -la coverage/lcov.info
```

#### Step 3: Run SonarCloud Analysis

```bash
# From project root directory
sonar-scanner

# Or if using npm-installed version
sonarqube-scanner

# Or using npm script (recommended)
npm run sonar:local
```

**What happens**:
1. SonarScanner reads `sonar-project.properties`
2. Analyzes source code
3. Reads coverage report (`coverage/lcov.info`)
4. Uploads results to SonarCloud
5. SonarCloud processes and displays results

#### Step 4: View Results

**View in Dashboard**:
- URL: https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui
- Wait 10-30 seconds for processing
- Refresh the dashboard
- All metrics will be populated

### Option 2: Using Docker

```bash
docker run --rm \
  -e SONAR_TOKEN=$SONAR_TOKEN \
  -v "$(pwd):/usr/src" \
  sonarsource/sonar-scanner-cli \
  -Dsonar.projectKey=zhangisaac_vue-ui \
  -Dsonar.organization=zhangisaac \
  -Dsonar.sources=src \
  -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info
```

### NPM Scripts

The project includes these npm scripts:

```bash
# Run SonarCloud analysis locally (with coverage)
npm run sonar:local

# Run SonarCloud analysis (assumes coverage exists)
npm run sonar

# Generate coverage report
npm run coverage

# Complete quality check (lint + test + audit)
npm run quality:check
```

---

## Troubleshooting

### Error: "No organization with key 'your-org-key'"

**Problem**: The `sonar-project.properties` file contains placeholder values.

**Solution**:
1. Open `sonar-project.properties`
2. Update with your actual values:
   ```properties
   sonar.projectKey=zhangisaac_vue-ui
   sonar.organization=zhangisaac
   ```
3. Also update `.vscode/settings.json` and `.sonarlint/sonarlint.json`

### Error: "You are running manual analysis while Automatic Analysis is enabled"

**Problem**: SonarCloud has Automatic Analysis enabled, which conflicts with manual analysis.

**Solution**:
1. Go to SonarCloud: https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui
2. Go to Project Settings → Analysis Method
3. Choose one:
   - **Option A**: Disable Automatic Analysis (allows local manual analysis)
   - **Option B**: Keep Automatic Analysis enabled (don't run `sonar-scanner` locally, rely on CI/CD)

**Recommended**: Keep Automatic Analysis enabled and use CI/CD for analysis. Use local analysis only for testing configuration.

### Error: "Language of file 'src/App.vue' can not be decided"

**Problem**: Language patterns conflict in `sonar-project.properties`.

**Solution**: The file is already fixed. If you see this error, ensure `sonar-project.properties` has:
```properties
sonar.lang.patterns.js=**/*.js,**/*.jsx
sonar.lang.patterns.ts=**/*.ts,**/*.tsx,**/*.vue
```

### "sonar-scanner: command not found"

**Problem**: SonarScanner is not installed or not in PATH.

**Solution**:
1. Check if installed: `which sonar-scanner`
2. Install using Homebrew (macOS): `brew install sonar-scanner`
3. Or add to PATH: `export PATH=$PATH:/path/to/sonar-scanner/bin`

### "SONAR_TOKEN not set"

**Problem**: Environment variable not set.

**Solution**:
```bash
# Check if set
echo $SONAR_TOKEN

# Set it
export SONAR_TOKEN=your-token-here

# Make permanent (macOS/Linux)
echo 'export SONAR_TOKEN=your-token-here' >> ~/.bashrc
source ~/.bashrc
```

### Error: "Project not found"

**Problem**: SonarCloud cannot find the project with the specified key and organization.

**Possible Causes**:
1. Project doesn't exist in SonarCloud
2. Project key or organization is incorrect
3. Token doesn't have permissions for this project
4. Token is invalid or expired

**Solution Steps**:

#### Step 1: Verify Project Exists
1. Go to: https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui
2. If you see "Project not found", the project doesn't exist yet

#### Step 2: Create Project in SonarCloud
1. Go to: https://sonarcloud.io
2. Sign in with your GitHub account
3. Click "Projects" → "Create Project"
4. Select "From GitHub"
5. Choose your repository: `vue-ui` (or your repo name)
6. Click "Set Up"
7. Choose "With GitHub Actions" (recommended) or "Manually"
8. **Note the Project Key** - it should be something like `zhangisaac_vue-ui`
9. **Note the Organization Key** - it should be `zhangisaac`

#### Step 3: Verify Configuration
1. Check `sonar-project.properties`:
   ```bash
   cat sonar-project.properties | grep -E "projectKey|organization"
   ```
   Should show:
   ```
   sonar.projectKey=zhangisaac_vue-ui
   sonar.organization=zhangisaac
   ```

2. If the keys don't match, update `sonar-project.properties` with the correct values from SonarCloud

#### Step 4: Verify Token Permissions
1. Go to: https://sonarcloud.io/account/security
2. Check if your token exists and is valid
3. Generate a new token if needed:
   - Click "Generate Token"
   - Name it (e.g., "Local Analysis")
   - Copy the token
   - Set it: `export SONAR_TOKEN=your-new-token-here`

#### Step 5: Test Connection
```bash
# Verify token is set
echo $SONAR_TOKEN

# Try running analysis again
npm run sonar:local
```

**If project still not found after these steps**:
- Double-check the project key in SonarCloud (it might be different from what you expect)
- Ensure you're using the correct organization
- Try creating a new token with full permissions
- Contact SonarCloud support if the issue persists

### Coverage report not found

**Problem**: Coverage report doesn't exist before running SonarCloud analysis.

**Solution**:
```bash
# Generate coverage first
npm run coverage

# Verify it exists
ls -la coverage/lcov.info

# Then run SonarCloud analysis
npm run sonar:local
```

### VSCode SonarLint not connecting

**Problem**: SonarLint extension not connected to SonarCloud.

**Solution**:
1. Check `SONAR_TOKEN` environment variable is set
2. Restart VSCode
3. Check `.vscode/settings.json` has correct organization and project key
4. Check SonarLint output panel for errors
5. Verify token is valid in SonarCloud

### Quality Gate Failing

**Problem**: Quality gate conditions not met.

**Solution**:
1. Check dashboard: https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui
2. Review quality gate conditions
3. Fix issues:
   - Increase coverage if below threshold
   - Fix bugs and vulnerabilities
   - Reduce code smells
   - Review security hotspots
4. Re-run analysis

---

## Dashboard Links

### Quick Access Links

**Project Key**: `zhangisaac_vue-ui`  
**Organization**: `zhangisaac`

#### Main Dashboard Sections
- **Overview**: https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui
- **All Issues**: https://sonarcloud.io/project/issues?id=zhangisaac_vue-ui
- **Security**: https://sonarcloud.io/security_hotspots?id=zhangisaac_vue-ui
- **Measures**: https://sonarcloud.io/component_measures?id=zhangisaac_vue-ui
- **Code**: https://sonarcloud.io/code?id=zhangisaac_vue-ui
- **Activity**: https://sonarcloud.io/project/activity?id=zhangisaac_vue-ui

### How to Access

1. **Direct URL**: Click any link above
2. **From SonarCloud**: 
   - Go to https://sonarcloud.io
   - Sign in
   - Click "Projects" → Select "zhangisaac_vue-ui"
3. **From VSCode**:
   - Open SonarLint panel
   - Click "Open in SonarCloud" (if available)

### What You'll See

- ✅ **Quality Gate Status**: Pass/Fail
- ✅ **Coverage**: 83.96% (from your tests)
- ✅ **Bugs**: Count by severity
- ✅ **Vulnerabilities**: Security issues
- ✅ **Security Hotspots**: Code requiring review
- ✅ **Code Smells**: Maintainability issues
- ✅ **VA Issues**: Vulnerability Assessment results
- ✅ **Manifest Issues**: package.json problems
- ✅ **SBT Issues**: Build tool problems

### After First Analysis

Once you run `sonar-scanner` locally or push to GitHub:
1. Wait 10-30 seconds for processing
2. Refresh the dashboard
3. You'll see all metrics populated

---

## Summary

### What's Configured

- ✅ SonarCloud project: `zhangisaac_vue-ui`
- ✅ VSCode SonarLint integration
- ✅ CI/CD integration (GitHub Actions)
- ✅ Coverage integration (83.96%)
- ✅ Quality gate enforcement
- ✅ Vulnerability Assessment (npm audit)
- ✅ Manifest version checking
- ✅ Build tool analysis

### Key Commands

```bash
# Run SonarCloud analysis locally
npm run sonar:local

# Generate coverage
npm run coverage

# Complete quality check
npm run quality:check

# Linting
npm run lint
npm run lint:fix

# Vulnerability assessment
npm run audit
npm run audit:fix
```

### Dashboard

**Main Dashboard**: https://sonarcloud.io/project/overview?id=zhangisaac_vue-ui

The SonarCloud dashboard serves as the **golden reference** for:
- Code quality metrics
- Security analysis
- Test coverage
- Vulnerability Assessment (VA)
- Manifest version issues
- Build Tool (SBT) issues
- Quality gate status

---

## Related Documentation

- **README.md** - Project overview with SonarCloud section
- **ARCHITECTURE_FLOW.md** - SonarCloud integration architecture diagrams
- **TESTING.md** - Complete testing guide including CI/CD integration

