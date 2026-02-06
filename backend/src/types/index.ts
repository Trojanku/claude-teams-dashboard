import { z } from "zod";

// --- Team Types ---

export const TeamMemberSchema = z.object({
  name: z.string(),
  agentId: z.string(),
  agentType: z.string(),
  status: z.enum(["active", "idle", "error", "inactive"]).optional().default("idle"),
  currentTask: z.string().optional(),
}).passthrough();

export const TeamConfigSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  members: z.array(TeamMemberSchema),
  createdAt: z.union([z.string(), z.number()]).optional(),
}).passthrough();

export type TeamMember = z.infer<typeof TeamMemberSchema>;
export type TeamConfig = z.infer<typeof TeamConfigSchema>;

export interface Team {
  id: string; // team directory name
  name: string;
  description?: string;
  members: TeamMember[];
  taskCount: number;
  activeTasks: number;
  status: "active" | "idle" | "error" | "inactive";
  createdAt?: string;
  lastActivityAt: string;
}

// --- Task Types ---

export const TaskStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "deleted",
]);

export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export interface Task {
  id: string;
  subject: string;
  description?: string;
  status: TaskStatus;
  owner?: string;
  teamId: string;
  blocks: string[];
  blockedBy: string[];
  activeForm?: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

// --- Message Types ---

export const MessageTypeSchema = z.enum([
  "message",
  "broadcast",
  "shutdown_request",
  "shutdown_response",
]);

export type MessageType = z.infer<typeof MessageTypeSchema>;

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

// --- API Request Schemas ---

export const CreateTaskSchema = z.object({
  teamId: z.string().min(1),
  subject: z.string().min(1).max(200),
  description: z.string().optional(),
  activeForm: z.string().optional(),
  owner: z.string().optional(),
});

export const UpdateTaskSchema = z.object({
  status: TaskStatusSchema.optional(),
  subject: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  activeForm: z.string().optional(),
  owner: z.string().nullable().optional(),
  addBlocks: z.array(z.string()).optional(),
  addBlockedBy: z.array(z.string()).optional(),
  metadata: z.record(z.unknown()).optional(),
});

export const SendMessageSchema = z.object({
  teamId: z.string().min(1),
  type: MessageTypeSchema,
  sender: z.string().min(1),
  recipient: z.string().optional(),
  content: z.string().min(1),
  summary: z.string().optional(),
});

export const SpawnTeammateSchema = z.object({
  name: z.string().min(1).max(100),
  agentType: z.string().min(1),
});

// --- WebSocket Event Types ---

export interface ServerToClientEvents {
  "team:created": (team: Team) => void;
  "team:updated": (team: Team) => void;
  "team:deleted": (teamId: string) => void;
  "agent:status": (data: {
    teamId: string;
    agentName: string;
    status: string;
  }) => void;
  "task:created": (task: Task) => void;
  "task:updated": (task: Task) => void;
  "message:received": (message: Message) => void;
}

export interface ClientToServerEvents {
  "subscribe:team": (teamId: string) => void;
  "subscribe:tasks": (teamId: string) => void;
  "send:message": (message: z.infer<typeof SendMessageSchema>) => void;
}
