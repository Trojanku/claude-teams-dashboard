// Team types
export interface Team {
  id: string;
  name: string;
  description: string;
  members: TeamMember[];
  createdAt: string;
  status: 'active' | 'idle' | 'error' | 'inactive';
  lastActivityAt?: string;
}

export interface TeamMember {
  name: string;
  agentId: string;
  agentType: string;
  status: AgentStatus;
  currentTask?: string;
}

export type AgentStatus = 'active' | 'idle' | 'error' | 'inactive';

// Task types
export interface Task {
  id: string;
  subject: string;
  description: string;
  status: TaskStatus;
  owner?: string;
  teamId: string;
  blocks: string[];
  blockedBy: string[];
  activeForm?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface TaskUpdate {
  status?: TaskStatus;
  subject?: string;
  description?: string;
  owner?: string;
  addBlocks?: string[];
  addBlockedBy?: string[];
}

// Message types
export interface Message {
  id: string;
  teamId: string;
  type: MessageType;
  sender: string;
  recipient?: string;
  content: string;
  summary?: string;
  timestamp: string;
}

export type MessageType = 'message' | 'broadcast' | 'system' | 'shutdown_request' | 'shutdown_response';

// Agent types (derived from team members with additional activity data)
export interface Agent {
  name: string;
  agentId: string;
  agentType: string;
  teamId: string;
  teamName: string;
  status: AgentStatus;
  currentTask?: string;
}

export interface AgentActivity {
  id: string;
  agentName: string;
  teamId: string;
  type: 'task_started' | 'task_completed' | 'message_sent' | 'status_changed';
  description: string;
  timestamp: string;
}

// WebSocket event types
export interface WSEvent {
  type: string;
  payload: unknown;
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: string;
}

// View type for navigation
export type ViewType = 'teams' | 'tasks' | 'agents' | 'messages';
