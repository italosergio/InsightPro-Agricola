import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [minimized, setMinimized] = useState(() => localStorage.getItem('sidebar_minimized') === 'true')

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
          {children}
        </div>
      </main>
    </div>
  )
}
