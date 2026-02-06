import { useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Filter } from 'lucide-react'
import { KanbanColumn, TaskDetailPanel } from '@/components/tasks'
import { useTaskStore } from '@/stores/taskStore'
import { useTeamStore } from '@/stores/teamStore'
import { api } from '@/lib/api'
import type { Task, TaskStatus } from '@/types'

export function TasksPage() {
  const queryClient = useQueryClient()
  const selectedTaskId = useTaskStore((s) => s.selectedTaskId)
  const selectTask = useTaskStore((s) => s.selectTask)
  const filterTeamId = useTaskStore((s) => s.filterTeamId)
  const setFilterTeamId = useTaskStore((s) => s.setFilterTeamId)
  const setTasks = useTaskStore((s) => s.setTasks)
  const teams = useTeamStore((s) => s.teams)

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', filterTeamId],
    queryFn: async () => {
      const result = filterTeamId
        ? await api.getTeamTasks(filterTeamId)
        : await api.getTasks()
      const tasksList = (result as { data: Task[] }).data ?? result as unknown as Task[]
      const arr = Array.isArray(tasksList) ? tasksList : []
      setTasks(arr)
      return arr
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, status, teamId }: { id: string; status: TaskStatus; teamId?: string }) =>
      api.updateTask(id, { status }, teamId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })

  const handleSelectTask = useCallback((task: Task) => {
    selectTask(task.id)
  }, [selectTask])

  const handleStatusChange = useCallback((taskId: string, status: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId)
    updateMutation.mutate({ id: taskId, status, teamId: task?.teamId })
  }, [updateMutation, tasks])

  const columns = useMemo(() => ({
    pending: tasks.filter((t) => t.status === 'pending'),
    in_progress: tasks.filter((t) => t.status === 'in_progress'),
    completed: tasks.filter((t) => t.status === 'completed'),
  }), [tasks])

  const selectedTask = tasks.find((t) => t.id === selectedTaskId)

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center justify-between p-6 pb-4">
          <div>
            <h2 className="text-lg font-semibold">Task Board</h2>
            <p className="text-sm text-muted-foreground">
              Track and manage team tasks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterTeamId ?? ''}
                onChange={(e) => setFilterTeamId(e.target.value || null)}
                className="h-8 rounded-md border border-input bg-transparent px-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto px-6 pb-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div data-testid="kanban-grid" className="grid h-full grid-cols-3 gap-4">
              <KanbanColumn
                title="Pending"
                status="pending"
                tasks={columns.pending}
                onSelectTask={handleSelectTask}
                onStatusChange={handleStatusChange}
              />
              <KanbanColumn
                title="In Progress"
                status="in_progress"
                tasks={columns.in_progress}
                onSelectTask={handleSelectTask}
                onStatusChange={handleStatusChange}
              />
              <KanbanColumn
                title="Completed"
                status="completed"
                tasks={columns.completed}
                onSelectTask={handleSelectTask}
                onStatusChange={handleStatusChange}
              />
            </div>
          )}
        </div>
      </div>

      {selectedTask && (
        <TaskDetailPanel
          task={selectedTask}
          onClose={() => selectTask(null)}
          onStatusChange={handleStatusChange}
        />
      )}

    </div>
  )
}
