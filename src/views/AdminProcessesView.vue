<template>
  <div class="admin-view">
    <section class="card">
      <h2>Deploy Process Definition</h2>
      <form @submit.prevent="handleDeploy">
        <label>
          Upload BPMN File
          <input type="file" accept=".bpmn,.bpmn20.xml,.xml" @change="onFileChange" required />
        </label>
        <button type="submit" :disabled="!selectedFile || deploying">
          <span v-if="deploying">Deploying…</span>
          <span v-else>Deploy</span>
        </button>
        <p v-if="deployResult" class="success">
          Deployment {{ deployResult.deploymentId }}: {{ deployResult.deployedProcessDefinitionKeys.join(', ') }}
        </p>
      </form>
    </section>

    <section class="card">
      <h2>Start Process Instance</h2>
      <form @submit.prevent="handleStartProcess">
        <div class="form-grid">
          <label>
            Process Definition Key
            <input v-model="startPayload.processDefinitionKey" placeholder="leaveRequestProcess" required />
          </label>
          <label>
            Business Key (optional)
            <input v-model="startPayload.businessKey" placeholder="leave-123" />
          </label>
        </div>
        <label>
          Variables (JSON)
          <textarea v-model="startVariablesJson" rows="3" placeholder='{"reason": "Vacation", "duration": 5}'></textarea>
        </label>
        <button type="submit" :disabled="starting">
          <span v-if="starting">Starting…</span>
          <span v-else>Start Instance</span>
        </button>
        <p v-if="startError" class="error">{{ startError }}</p>
      </form>
    </section>

    <section class="card">
      <header class="section-header">
        <h2>Active Process Instances</h2>
        <button type="button" class="refresh" @click="loadData" :disabled="loading">Refresh</button>
      </header>
      <div v-if="loading" class="loading">Loading processes…</div>
      <table v-else class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Definition</th>
            <th>Business Key</th>
            <th>Status</th>
            <th>Start User</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="instance in activeProcesses" :key="instance.id">
            <td>{{ instance.id }}</td>
            <td>{{ instance.processDefinitionKey }}</td>
            <td>{{ instance.businessKey ?? '—' }}</td>
            <td>
              <span :class="['status', instance.suspended ? 'suspended' : 'running']">
                {{ instance.suspended ? 'Suspended' : 'Running' }}
              </span>
            </td>
            <td>{{ instance.startUserId ?? '—' }}</td>
            <td class="actions">
              <button
                type="button"
                @click="toggleSuspend(instance)"
                :disabled="acting[instance.id]"
                class="secondary"
              >
                <span v-if="acting[instance.id]">Working…</span>
                <span v-else>{{ instance.suspended ? 'Activate' : 'Suspend' }}</span>
              </button>
              <button type="button" @click="remove(instance)" class="danger" :disabled="acting[instance.id]">
                Delete
              </button>
            </td>
          </tr>
          <tr v-if="activeProcesses.length === 0">
            <td colspan="6" class="empty">No active process instances.</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="card">
      <header class="section-header">
        <h2>Completed Processes</h2>
        <button type="button" class="refresh" @click="loadData" :disabled="loading">Refresh</button>
      </header>
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Definition</th>
            <th>Start User</th>
            <th>Started</th>
            <th>Ended</th>
            <th>Duration (mins)</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <template v-for="process in completedProcesses" :key="process.id">
            <tr>
              <td>{{ process.id }}</td>
              <td>{{ process.processDefinitionKey }}</td>
              <td>{{ process.startUserId ?? '—' }}</td>
              <td>{{ formatDate(process.startTime) }}</td>
              <td>{{ formatDate(process.endTime) }}</td>
              <td>{{ formatDuration(process.durationInMillis) }}</td>
              <td>
                <button
                  type="button"
                  class="secondary"
                  @click="toggleHistoricTasks(process.id)"
                  :disabled="loadingHistoric[process.id]"
                >
                  <span v-if="loadingHistoric[process.id]">Loading…</span>
                  <span v-else>{{ showHistoricTasks[process.id] ? 'Hide' : 'View' }} Tasks</span>
                </button>
              </td>
            </tr>
            <tr v-if="showHistoricTasks[process.id]">
              <td colspan="7" class="historic-tasks-cell">
                <div v-if="loadingHistoric[process.id]" class="loading">Loading historic tasks…</div>
                <div v-else-if="historicTasks[process.id]?.length" class="historic-tasks">
                  <h4>Historic Tasks</h4>
                  <table class="nested-table">
                    <thead>
                      <tr>
                        <th>Task Name</th>
                        <th>Assignee</th>
                        <th>Start Time</th>
                        <th>End Time</th>
                        <th>Duration (mins)</th>
                        <th>Variables</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="task in historicTasks[process.id]" :key="task.id">
                        <td>{{ task.name }}</td>
                        <td>{{ task.assignee ?? '—' }}</td>
                        <td>{{ formatDate(task.startTime) }}</td>
                        <td>{{ formatDate(task.endTime) }}</td>
                        <td>{{ formatDuration(task.durationInMillis) }}</td>
                        <td>
                          <pre class="variables-preview">{{ JSON.stringify(task.variables, null, 2) }}</pre>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="empty">No historic tasks found.</div>
              </td>
            </tr>
          </template>
          <tr v-if="completedProcesses.length === 0">
            <td colspan="7" class="empty">No completed processes yet.</td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import {
  activateProcess,
  deleteProcess,
  deployProcess,
  fetchActiveProcesses,
  fetchCompletedProcesses,
  fetchHistoricTasks,
  startProcess,
  suspendProcess,
} from '@/services/api';
import type {
  DeploymentResponse,
  HistoricProcessInstance,
  HistoricTask,
  ProcessInstance,
} from '@/types/workflow';

const selectedFile = ref<File | null>(null);
const deploying = ref(false);
const deployResult = ref<DeploymentResponse | null>(null);

const startPayload = reactive({
  processDefinitionKey: 'leaveRequestProcess',
  businessKey: '',
});
const startVariablesJson = ref('');
const starting = ref(false);
const startError = ref<string | null>(null);

const activeProcesses = ref<ProcessInstance[]>([]);
const completedProcesses = ref<HistoricProcessInstance[]>([]);
const loading = ref(false);
const acting = reactive<Record<string, boolean>>({});
const showHistoricTasks = reactive<Record<string, boolean>>({});
const historicTasks = reactive<Record<string, HistoricTask[]>>({});
const loadingHistoric = reactive<Record<string, boolean>>({});

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  selectedFile.value = target.files?.[0] ?? null;
}

async function handleDeploy() {
  if (!selectedFile.value) return;
  deploying.value = true;
  try {
    deployResult.value = await deployProcess(selectedFile.value);
    selectedFile.value = null;
    await loadData();
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Failed to deploy process');
  } finally {
    deploying.value = false;
  }
}

function parseVariables() {
  if (!startVariablesJson.value.trim()) {
    return {};
  }
  try {
    const parsed = JSON.parse(startVariablesJson.value);
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Variables must be a JSON object');
    }
    return parsed as Record<string, unknown>;
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Invalid JSON');
  }
}

async function handleStartProcess() {
  starting.value = true;
  startError.value = null;
  try {
    const variables = parseVariables();
    await startProcess({
      processDefinitionKey: startPayload.processDefinitionKey,
      businessKey: startPayload.businessKey || undefined,
      variables,
    });
    startPayload.businessKey = '';
    startVariablesJson.value = '';
    await loadData();
  } catch (err: unknown) {
    startError.value = err instanceof Error ? err.message : 'Failed to start process';
  } finally {
    starting.value = false;
  }
}

async function loadData() {
  loading.value = true;
  try {
    [activeProcesses.value, completedProcesses.value] = await Promise.all([
      fetchActiveProcesses(),
      fetchCompletedProcesses(),
    ]);
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Failed to load process data');
  } finally {
    loading.value = false;
  }
}

async function toggleSuspend(instance: ProcessInstance) {
  acting[instance.id] = true;
  try {
    if (instance.suspended) {
      await activateProcess(instance.id);
    } else {
      await suspendProcess(instance.id);
    }
    await loadData();
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Failed to update process');
  } finally {
    acting[instance.id] = false;
  }
}

async function remove(instance: ProcessInstance) {
  if (!confirm(`Delete process instance ${instance.id}?`)) {
    return;
  }
  acting[instance.id] = true;
  try {
    await deleteProcess(instance.id);
    await loadData();
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Failed to delete process');
  } finally {
    acting[instance.id] = false;
  }
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleString();
}

function formatDuration(value?: number) {
  if (!value) return '—';
  return (value / 60000).toFixed(1);
}

async function toggleHistoricTasks(processInstanceId: string) {
  if (showHistoricTasks[processInstanceId]) {
    showHistoricTasks[processInstanceId] = false;
    return;
  }

  if (historicTasks[processInstanceId]) {
    showHistoricTasks[processInstanceId] = true;
    return;
  }

  loadingHistoric[processInstanceId] = true;
  try {
    const tasks = await fetchHistoricTasks(processInstanceId);
    historicTasks[processInstanceId] = tasks;
    showHistoricTasks[processInstanceId] = true;
  } catch (err: unknown) {
    alert(err instanceof Error ? err.message : 'Failed to load historic tasks');
  } finally {
    loadingHistoric[processInstanceId] = false;
  }
}

onMounted(async () => {
  await loadData();
});
</script>

<style scoped>
.admin-view {
  display: grid;
  gap: 1.5rem;
}

.card {
  background-color: white;
  border-radius: 14px;
  padding: 1.5rem;
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-weight: 600;
}

input,
textarea {
  padding: 0.6rem 0.75rem;
  border: 1px solid #cbd5f5;
  border-radius: 8px;
  font-size: 1rem;
}

textarea {
  font-family: inherit;
}

button {
  align-self: flex-start;
  border: none;
  border-radius: 8px;
  padding: 0.6rem 1rem;
  font-weight: 600;
  background-color: #2563eb;
  color: white;
  transition: transform 0.1s ease;
}

.success {
  color: #15803d;
  font-weight: 500;
}

.error {
  color: #b91c1c;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh {
  background-color: #1d4ed8;
}

.loading {
  color: #475569;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th,
.table td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.95rem;
}

.status {
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
}

.status.running {
  background-color: rgba(34, 197, 94, 0.15);
  color: #15803d;
}

.status.suspended {
  background-color: rgba(221, 107, 32, 0.15);
  color: #c26d19;
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.secondary {
  background-color: #6366f1;
}

.danger {
  background-color: #dc2626;
}

.empty {
  text-align: center;
  color: #64748b;
  padding: 1rem 0;
}

.form-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
}

.historic-tasks-cell {
  padding: 1rem;
  background-color: #f8fafc;
}

.historic-tasks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.historic-tasks h4 {
  margin: 0;
  font-size: 1rem;
  color: #1f2937;
}

.nested-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9rem;
}

.nested-table th,
.nested-table td {
  padding: 0.6rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.nested-table th {
  background-color: #f1f5f9;
  font-weight: 600;
  color: #475569;
}

.variables-preview {
  margin: 0;
  padding: 0.4rem 0.6rem;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.8rem;
  font-family: 'Monaco', 'Courier New', monospace;
  max-width: 300px;
  max-height: 150px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>


