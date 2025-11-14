export interface LoginResponse {
  tokenType: string;
  accessToken: string;
  expiresAt: string;
  username: string;
  roles: string[];
}

export interface Task {
  id: string;
  name: string;
  description?: string;
  assignee?: string;
  processInstanceId: string;
  createdTime?: string;
  dueDate?: string;
  candidateGroups: string[];
  candidateUsers: string[];
}

export interface ProcessInstance {
  id: string;
  processDefinitionId: string;
  processDefinitionKey: string;
  businessKey?: string;
  suspended: boolean;
  startTime?: string;
  startUserId?: string;
}

export interface HistoricProcessInstance {
  id: string;
  processDefinitionId: string;
  processDefinitionKey: string;
  businessKey?: string;
  startTime?: string;
  endTime?: string;
  durationInMillis?: number;
  startUserId?: string;
}

export interface HistoricTask {
  id: string;
  name: string;
  assignee?: string;
  processInstanceId: string;
  startTime?: string;
  endTime?: string;
  durationInMillis?: number;
  variables: Record<string, unknown>;
}

export interface DeploymentResponse {
  deploymentId: string;
  deployedProcessDefinitionKeys: string[];
}


