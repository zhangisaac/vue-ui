<<<<<<< HEAD
# vue-ui
=======
# Workflow BPMN Dashboard

Vue 3 + TypeScript dashboard for the Workflow BPMN Service. This frontend application provides a user interface for authentication, task management, and administrator operations.

## Features

- **Authentication:** JWT-based login with role-based access control
- **Task Management:** View and complete assigned tasks, claim group tasks
- **Process Administration:** Deploy BPMN definitions, start process instances, monitor active and completed processes (admin only)
- **Modern UI:** Clean, responsive design built with Vue 3 Composition API

## Prerequisites

- Node.js 18+
- npm or yarn

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:5173` and proxies `/api` requests to the backend at `http://localhost:8080`.

3. Production build:

   ```bash
   npm run build
   npm run preview
   ```

## Project Structure

```
src/
  components/     # Reusable Vue components
  router/         # Vue Router configuration
  services/       # API client and service functions
  stores/         # Pinia state management (auth store)
  types/          # TypeScript type definitions
  views/          # Page components
    - LoginView.vue
    - ShellView.vue
    - UserTasksView.vue
    - CandidateTasksView.vue
    - AdminProcessesView.vue
```

## Backend Integration

This frontend connects to the Workflow BPMN Service backend API. Ensure the backend is running on `http://localhost:8080` before starting the frontend.

### API Endpoints Used

- `POST /api/auth/login` - User authentication
- `GET /api/tasks/my` - Get tasks assigned to current user
- `GET /api/tasks/candidate` - Get group tasks available to current user
- `POST /api/tasks/{id}/claim` - Claim a group task
- `POST /api/tasks/{id}/complete` - Complete a task
- `POST /api/processes/deploy` - Deploy BPMN definition (admin only)
- `POST /api/processes/start` - Start a process instance (admin only)
- `GET /api/processes/active` - List active instances (admin only)
- `GET /api/processes/completed` - List completed instances (admin only)
- `POST /api/processes/{id}/suspend|activate` - Control instance state (admin only)
- `DELETE /api/processes/{id}` - Delete an instance (admin only)

## Default Users

| Username | Password | Roles                     | Candidate Groups       |
|----------|----------|---------------------------|------------------------|
| admin    | admin    | ROLE_ADMIN, ROLE_USER     | managers, hr_staff     |
| user     | user     | ROLE_USER                 | employees              |
| manager  | manager  | ROLE_USER                 | managers               |
| hr       | hr       | ROLE_USER                 | hr_staff               |

## Technology Stack

- **Vue 3** - Progressive JavaScript framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Vue Router** - Official router for Vue.js
- **Pinia** - State management for Vue
- **Axios** - HTTP client for API requests

## Development

The development server uses Vite's HMR (Hot Module Replacement) for fast development. Changes to Vue components will be reflected immediately without a full page reload.

## License

MIT (see `LICENSE` if provided) or adapt to your organisational standards.
>>>>>>> Initialization
