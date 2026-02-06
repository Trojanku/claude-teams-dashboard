import { APIRequestContext } from '@playwright/test';

const API_BASE = 'http://localhost:3001/api';

/**
 * Helper utilities for interacting with the backend REST API during tests.
 * Uses the actual API shapes from the backend implementation.
 */
export class ApiHelper {
  constructor(private request: APIRequestContext) {}

  // -- Reset (for test isolation) --

  async reset() {
    await this.request.post(`${API_BASE}/reset`);
  }

  // -- Teams --

  async getTeams() {
    const res = await this.request.get(`${API_BASE}/teams`);
    return res.json();
  }

  async deleteTeam(id: string) {
    await this.request.delete(`${API_BASE}/teams/${id}`);
  }

  // -- Tasks --

  async getTasks() {
    const res = await this.request.get(`${API_BASE}/tasks`);
    return res.json();
  }

  async createTask(data: {
    teamId: string;
    subject: string;
    description?: string;
    owner?: string;
  }) {
    const res = await this.request.post(`${API_BASE}/tasks`, { data });
    return res.json();
  }

  async updateTask(taskId: string, teamId: string, updates: Record<string, unknown>) {
    const res = await this.request.patch(`${API_BASE}/tasks/${taskId}?teamId=${teamId}`, {
      data: updates,
    });
    return res.json();
  }

  // -- Messages --

  async getMessages(teamId: string) {
    const res = await this.request.get(`${API_BASE}/messages/${teamId}`);
    return res.json();
  }

  async sendMessage(data: {
    teamId: string;
    type: string;
    sender: string;
    recipient?: string;
    content: string;
  }) {
    const res = await this.request.post(`${API_BASE}/messages`, { data });
    return res.json();
  }
}
