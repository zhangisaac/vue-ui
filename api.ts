import type {
  DeploymentResponse,
  HistoricProcessInstance,
  HistoricTask,
  LoginResponse,
  ProcessInstance,
  RefreshTokenRequest,
  Task,
} from '@/types/workflow';
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Storage keys
const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const TOKEN_EXPIRES_AT_KEY = 'tokenExpiresAt';
const REFRESH_TOKEN_EXPIRES_AT_KEY = 'refreshTokenExpiresAt';

// Maintain server-client time offset (serverTimeMs - clientTimeMs)
let serverTimeOffsetMs = 0;

function updateServerTimeOffsetFromHeaders(headers: Record<string, unknown> | undefined) {
  try {
    // Axios lower-cases header names
    const dateHeader = (headers && (headers['date'] as string)) || undefined;
    if (!dateHeader) return;
    const serverMs = Date.parse(dateHeader);
    if (Number.isFinite(serverMs)) {
      serverTimeOffsetMs = serverMs - Date.now();
    }
  } catch {
    // noop
  }
}

// Flag to prevent multiple simultaneous refresh attempts
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Subscribe to token refresh
function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

// Notify all subscribers when token is refreshed
function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

// Check if token is expired or about to expire (within 1 minute)
function isTokenExpired(expiresAt: string | null): boolean {
  if (!expiresAt) return true;
  try {
    const expirationTime = Date.parse(expiresAt);
    const now = Date.now() + serverTimeOffsetMs; // adjust with server offset
    const bufferTime = 60 * 1000; // 1 minute buffer
    return now >= expirationTime - bufferTime;
  } catch {
    return true;
  }
}

// Refresh access token using refresh token
async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!refreshToken) {
    return null;
  }

  // Check if refresh token is expired
  const refreshExpiresAt = localStorage.getItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
  if (isTokenExpired(refreshExpiresAt)) {
    console.warn('Refresh token has expired');
    return null;
  }

  try {
    const response = await apiClient.post<LoginResponse>(
      '/auth/refresh',
      { refreshToken } as RefreshTokenRequest,
    );

    // Update time offset from this response if available
    // @ts-ignore - headers index type
    updateServerTimeOffsetFromHeaders(response.headers);

    const { accessToken, refreshToken: newRefreshToken, expiresAt, refreshExpiresAt } = response.data;
    
    // Store new tokens
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, expiresAt);
    if (newRefreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
      localStorage.setItem(REFRESH_TOKEN_EXPIRES_AT_KEY, refreshExpiresAt);
    }

    return accessToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens on refresh failure
    clearTokens();
    return null;
  }
}

// Clear all tokens from storage
function clearTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
  localStorage.removeItem(REFRESH_TOKEN_EXPIRES_AT_KEY);
}

// Request interceptor: Add token and check for expiration
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // Skip token check for auth endpoints
    if (config.url?.startsWith('/auth/')) {
      return config;
    }

    let token = localStorage.getItem(ACCESS_TOKEN_KEY);
    const expiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);

    // If token is expired or about to expire, try to refresh it
    if (token && isTokenExpired(expiresAt)) {
      // If already refreshing, wait for it
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken: string) => {
            config.headers = config.headers ?? {};
            config.headers.Authorization = `Bearer ${newToken}`;
            resolve(config);
          });
        });
      }

      // Start refresh process
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        token = newToken;
        onTokenRefreshed(newToken);
      } else {
        // Refresh failed, clear tokens
        clearTokens();
        // Redirect to login will be handled by response interceptor or router guard
      }
    }

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor: Handle 401 errors and token refresh
apiClient.interceptors.response.use(
  (response) => {
    // @ts-ignore - headers index type
    updateServerTimeOffsetFromHeaders(response.headers);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Try to update time offset from error response too
    // @ts-expect-error - headers index type
    if (error.response?.headers) updateServerTimeOffsetFromHeaders(error.response.headers);

    // Do not log or refresh on logout endpoint errors; just reject
    if (originalRequest?.url?.startsWith('/auth/logout')) {
      return Promise.reject(error);
    }

    // Handle 401 Unauthorized (could be expired token or blacklisted token)
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // Skip retry for auth endpoints (login, refresh)
      if (originalRequest.url?.startsWith('/auth/')) {
        clearTokens();
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      // If already refreshing, wait for it
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers = originalRequest.headers ?? {};
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      // Try to refresh token
      isRefreshing = true;
      const newToken = await refreshAccessToken();
      isRefreshing = false;

      if (newToken) {
        // Retry original request with new token
        originalRequest.headers = originalRequest.headers ?? {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        onTokenRefreshed(newToken);
        return apiClient(originalRequest);
      } else {
        // Refresh failed - token might be blacklisted or refresh token expired
        clearTokens();
        
        // Dispatch custom event to notify app of logout
        window.dispatchEvent(new CustomEvent('auth:logout', { detail: { reason: 'token_refresh_failed' } }));
        
        return Promise.reject(error);
    }
    }

    // Log detailed error for debugging
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: originalRequest?.url,
        method: originalRequest?.method,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('Network Error:', {
        message: error.message,
        url: originalRequest?.url,
      });
    } else {
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  },
);

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data, headers } = await apiClient.post<LoginResponse>('/auth/login', { username, password });
  // @ts-ignore - headers index type
  updateServerTimeOffsetFromHeaders(headers);
  return data;
}

export async function refreshToken(refreshToken: string): Promise<LoginResponse> {
  const { data, headers } = await apiClient.post<LoginResponse>('/auth/refresh', {
    refreshToken,
  } as RefreshTokenRequest);
  // @ts-ignore - headers index type
  updateServerTimeOffsetFromHeaders(headers);
  return data;
}

export async function logout(refreshToken?: string): Promise<void> {
  try {
    // If no access token or it is expired, skip backend logout (prevents 403)
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const accessExpiresAt = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
    if (!accessToken || isTokenExpired(accessExpiresAt)) {
      return;
    }

    const res = await apiClient.post('/auth/logout', refreshToken ? { refreshToken } : null);
    // @ts-expect-error - headers index type
    updateServerTimeOffsetFromHeaders(res.headers);
  } catch (_error) {
    // Intentionally ignore errors on logout to avoid noisy 4xx logs.
  } finally {
    // Always clear tokens locally
    clearTokens();
  }
}

export async function fetchMyTasks(): Promise<Task[]> {
  const { data } = await apiClient.get<Task[]>('/tasks/my');
  return data;
}

export async function fetchCandidateTasks(): Promise<Task[]> {
  const { data } = await apiClient.get<Task[]>('/tasks/candidate');
  return data;
}

export async function claimTask(taskId: string): Promise<void> {
  await apiClient.post(`/tasks/${taskId}/claim`, {});
}

export async function completeTask(taskId: string, variables: Record<string, unknown>): Promise<void> {
  await apiClient.post(`/tasks/${taskId}/complete`, { variables });
}

export async function deployProcess(file: File): Promise<DeploymentResponse> {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await apiClient.post<DeploymentResponse>('/processes/deploy', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function startProcess(payload: {
  processDefinitionKey: string;
  businessKey?: string;
  variables?: Record<string, unknown>;
}): Promise<ProcessInstance> {
  const { data } = await apiClient.post<ProcessInstance>('/processes/start', payload);
  return data;
}

export async function fetchActiveProcesses(): Promise<ProcessInstance[]> {
  const { data } = await apiClient.get<ProcessInstance[]>('/processes/active');
  return data;
}

export async function suspendProcess(processInstanceId: string): Promise<void> {
  await apiClient.post(`/processes/${processInstanceId}/suspend`, {});
}

export async function activateProcess(processInstanceId: string): Promise<void> {
  await apiClient.post(`/processes/${processInstanceId}/activate`, {});
}

export async function deleteProcess(processInstanceId: string, reason?: string): Promise<void> {
  await apiClient.delete(`/processes/${processInstanceId}`, {
    params: { reason },
  });
}

export async function fetchCompletedProcesses(): Promise<HistoricProcessInstance[]> {
  const { data } = await apiClient.get<HistoricProcessInstance[]>('/processes/completed');
  return data;
}

export async function fetchHistoricTasks(processInstanceId: string): Promise<HistoricTask[]> {
  const { data } = await apiClient.get<HistoricTask[]>(`/processes/${processInstanceId}/history/tasks`);
  return data;
}


