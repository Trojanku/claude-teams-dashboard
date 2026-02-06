const BASE_URL = '/api'

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE_URL}${url}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || 'Request failed')
  }

  return response.json()
}

export const api = {
  // Teams
  getTeams: () => request<unknown>('/teams'),
  getTeam: (id: string) => request<unknown>(`/teams/${id}`),
  deleteTeam: (id: string) => request<unknown>(`/teams/${id}`, { method: 'DELETE' }),
  getTeamMembers: (id: string) => request<unknown>(`/teams/${id}/members`),

  // Tasks
  getTasks: () => request<unknown>('/tasks'),
  getTeamTasks: (teamId: string) => request<unknown>(`/teams/${teamId}/tasks`),
  getTask: (id: string) => request<unknown>(`/tasks/${id}`),
  createTask: (data: unknown) => request<unknown>('/tasks', { method: 'POST', body: JSON.stringify(data) }),
  updateTask: (id: string, data: unknown, teamId?: string) => request<unknown>(`/tasks/${id}${teamId ? `?teamId=${teamId}` : ''}`, { method: 'PATCH', body: JSON.stringify(data) }),

  // Messages
  getMessages: (teamId: string) => request<unknown>(`/messages/${teamId}`),
  sendMessage: (data: unknown) => request<unknown>('/messages', { method: 'POST', body: JSON.stringify(data) }),
}
