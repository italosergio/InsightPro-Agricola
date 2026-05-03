import { useState, type ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

export function AppLayout({ children, title, subtitle }: { children: ReactNode; title: string; subtitle?: string }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-container">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <Header title={title} subtitle={subtitle} onMenuToggle={() => setSidebarOpen(true)} />
        <div className="content">
          {children}
        </div>
      </main>
    </div>
  )
}
