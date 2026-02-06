import { Users, ListTodo, Bot, MessageSquare, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIStore } from '@/stores/uiStore'
import { cn } from '@/lib/utils'
import type { ViewType } from '@/types'

const navItems: { id: ViewType; label: string; icon: React.ElementType }[] = [
  { id: 'teams', label: 'Teams', icon: Users },
  { id: 'tasks', label: 'Tasks', icon: ListTodo },
  { id: 'agents', label: 'Agents', icon: Bot },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
]

export function Sidebar() {
  const currentView = useUIStore((s) => s.currentView)
  const setCurrentView = useUIStore((s) => s.setCurrentView)
  const collapsed = useUIStore((s) => s.sidebarCollapsed)
  const toggleSidebar = useUIStore((s) => s.toggleSidebar)

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-sidebar transition-all duration-200',
        collapsed ? 'w-16' : 'w-56'
      )}
    >
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer',
                  isActive
                    ? 'bg-sidebar-accent text-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground'
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </button>
            )
          })}
        </nav>
      </div>
      <div className="border-t border-border p-2">
        <button
          onClick={toggleSidebar}
          className="flex w-full items-center justify-center rounded-md p-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-foreground transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>
    </aside>
  )
}
