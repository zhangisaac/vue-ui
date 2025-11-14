<template>
  <div class="tasks-view">
    <section class="header">
      <h2>Group Tasks</h2>
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
        <p class="candidates">
          <span v-if="task.candidateGroups.length">Groups: {{ task.candidateGroups.join(', ') }}</span>
          <span v-if="task.candidateUsers.length">Users: {{ task.candidateUsers.join(', ') }}</span>
        </p>
        <footer>
          <button type="button" class="claim" @click="claim(task.id)" :disabled="acting[task.id]">
            <span v-if="acting[task.id]">Claiming…</span>
            <span v-else>Claim Task</span>
          </button>
        </footer>
      </article>
      <p v-if="tasks.length === 0" class="empty">No group tasks available right now.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { claimTask, fetchCandidateTasks } from '@/services/api';
import type { Task } from '@/types/workflow';

const tasks = ref<Task[]>([]);
const loading = ref(false);
const error = ref<string | null>(null);
const acting = reactive<Record<string, boolean>>({});

async function loadTasks() {
  loading.value = true;
  error.value = null;
  try {
    tasks.value = await fetchCandidateTasks();
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Unable to load tasks';
  } finally {
    loading.value = false;
  }
}

async function claim(taskId: string) {
  acting[taskId] = true;
  try {
    await claimTask(taskId);
    await loadTasks();
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Unable to claim task';
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

.candidates {
  font-size: 0.85rem;
  color: #475569;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.claim {
  align-self: flex-start;
  border: none;
  border-radius: 8px;
  padding: 0.55rem 1rem;
  background-color: #f59e0b;
  color: white;
  font-weight: 600;
}

.empty {
  color: #64748b;
  font-style: italic;
}
</style>


