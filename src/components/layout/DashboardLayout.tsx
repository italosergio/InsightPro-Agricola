import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { usePage } from '@/store/PageContext'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [minimized, setMinimized] = useState(() => localStorage.getItem('sidebar_minimized') === 'true')
  const { title, subtitle } = usePage()

  const handleToggleMinimized = () => {
    const next = !minimized
    setMinimized(next)
    localStorage.setItem('sidebar_minimized', String(next))
  }

  return (
    <div className={`app-container ${minimized ? 'sidebar-is-minimized' : ''}`}>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        minimized={minimized}
        onToggleMinimized={handleToggleMinimized}
      />
      <Header title={title} subtitle={subtitle} onMenuToggle={() => setSidebarOpen(true)} />
      <main className="main-content">
        <div className="content">
          <div className="content-spacer" />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
