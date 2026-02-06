# Claude Teams UI - Design Document

## Product Overview
A web-based UI for managing, monitoring, and interacting with Claude Code agent teams in real-time.

## Core Features

### 1. Team Management Dashboard
- **Team List View**: Display all active teams with status indicators
- **Team Creation**: UI to spawn new teams with custom configurations
- **Team Details**: View team members, their roles, and current status
- **Team Cleanup**: Gracefully shutdown and cleanup teams

### 2. Task Management Interface
- **Task Board**: Kanban-style view of tasks (pending, in_progress, completed)
- **Task Details**: Full task information including description, owner, dependencies
- **Task Creation**: Create new tasks and assign to team members
- **Task Updates**: Update status, owner, and dependencies
- **Dependency Visualization**: Show task relationships and blocking status

### 3. Agent Activity Monitor
- **Agent Status**: Real-time status of each agent (active, idle, working)
- **Message Stream**: Live feed of messages between agents
- **Activity Timeline**: Historical view of agent actions and task completions
- **Agent Details**: View individual agent info, current task, and capabilities

### 4. Real-time Communication
- **Message Viewer**: Display messages between agents
- **Message Composer**: Send messages to specific agents or broadcast
- **Notification System**: Alert on task completions, agent status changes
- **Agent Chat Interface**: Direct communication with specific agents

### 5. Analytics & Insights
- **Task Metrics**: Completion rates, average time, bottlenecks
- **Agent Performance**: Task completion by agent, idle time
- **Team Efficiency**: Overall team productivity metrics
- **Visual Charts**: Graphs showing team activity over time

## Technical Architecture

### Frontend Stack
- **Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development
- **Styling**: TailwindCSS for utility-first styling
- **State Management**: Zustand for lightweight state management
- **UI Components**: shadcn/ui for consistent, accessible components
- **Real-time**: WebSocket client for live updates
- **Data Fetching**: React Query for server state management

### Backend Stack
- **Runtime**: Node.js 20+ with TypeScript
- **Framework**: Express.js for REST API
- **WebSocket**: Socket.io for real-time bidirectional communication
- **File System Access**: Direct integration with Claude Code team/task directories
  - Teams: `~/.claude/teams/{team-name}/config.json`
  - Tasks: `~/.claude/tasks/{team-name}/`
- **Validation**: Zod for runtime type validation
- **API Design**: RESTful endpoints + WebSocket events

### File System Integration
The backend will monitor and interact with:
- `~/.claude/teams/`: Team configuration files
- `~/.claude/tasks/`: Task list directories
- File watchers to detect changes and push updates to UI

### API Endpoints

#### REST API
```
GET    /api/teams                 - List all teams
POST   /api/teams                 - Create new team
GET    /api/teams/:id             - Get team details
DELETE /api/teams/:id             - Cleanup team
GET    /api/teams/:id/members     - List team members
POST   /api/teams/:id/spawn       - Spawn teammate

GET    /api/tasks                 - List all tasks
POST   /api/tasks                 - Create task
GET    /api/tasks/:id             - Get task details
PATCH  /api/tasks/:id             - Update task
GET    /api/teams/:teamId/tasks   - Get team's tasks

POST   /api/messages              - Send message to agent
GET    /api/messages/:teamId      - Get message history
```

#### WebSocket Events
```
Client -> Server:
- subscribe:team        - Subscribe to team updates
- subscribe:tasks       - Subscribe to task updates
- send:message          - Send message to agent

Server -> Client:
- team:created          - New team spawned
- team:updated          - Team config changed
- team:deleted          - Team cleaned up
- agent:status          - Agent status changed
- task:created          - New task created
- task:updated          - Task status/details changed
- message:received      - New message in team
```

## UI/UX Design

### Layout
```
┌─────────────────────────────────────────────────────┐
│ Header: Claude Teams UI                   [Settings]│
├──────────┬──────────────────────────────────────────┤
│          │                                           │
│ Sidebar: │                                           │
│          │         Main Content Area                 │
│ - Teams  │                                           │
│ - Tasks  │         (Dynamic based on selection)      │
│ - Agents │                                           │
│ - Msgs   │                                           │
│          │                                           │
├──────────┴──────────────────────────────────────────┤
│ Status Bar: Connected • 3 teams • 8 agents active   │
└─────────────────────────────────────────────────────┘
```

### Key Views

#### 1. Teams View
- Grid/List of team cards
- Each card shows: name, member count, active tasks, status
- Quick actions: View, Spawn Agent, Cleanup

#### 2. Task Board View
- Three columns: Pending, In Progress, Completed
- Drag-and-drop to update status
- Color-coded by priority/type
- Shows task owner (agent) and dependencies

#### 3. Agent Monitor View
- List of all agents across teams
- Status indicators: 🟢 Active, 🟡 Idle, 🔴 Error
- Current task being worked on
- Recent activity log

#### 4. Messages View
- Chat-like interface
- Filter by team/agent
- Message types: DM, broadcast, system
- Send message composer

### Color Scheme
- Primary: Blue (#3B82F6) - Actions, links
- Success: Green (#10B981) - Completed, active
- Warning: Yellow (#F59E0B) - Idle, pending
- Error: Red (#EF4444) - Failed, blocked
- Neutral: Gray (#6B7280) - Text, borders

## Project Structure

```
claude-teams-ui/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── teams/
│   │   │   ├── tasks/
│   │   │   ├── agents/
│   │   │   ├── messages/
│   │   │   └── ui/          # shadcn components
│   │   ├── hooks/
│   │   ├── lib/
│   │   ├── pages/
│   │   ├── stores/
│   │   ├── types/
│   │   └── utils/
│   ├── public/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/
│   │   │   └── controllers/
│   │   ├── services/
│   │   │   ├── teamService.ts
│   │   │   ├── taskService.ts
│   │   │   └── fileWatcher.ts
│   │   ├── websocket/
│   │   ├── types/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── e2e-tests/
│   ├── tests/
│   ├── playwright.config.ts
│   └── package.json
├── docs/
└── README.md
```

## Implementation Phases

### Phase 1: Foundation (Week 1)
- Setup project structure and development environment
- Initialize frontend (Vite + React + TypeScript)
- Initialize backend (Express + TypeScript)
- Basic file system reading for teams/tasks
- Simple REST API for reading data

### Phase 2: Core Features (Week 2)
- Team management UI and API
- Task board UI with CRUD operations
- Agent status display
- WebSocket connection setup
- Real-time updates for basic operations

### Phase 3: Advanced Features (Week 3)
- Message system UI and WebSocket events
- Task dependencies and visualization
- Agent activity timeline
- File watchers for automatic updates
- Error handling and validation

### Phase 4: Polish & Testing (Week 4)
- E2E tests with Playwright
- Performance optimization
- UI/UX refinements
- Documentation
- Deployment setup

## Testing Strategy

### Frontend Testing
- Unit tests: Vitest + React Testing Library
- Component tests: Storybook for isolation
- E2E tests: Playwright for full user flows

### Backend Testing
- Unit tests: Vitest for services and utilities
- Integration tests: API endpoint testing
- WebSocket tests: Socket.io client testing

### E2E Testing Scenarios
1. Create a new team and verify it appears in UI
2. Create tasks and update their status via drag-and-drop
3. Monitor agent status changes in real-time
4. Send messages between agents and verify delivery
5. Complete full workflow: team creation -> task assignment -> completion
6. Test cleanup and proper resource disposal

## Security Considerations
- No authentication in MVP (local development only)
- File system access restricted to `.claude` directories
- Input validation on all API endpoints
- WebSocket message validation
- Rate limiting on API and WebSocket

## Performance Goals
- Initial load: < 2 seconds
- Real-time update latency: < 100ms
- Support for: 10+ concurrent teams, 50+ agents
- Smooth 60fps animations and transitions

## Future Enhancements
- Authentication and multi-user support
- Team templates and presets
- Task scheduling and automation
- Agent capability configuration
- Export/import team configurations
- Historical data and analytics
- Mobile responsive design
