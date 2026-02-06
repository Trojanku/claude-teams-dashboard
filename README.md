# Claude Teams UI

A web dashboard for monitoring and managing [Claude Code](https://docs.anthropic.com/en/docs/claude-code) agent teams in real time.

Claude Code's multi-agent team system coordinates AI agents working together on complex tasks. This dashboard provides visibility into those teams — their agents, tasks, messages, and liveness status — through a browser-based interface that reads directly from Claude Code's file system (`~/.claude/teams/` and `~/.claude/tasks/`).

## Features

- **Teams overview** — See all active, idle, and inactive teams at a glance
- **Kanban task board** — View and track tasks across pending/in-progress/completed columns
- **Agent monitor** — List all agents across teams with status filtering
- **Inter-agent messaging** — View message history between agents, send messages and broadcasts
- **Real-time updates** — WebSocket-powered live refresh via file system watchers
- **Stale team detection** — Flags teams with no file activity in 5+ minutes, with bulk cleanup
- **Team cleanup** — Remove stale team and task data from the dashboard

## Tech Stack

| Layer | Stack |
|-------|-------|
| Frontend | React 19, TypeScript, Vite, TailwindCSS 4, Zustand, React Query, Socket.io client |
| Backend | Express, TypeScript, Socket.io, chokidar (file watchers) |
| E2E Tests | Playwright (Chromium) |

## Quick Start

### Prerequisites

- Node.js 20+
- Claude Code CLI (teams are created via `claude` CLI, not the dashboard)

### Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../e2e-tests && npm install && npx playwright install chromium
```

### Run in real mode

Reads live data from `~/.claude/teams/` and `~/.claude/tasks/`:

```bash
# Terminal 1 — backend (port 3001)
cd backend && npm run dev

# Terminal 2 — frontend (port 5173)
cd frontend && npm run dev
```

Open http://localhost:5173

### Run with mock data

For development or demo without any Claude Code teams running:

```bash
cd backend && MOCK_DATA=true npm run dev
cd frontend && npm run dev
```

### Run E2E tests

Tests run against the mock data backend:

```bash
# Start backend with mock data first
cd backend && MOCK_DATA=true npm run dev &

# Start frontend
cd frontend && npm run dev &

# Run tests
cd e2e-tests && npm test
```

## Project Structure

```
claude-teams-ui/
├── backend/             # Express + Socket.io API server
│   └── src/
│       ├── api/routes/  # REST endpoints (teams, tasks, messages)
│       ├── services/    # TeamService, TaskService, MessageService
│       ├── types/       # Zod schemas + TypeScript types
│       └── utils/       # Config, file watcher
├── frontend/            # React + Vite SPA
│   └── src/
│       ├── components/  # UI components (teams, agents, tasks, messages)
│       ├── pages/       # TeamsPage, TasksPage, AgentsPage, MessagesPage
│       ├── stores/      # Zustand state management
│       └── lib/         # API client, utilities
├── e2e-tests/           # Playwright browser tests
│   └── tests/           # 5 spec files, 34 tests
└── DESIGN.md            # Original design specification
```

## How It Works

1. **File system as source of truth** — Claude Code stores team configs in `~/.claude/teams/{team-name}/config.json` and tasks in `~/.claude/tasks/{team-name}/`. The backend reads these directly.

2. **Real-time sync** — chokidar watches the teams and tasks directories. File changes trigger Socket.io events that push updates to connected browsers.

3. **WebSocket rooms** — Each team gets a Socket.io room. Clients only receive updates for teams they're viewing.

4. **Staleness detection** — Each team response includes `lastActivityAt`, computed from the most recent file modification time across config, task, and inbox files. Teams inactive for 5+ minutes are marked "Stale" in the UI.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/teams` | List all teams with member status |
| GET | `/api/teams/:id` | Get team details |
| DELETE | `/api/teams/:id` | Cleanup team (deletes team + task files) |
| GET | `/api/teams/:id/tasks` | List tasks for a team |
| GET | `/api/teams/:id/tasks/:taskId` | Get task details |
| PATCH | `/api/teams/:id/tasks/:taskId` | Update task status |
| GET | `/api/teams/:id/messages` | Get message history |
| POST | `/api/teams/:id/messages` | Send message to agent(s) |

## Next Steps

- [ ] **Agent log streaming** — Tail agent stdout/stderr from tmux panes and display in the dashboard
- [ ] **Task creation/editing from UI** — Allow creating and modifying tasks directly instead of CLI-only
- [ ] **Team-level analytics** — Track task completion rates, agent uptime, and session duration
- [ ] **Dark/light theme toggle** — Currently dark-only; add theme switching
- [ ] **Notification system** — Browser notifications for agent status changes and new messages
- [ ] **Multi-user support** — Authentication and per-user team visibility for shared environments
- [ ] **Agent spawn from UI** — Spawn new teammates into existing teams via the dashboard
- [ ] **Message search and filtering** — Search through message history with full-text filtering
- [ ] **Export/import team configs** — Save and restore team configurations as templates
- [ ] **Mobile responsive layout** — Optimize the dashboard for tablet and mobile viewports

## Development Notes

- Teams are created via `claude` CLI only — the dashboard is read/observe/message, not create
- The `POST /api/reset` endpoint exists for e2e test isolation (resets mock data state)
- Frontend uses Zustand for view routing (sidebar navigation), not React Router
- `data-testid` attributes are used throughout for reliable e2e test selectors
- TailwindCSS v4 — uses `@theme` directive, not `tailwind.config.js`

## License

MIT
