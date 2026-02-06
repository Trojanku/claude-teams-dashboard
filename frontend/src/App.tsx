import { useEffect } from 'react'
import { useUIStore } from '@/stores/uiStore'
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket'
import { Header, Sidebar, StatusBar } from '@/components/layout'
import { TeamsPage } from '@/pages/TeamsPage'
import { TasksPage } from '@/pages/TasksPage'
import { AgentsPage } from '@/pages/AgentsPage'
import { MessagesPage } from '@/pages/MessagesPage'

function App() {
  const currentView = useUIStore((s) => s.currentView)
  const setConnected = useUIStore((s) => s.setConnected)

  useEffect(() => {
    const socket = getSocket()
    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    connectSocket()
    return () => {
      disconnectSocket()
    }
  }, [setConnected])

  const renderPage = () => {
    switch (currentView) {
      case 'teams':
        return <TeamsPage />
      case 'tasks':
        return <TasksPage />
      case 'agents':
        return <AgentsPage />
      case 'messages':
        return <MessagesPage />
    }
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          {renderPage()}
        </main>
      </div>
      <StatusBar />
    </div>
  )
}

export default App
