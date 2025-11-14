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

### Still Having Issues?

1. Check backend logs for detailed error messages
2. Check browser Network tab to see the actual request/response
3. Verify the backend endpoint path matches exactly: `/api/auth/login`
4. Ensure the request body format matches what the backend expects

