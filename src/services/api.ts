import axios, { AxiosInstance } from 'axios';
import type {
  DeploymentResponse,
  HistoricProcessInstance,
  HistoricTask,
  LoginResponse,
  ProcessInstance,
  Task,
} from '@/types/workflow';

const apiClient: AxiosInstance = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
    }
    // Log detailed error for debugging
    if (error.response) {
      console.error('API Error:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        method: error.config?.method,
        data: error.response.data,
      });
    } else if (error.request) {
      console.error('Network Error:', {
        message: error.message,
        url: error.config?.url,
      });
    } else {
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  },
);

export async function login(username: string, password: string): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', { username, password });
  return data;
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


