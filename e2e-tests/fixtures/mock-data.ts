/**
 * Type definitions matching the actual backend/frontend data shapes.
 * These are reference types for test helpers - the actual mock data
 * is provided by the backend's mockData.ts service.
 */

export interface TeamMember {
  name: string;
  agentId: string;
  agentType: string;
  status?: 'active' | 'idle' | 'error';
  currentTask?: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  members: TeamMember[];
  taskCount: number;
  activeTasks: number;
  status: 'active' | 'idle' | 'error';
  createdAt?: string;
}

export interface Task {
  id: string;
  subject: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  owner?: string;
  teamId: string;
  blocks: string[];
  blockedBy: string[];
  activeForm?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Message {
  id: string;
  teamId: string;
  type: 'message' | 'broadcast' | 'shutdown_request' | 'shutdown_response';
  sender: string;
  recipient?: string;
  content: string;
  summary?: string;
  timestamp: string;
}

/**
 * Known mock teams from the backend's generateMockTeams().
 * Useful for reference in test assertions.
 */
export const MOCK_TEAM_IDS = {
  FEATURE_AUTH: 'feature-auth',
  REFACTOR_API: 'refactor-api',
  DOCS_UPDATE: 'docs-update',
} as const;

/**
 * Known mock data counts for assertions.
 */
export const MOCK_COUNTS = {
  TEAMS: 3,
  AGENTS: 9, // 4 + 3 + 2
  FEATURE_AUTH_AGENTS: 4,
  REFACTOR_API_AGENTS: 3,
  DOCS_UPDATE_AGENTS: 2,
  TOTAL_TASKS: 16,
} as const;
