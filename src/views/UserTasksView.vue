<template>
  <div class="tasks-view">
    <section class="header">
      <h2>Tasks Assigned to You</h2>
      <button type="button" class="refresh" @click="loadTasks" :disabled="loading">
        Refresh
      </button>
    </section>

    <div v-if="error" class="error">{{ error }}</div>

    <div v-if="loading" class="loading">Loading tasks…</div>

    <div v-else class="task-grid">
      <article v-for="task in tasks" :key="task.id" class="task-card">
        <header>
          <h3>{{ task.name }}</h3>
          <p class="meta">
            <span>Task ID: {{ task.id }}</span>
            <span>Process: {{ task.processInstanceId }}</span>
          </p>
        </header>
        <p v-if="task.description" class="description">{{ task.description }}</p>
        <div v-if="showForm[task.id]" class="variables-form">
          <label>
            Variables (JSON, optional)
            <textarea
              v-model="taskVariables[task.id]"
              rows="3"
              placeholder='{"approved": true, "comment": "Approved"}'
            ></textarea>
          </label>
          <div class="form-actions">
            <button type="button" class="submit" @click="complete(task.id)" :disabled="acting[task.id]">
              <span v-if="acting[task.id]">Completing…</span>
              <span v-else>Submit</span>
            </button>
            <button type="button" class="cancel" @click="cancelComplete(task.id)">Cancel</button>
          </div>
        </div>
        <footer v-else>
          <button type="button" class="complete" @click="showCompleteForm(task.id)" :disabled="acting[task.id]">
            Complete Task
          </button>
        </footer>
      </article>
      <p v-if="tasks.length === 0" class="empty">You have no active tasks right now.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { completeTask, fetchMyTasks } from '@/services/api';
import type { Task } from '@/types/workflow';

const tasks = ref<Task[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const acting = reactive<Record<string, boolean>>({});
const showForm = reactive<Record<string, boolean>>({});
const taskVariables = reactive<Record<string, string>>({});

async function loadTasks() {
  loading.value = true;
  error.value = null;
  try {
    tasks.value = await fetchMyTasks();
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Unable to load tasks';
  } finally {
    loading.value = false;
  }
}

function showCompleteForm(taskId: string) {
  showForm[taskId] = true;
  if (!taskVariables[taskId]) {
    taskVariables[taskId] = '';
  }
}

function cancelComplete(taskId: string) {
  showForm[taskId] = false;
  taskVariables[taskId] = '';
}

function parseVariables(taskId: string): Record<string, unknown> {
  const varsJson = taskVariables[taskId]?.trim();
  if (!varsJson) {
    return {};
  }
  try {
    const parsed = JSON.parse(varsJson);
    if (typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Variables must be a JSON object');
    }
    return parsed as Record<string, unknown>;
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Invalid JSON format');
  }
}

async function complete(taskId: string) {
  acting[taskId] = true;
  error.value = null;
  try {
    const variables = parseVariables(taskId);
    await completeTask(taskId, variables);
    showForm[taskId] = false;
    taskVariables[taskId] = '';
    await loadTasks();
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Unable to complete task';
  } finally {
    acting[taskId] = false;
  }
}

onMounted(async () => {
  await loadTasks();
});
</script>

<style scoped>
.tasks-view {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.refresh {
  border: none;
  background-color: #1d4ed8;
  color: white;
  padding: 0.6rem 1rem;
  border-radius: 8px;
}

.error {
  color: #dc2626;
  background-color: #fee2e2;
  padding: 1rem;
  border-radius: 8px;
}

.loading {
  padding: 1rem;
  color: #475569;
}

.task-grid {
  display: grid;
  gap: 1rem;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
}

.task-card {
  background-color: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 4px 20px rgba(15, 23, 42, 0.08);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.task-card header h3 {
  margin: 0;
}

.meta {
  margin: 0.25rem 0 0;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.85rem;
  color: #64748b;
}

.description {
  margin: 0;
  color: #475569;
}

.complete {
  align-self: flex-start;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1rem;
  background-color: #22c55e;
  color: white;
  font-weight: 600;
}

.variables-form {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
  border-top: 1px solid #e2e8f0;
}

.variables-form label {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  font-weight: 600;
  font-size: 0.9rem;
}

.variables-form textarea {
  padding: 0.6rem 0.75rem;
  border: 1px solid #cbd5f5;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: 'Monaco', 'Courier New', monospace;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
}

.submit {
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1rem;
  background-color: #22c55e;
  color: white;
  font-weight: 600;
}

.cancel {
  border: 1px solid #cbd5f5;
  border-radius: 8px;
  padding: 0.55rem 1rem;
  background-color: white;
  color: #475569;
  font-weight: 600;
}

.empty {
  color: #64748b;
  font-style: italic;
}
</style>


