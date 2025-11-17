# Troubleshooting Guide - API Connection Issues

## Problem: 403 Forbidden Error on Login

If you're getting a 403 Forbidden error when trying to login, this is typically a **backend Spring Security configuration issue**, not a frontend problem.

### Symptoms
- Login request returns `403 Forbidden`
- Browser console shows: `Access forbidden. Please check backend CORS/CSRF configuration.`
- Backend is running on port 8080

### Root Causes

The 403 error usually indicates one of these backend issues:

1. **CSRF Protection**: Spring Security's CSRF protection is blocking POST requests
2. **CORS Configuration**: Backend doesn't allow requests from `http://localhost:5173`
3. **Security Configuration**: The `/api/auth/login` endpoint is not properly configured as a public endpoint

### Solutions

#### 1. Check Backend CORS Configuration

Your Spring Boot backend should have CORS configured to allow requests from the frontend:

```java
@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);
        return source;
    }
}
```

#### 2. Disable CSRF for API Endpoints

If you're using Spring Security, disable CSRF for API endpoints:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**") // Disable CSRF for API endpoints
            )
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login").permitAll() // Allow login without authentication
                .requestMatchers("/api/**").authenticated() // Require auth for other endpoints
            )
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // JWT is stateless
            );
        
        return http.build();
    }
}
```

#### 3. Verify Backend is Running

Check if the backend is actually running:

```bash
# Test if backend is accessible
curl http://localhost:8080/api/auth/login

# Or check the backend logs
# Look for "Started Application" message
```

#### 4. Check Backend Port

Ensure the backend is running on port 8080. Check your `application.properties` or `application.yml`:

```properties
server.port=8080
```

### Frontend Debugging

The frontend now includes enhanced error logging. Check your browser console (F12) for detailed error information:

1. Open browser DevTools (F12)
2. Go to Console tab
3. Try to login
4. Look for error messages showing:
   - HTTP status code
   - Response data
   - Request URL and method

### Testing the Connection

You can test the backend directly using curl:

```bash
# Test login endpoint
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin"}'
```

If this works, the backend is fine and the issue is with the proxy. If it returns 403, the backend configuration needs to be fixed.

### Vite Proxy Configuration

The Vite proxy is configured in `vite.config.ts`. The current configuration:

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    secure: false,
  },
}
```

This should forward all `/api/*` requests to `http://localhost:8080/api/*`.

### Restart After Changes

After making backend configuration changes:

1. **Restart the backend** (Spring Boot application)
2. **Restart the frontend** (Vite dev server) - not always necessary, but recommended

```bash
# Stop the frontend (Ctrl+C)
# Then restart
npm run dev
```

### Common Issues

1. **Backend not running**: Make sure Spring Boot application is started
2. **Wrong port**: Backend must be on port 8080 (or update vite.config.ts)
3. **CORS not configured**: Backend must allow `http://localhost:5173`
4. **CSRF enabled**: Disable CSRF for `/api/**` endpoints
5. **Login endpoint protected**: `/api/auth/login` must be `permitAll()`

---

## Problem: 403 Forbidden Error on Logout

### Symptoms
- Clicking "Sign off" returns `403 Forbidden` for `POST /api/auth/logout`
- You may need to click twice to complete logout

### Causes
- Access token is already expired or cleared, so backend rejects the logout request
- Logout error logging in the client makes this noisy in console

### Frontend Behavior (By Design)
- Client skips backend logout if access token is missing or expired
- Client clears local tokens in all cases and redirects to login immediately
- Errors from `/auth/logout` are suppressed in the console

### What to Do
- No action needed if you see `403` during logout; the client has already cleared session and redirected
- If the backend must always record logout, ensure the access token is still valid when calling logout

---

## Problem: Duplicate `/api/api` in URL (e.g., /api/api/auth/refresh)

### Cause
- Using an absolute `/api/...` path with an axios instance that already has `baseURL: '/api'`

### Fix
- Use the shared axios client and relative path (e.g., `apiClient.post('/auth/refresh', ...)`)

---

## Problem: Token Refresh Fails Intermittently

### Symptoms
- Occasional 401 immediately before refresh
- Refresh succeeds locally but still shows token "expired" behavior

### Causes
- Client and server clocks are out of sync

### Fix (Implemented)
- Client adjusts for server time using the HTTP `Date` header
- Expiry checks use: `now = Date.now() + serverTimeOffsetMs` with a 60s safety buffer

### Verify
- In Network tab, inspect any API response headers and ensure `Date` is present
- Refresh should occur proactively within ~60s of access token expiry (server time)

---

## Problem: Still Seeing 401 After Refresh

### Causes
- Refresh token is expired or revoked (blacklisted on backend)

### Behavior
- Client clears tokens and dispatches `auth:logout`, router redirects to login

### What to Do
- Login again; if this persists, validate refresh token policies on backend

---

## Quick Checks
- Confirm requests go to `/api/auth/...` (not `/api/api/...`)
- Ensure Vite proxy is running and backend is reachable on 8080
- Verify `Authorization: Bearer <accessToken>` header is present for protected endpoints
- Check that localStorage has: `accessToken`, `tokenExpiresAt`, `refreshToken`, `refreshTokenExpiresAt`

---

## Problem: E2E Tests Failing

### Symptoms
- E2E tests fail with "Cypress could not verify that this server is running"
- Tests timeout waiting for elements
- Tests fail with network errors

### Solutions

#### 1. Dev Server Not Running
**Problem**: Vite dev server is not running on port 5173

**Solution**: Use integrated test runner (recommended)
```bash
npm run test:all
```

Or manually start dev server:
```bash
npm run dev
# In another terminal
npm run cy:run
```

#### 2. Backend Not Available
**Problem**: E2E tests require backend for full functionality

**Solution**: 
- Start backend service on `http://localhost:8080`
- Or use mocked API responses in tests (already implemented)
- Note: CI/CD tests use `continue-on-error: true` if backend unavailable

#### 3. Port Conflicts
**Problem**: Port 5173 already in use

**Solution**:
```bash
# Check what's using port 5173
lsof -i :5173

# Kill the process or use a different port
# Update cypress.config.ts if using different port
```

#### 4. Test Timeouts
**Problem**: Tests timeout waiting for elements or API calls

**Solution**:
- Increase timeout in test: `cy.wait('@apiCall', { timeout: 10000 })`
- Check if selectors match actual component structure
- Verify API intercepts are correctly configured

#### 5. LocalStorage State
**Problem**: Tests fail due to leftover localStorage state

**Solution**: Tests automatically clear localStorage, but if issues persist:
```bash
# Clear browser storage manually
# Or check test setup in cypress/support/e2e.ts
```

### E2E Test Debugging

```bash
# Run tests in interactive mode to debug
npm run cy:open

# Run specific test file
npx cypress run --spec "cypress/e2e/auth.cy.ts"

# Run with browser visible
npx cypress run --headed
```

**See [TESTING.md](./TESTING.md) for complete testing guide including E2E testing.**

---

## Problem: Unit Tests Failing

### Symptoms
- Tests fail with mock errors
- Coverage not generating
- Tests pass locally but fail in CI

### Solutions

#### 1. Mock Setup Issues
**Problem**: Axios or router mocks not working correctly

**Solution**: 
- Ensure mocks are defined before imports (Vitest hoisting)
- Check `vi.mock()` factory functions don't reference external variables
- Verify mock structure matches actual implementation

#### 2. Coverage Not Generating
**Problem**: Coverage report not created

**Solution**:
```bash
# Ensure coverage package is installed
npm list @vitest/coverage-v8

# Reinstall if needed
npm install --save-dev @vitest/coverage-v8

# Generate coverage
npm run coverage
```

#### 3. Tests Fail in CI but Pass Locally
**Problem**: Environment differences

**Solution**:
- Check Node.js version matches CI (Node 20)
- Run `npm ci` instead of `npm install` to match CI
- Check for environment-specific code paths

**See [TESTING.md](./TESTING.md) for detailed testing guide.**

