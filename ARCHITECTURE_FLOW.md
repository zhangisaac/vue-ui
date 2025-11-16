# Vue to Spring Boot Connection Flow Diagram

## Architecture Overview

This document describes how the Vue.js frontend connects to the Spring Boot backend through Vite's development proxy, including CORS handling.

## High-Level Architecture Diagram

```mermaid
graph TB
    subgraph Client["🖥️ Client Browser"]
        A[Vue Application<br/>http://localhost:5173]
    end
    
    subgraph DevServer["⚙️ Vite Dev Server<br/>Port 5173"]
        B[Vite Dev Server]
        C[Proxy Configuration<br/>/api → localhost:8080]
    end
    
    subgraph Backend["☕ Spring Boot Server<br/>Port 8080"]
        D[CORS Filter<br/>CorsConfig.java]
        E[Security Filter<br/>SecurityConfig.java]
        F[REST Controllers<br/>/api/**]
    end
    
    A -->|HTTP Request<br/>/api/auth/login| B
    B -->|Match /api pattern| C
    C -->|Forward Request<br/>Change Origin| D
    D -->|Validate Origin<br/>Allow localhost:5173| E
    E -->|Check CSRF<br/>Disabled for /api| F
    F -->|JSON Response<br/>+ CORS Headers| E
    E -->|Add CORS Headers| D
    D -->|Response| C
    C -->|Forward Response| B
    B -->|Response| A
    
    style A fill:#42b983,stroke:#2c3e50,stroke-width:3px,color:#fff
    style B fill:#646cff,stroke:#2c3e50,stroke-width:2px,color:#fff
    style C fill:#646cff,stroke:#2c3e50,stroke-width:2px,color:#fff
    style D fill:#ffa726,stroke:#2c3e50,stroke-width:2px,color:#000
    style E fill:#ffa726,stroke:#2c3e50,stroke-width:2px,color:#000
    style F fill:#6db33f,stroke:#2c3e50,stroke-width:3px,color:#fff
```

## Main Connection Flow Diagram

This diagram shows the complete request/response flow from Vue component to Spring Boot backend:

```mermaid
flowchart LR
    subgraph Frontend["🌐 Frontend (Port 5173)"]
        A[Vue Component<br/>LoginView.vue] -->|1. User Action| B[Pinia Store<br/>auth.ts]
        B -->|2. API Call| C[Axios Client<br/>api.ts<br/>baseURL: /api]
        C -->|3. Add Token<br/>if exists| D[HTTP Request<br/>POST /api/auth/login]
    end

    subgraph Proxy["⚙️ Vite Proxy (Port 5173)"]
        D -->|4. Match /api| E[Proxy Config<br/>vite.config.ts]
        E -->|5. Forward to<br/>localhost:8080| F[Transform Request<br/>Change Origin: true]
    end

    subgraph CORS["🔒 CORS Check"]
        F -->|6. OPTIONS Preflight<br/>if needed| G{CORS Filter<br/>Check Origin}
        G -->|Origin allowed<br/>localhost:5173| H[Allow Request]
        G -->|Origin blocked| I[❌ 403 Forbidden]
    end

    subgraph Backend["☕ Spring Boot (Port 8080)"]
        H -->|7. Security Filter| J{CSRF Check<br/>SecurityConfig}
        J -->|API: CSRF Disabled| K[Controller<br/>/api/auth/login]
        J -->|CSRF Required| L[❌ 403 Forbidden]
        K -->|8. Process| M[Auth Service<br/>Validate Credentials]
        M -->|Success| N[Generate JWT Token]
        M -->|Failure| O[❌ 401 Unauthorized]
        N -->|9. Response| P[JSON Response<br/>+ CORS Headers]
    end

    subgraph Response["↩️ Response Path"]
        P -->|10. Add CORS Headers| Q[Access-Control-Allow-Origin<br/>Allow-Credentials]
        Q -->|11. Through Proxy| R[Vite Proxy<br/>Log Response]
        R -->|12. To Browser| S[Axios Interceptor<br/>Check Status]
        S -->|13. Save Token| T[localStorage]
        T -->|14. Update UI| A
    end

    style A fill:#42b983,stroke:#2c3e50,stroke-width:3px,color:#fff
    style C fill:#42b983,stroke:#2c3e50,stroke-width:2px,color:#fff
    style E fill:#646cff,stroke:#2c3e50,stroke-width:3px,color:#fff
    style K fill:#6db33f,stroke:#2c3e50,stroke-width:3px,color:#fff
    style G fill:#ffa726,stroke:#2c3e50,stroke-width:2px,color:#000
    style J fill:#ffa726,stroke:#2c3e50,stroke-width:2px,color:#000
    style I fill:#ef5350,stroke:#2c3e50,stroke-width:2px,color:#fff
    style L fill:#ef5350,stroke:#2c3e50,stroke-width:2px,color:#fff
    style O fill:#ef5350,stroke:#2c3e50,stroke-width:2px,color:#fff
```

## Simplified Request Flow (Step-by-Step)

```mermaid
sequenceDiagram
    autonumber
    participant User
    participant Component as Vue Component<br/>(Port 5173)
    participant Store as Pinia Store
    participant Axios as Axios Client<br/>(api.ts)
    participant Proxy as Vite Proxy
    participant CORS as CORS Filter<br/>(Spring Boot)
    participant Security as Security Filter
    participant Controller as Spring Controller
    participant Service as Auth Service

    User->>Component: Click Login
    Component->>Store: login(username, password)
    Store->>Axios: POST /api/auth/login
    Note over Axios: Add token if exists<br/>from localStorage
    
    Axios->>Proxy: POST /api/auth/login
    Note over Proxy: vite.config.ts<br/>target: localhost:8080
    
    Proxy->>CORS: Forward Request<br/>(with Origin header)
    alt CORS Preflight (if needed)
        CORS-->>Proxy: OPTIONS Response<br/>CORS Headers
        Proxy-->>Axios: CORS Headers
    end
    
    CORS->>Security: Validate Origin<br/>localhost:5173 ✓
    Security->>Security: Check CSRF<br/>Disabled for /api/** ✓
    Security->>Controller: Forward Request
    Controller->>Service: Validate Credentials
    Service->>Service: Generate JWT Token
    Service->>Controller: Return Token + User Data
    Controller->>CORS: JSON Response
    Note over CORS: Add CORS Headers<br/>to Response
    CORS->>Proxy: Response + CORS Headers
    Proxy->>Axios: Forward Response
    Note over Axios: Response Interceptor<br/>Handle 401 errors
    Axios->>Store: Return Response Data
    Store->>Store: Save Token<br/>to localStorage
    Store->>Component: Update State
    Component->>User: Show Success/Error
```

## Detailed Component Breakdown

### Frontend Layer (Vue.js)

```mermaid
graph TD
    A[Vue Component] -->|1. User triggers action| B[Pinia Store]
    B -->|2. Call service function| C[API Service Layer]
    C -->|3. Configure request| D[Axios Instance]
    D -->|4. Request Interceptor| E{Has Token?}
    E -->|Yes| F[Add Authorization Header]
    E -->|No| G[Skip Auth Header]
    F --> H[Send HTTP Request]
    G --> H
    
    style A fill:#42b983,color:#fff
    style B fill:#42b983,color:#fff
    style C fill:#42b983,color:#fff
    style D fill:#42b983,color:#fff
```

### Proxy Layer (Vite Dev Server)

```mermaid
graph LR
    A[Browser Request<br/>POST /api/auth/login] -->|Match pattern| B[Vite Proxy<br/>vite.config.ts]
    B -->|Configuration| C[Target: localhost:8080<br/>Change Origin: true<br/>Keep /api prefix]
    C -->|Forward| D[Backend Request<br/>POST http://localhost:8080/api/auth/login]
    
    style B fill:#646cff,color:#fff
    style C fill:#646cff,color:#fff
```

### Backend Layer (Spring Boot)

```mermaid
graph TD
    A[HTTP Request] -->|1| B[CORS Filter<br/>CorsConfig.java]
    B -->|2. Validate Origin| C{Origin<br/>localhost:5173?}
    C -->|Yes| D[Allow + Add CORS Headers]
    C -->|No| E[❌ Block Request]
    D -->|3| F[Security Filter<br/>SecurityConfig.java]
    F -->|4. Check CSRF| G{CSRF<br/>Enabled?}
    G -->|No for /api/**| H[Pass Through]
    G -->|Yes| I[❌ Block Request]
    H -->|5| J[Controller<br/>@RestController]
    J -->|6| K[Service Layer]
    K -->|7| L[Generate Response]
    L -->|8| M[Add CORS Headers]
    M --> N[Return Response]
    
    style B fill:#ffa726,color:#000
    style F fill:#ffa726,color:#000
    style J fill:#6db33f,color:#fff
    style E fill:#ef5350,color:#fff
    style I fill:#ef5350,color:#fff
```

## Detailed Flow Description

### Step-by-Step Flow

#### 1. Frontend Request Initiation
- **Component**: Vue component (e.g., `LoginView.vue`) triggers user action
- **Store**: Pinia store (`stores/auth.ts`) calls the API service
- **Service**: API service (`services/api.ts`) uses Axios with `baseURL: '/api'`

#### 2. Request Interception
- Axios request interceptor checks `localStorage` for JWT token
- If token exists, adds `Authorization: Bearer <token>` header
- Sets `Content-Type: application/json`

#### 3. Vite Proxy Configuration
```typescript
// vite.config.ts
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
    secure: false,
    rewrite: (path) => path, // Keeps /api prefix
  }
}
```
- **Match**: All requests starting with `/api`
- **Target**: Forwards to `http://localhost:8080`
- **Change Origin**: Sets `Host` header to target server
- **Keep Path**: Maintains `/api` prefix in forwarded request

#### 4. Browser CORS Handling
- Browser may send **OPTIONS preflight** request for cross-origin requests
- Preflight checks if server allows the actual request
- Server responds with CORS headers:
  - `Access-Control-Allow-Origin: http://localhost:5173`
  - `Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS`
  - `Access-Control-Allow-Headers: *`
  - `Access-Control-Allow-Credentials: true`

#### 5. Spring Boot CORS Configuration
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

#### 6. Spring Security Filter Chain
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf
                .ignoringRequestMatchers("/api/**") // Disable CSRF for API
            )
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login").permitAll()
                .requestMatchers("/api/**").authenticated()
            );
        return http.build();
    }
}
```

#### 7. Request Processing
- Controller receives request at `/api/auth/login`
- Authentication service validates credentials
- On success: Generates JWT token
- On failure: Returns 401 Unauthorized

#### 8. Response Path
- Controller returns JSON response with JWT token
- CORS filter adds CORS headers to response
- Response flows back through proxy to frontend
- Axios response interceptor:
  - Checks for 401 status (removes token if found)
  - Returns response data
- Store saves token to `localStorage`
- Component updates UI with response

## Key Configuration Files

### Frontend
- **`vite.config.ts`**: Proxy configuration
- **`src/services/api.ts`**: Axios client with interceptors
- **`src/stores/auth.ts`**: State management for authentication

### Backend (Spring Boot)
- **`CorsConfig.java`**: CORS configuration
- **`SecurityConfig.java`**: Spring Security configuration
- **`*Controller.java`**: REST controllers handling `/api/**` endpoints

## Request/Response Headers Flow

### Request Headers (Frontend → Backend)
```
POST /api/auth/login HTTP/1.1
Host: localhost:8080
Origin: http://localhost:5173
Content-Type: application/json
Authorization: Bearer <token> (if authenticated)
```

### Response Headers (Backend → Frontend)
```
HTTP/1.1 200 OK
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Content-Type: application/json
```

## CORS Flow Diagram

This diagram shows how CORS (Cross-Origin Resource Sharing) is handled:

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Browser<br/>(localhost:5173)
    participant Proxy as Vite Proxy<br/>(localhost:5173)
    participant CORS as CORS Filter<br/>(Spring Boot)
    participant Backend as Backend Service<br/>(Spring Boot)

    Note over Browser,Backend: Step 1: Preflight Request (if needed)
    Browser->>Proxy: OPTIONS /api/auth/login<br/>Origin: http://localhost:5173<br/>Access-Control-Request-Method: POST
    Proxy->>CORS: Forward OPTIONS Request
    CORS->>CORS: Check Origin<br/>Is localhost:5173 allowed?
    alt Origin Allowed
        CORS->>Proxy: 200 OK<br/>Access-Control-Allow-Origin: http://localhost:5173<br/>Access-Control-Allow-Methods: POST<br/>Access-Control-Allow-Credentials: true
        Proxy->>Browser: Forward CORS Headers
        Note over Browser: Browser now knows request is allowed
    else Origin Blocked
        CORS->>Proxy: 403 Forbidden
        Proxy->>Browser: CORS Error
    end
    
    Note over Browser,Backend: Step 2: Actual Request
    Browser->>Proxy: POST /api/auth/login<br/>Origin: http://localhost:5173<br/>Content-Type: application/json<br/>Body: {username, password}
    Proxy->>CORS: Forward POST Request<br/>(with Origin header)
    CORS->>CORS: Validate Origin Again<br/>localhost:5173 ✓
    CORS->>Backend: Forward Request<br/>(Origin header preserved)
    Backend->>Backend: Process Request<br/>Validate Credentials<br/>Generate JWT
    Backend->>CORS: JSON Response<br/>{token, user}
    CORS->>CORS: Add CORS Headers to Response<br/>Access-Control-Allow-Origin<br/>Access-Control-Allow-Credentials
    CORS->>Proxy: Response + CORS Headers
    Proxy->>Browser: Forward Response<br/>with CORS Headers
    Browser->>Browser: Browser validates CORS headers<br/>Allows response if origin matches
```

## CORS Configuration Visual Guide

```mermaid
graph LR
    subgraph Frontend["Frontend Request"]
        A[Request Headers<br/>Origin: http://localhost:5173<br/>Method: POST]
    end
    
    subgraph CORSConfig["CORS Configuration<br/>CorsConfig.java"]
        B{Check Origin}
        C[Allowed Origins:<br/>localhost:5173]
        D[Allowed Methods:<br/>GET, POST, PUT, DELETE]
        E[Allowed Headers:<br/>*]
        F[Allow Credentials:<br/>true]
    end
    
    subgraph Response["Backend Response"]
        G[Response Headers<br/>Access-Control-Allow-Origin:<br/>http://localhost:5173<br/>Access-Control-Allow-Credentials: true]
    end
    
    A -->|1. Send Request| B
    B -->|2. Match Against| C
    B -->|3. Check Method| D
    B -->|4. Check Headers| E
    B -->|5. Allow Credentials| F
    C -->|6. Origin Matches ✓| G
    D --> G
    E --> G
    F --> G
    
    style A fill:#42b983,color:#fff
    style B fill:#ffa726,color:#000
    style C fill:#ffa726,color:#000
    style D fill:#ffa726,color:#000
    style E fill:#ffa726,color:#000
    style F fill:#ffa726,color:#000
    style G fill:#6db33f,color:#fff
```

## Error Handling

### Common Errors and Solutions

1. **403 Forbidden**
   - Cause: CSRF protection or CORS not configured
   - Solution: Disable CSRF for `/api/**` and configure CORS

2. **CORS Error**
   - Cause: Origin `http://localhost:5173` not allowed
   - Solution: Add origin to `allowedOrigins` in `CorsConfig`

3. **401 Unauthorized**
   - Cause: Invalid credentials or expired token
   - Solution: Re-authenticate or refresh token

4. **Network Error**
   - Cause: Backend not running or proxy misconfiguration
   - Solution: Check backend on port 8080 and proxy config

## Development vs Production

### Development (Current Setup)
- Vite dev server on port 5173
- Proxy forwards `/api/*` to `http://localhost:8080`
- CORS enabled for development

### Production (Recommended)
- Frontend served from same domain as backend (no CORS needed)
- Or: Configure CORS for production domain
- Use nginx or similar reverse proxy
- Consider API Gateway pattern for microservices

