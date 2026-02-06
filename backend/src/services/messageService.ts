import type { Message } from "../types/index.js";
import { config } from "../utils/config.js";
import { generateMockMessages } from "./mockData.js";

export class MessageService {
  // In-memory message store (no file persistence for messages in Claude Code)
  private messages: Message[] = [];
  private nextId = 1;

  async listMessages(teamId: string): Promise<Message[]> {
    if (config.mockData) {
      return generateMockMessages().filter((m) => m.teamId === teamId);
    }
    return this.messages.filter((m) => m.teamId === teamId);
  }

  async addMessage(data: {
    teamId: string;
    type: Message["type"];
    sender: string;
    recipient?: string;
    content: string;
    summary?: string;
  }): Promise<Message> {
    const message: Message = {
      id: `msg-${this.nextId++}`,
      teamId: data.teamId,
      type: data.type,
      sender: data.sender,
      recipient: data.recipient,
      content: data.content,
      summary: data.summary,
      timestamp: new Date().toISOString(),
    };
    this.messages.push(message);
    return message;
  }
}

export const messageService = new MessageService();
