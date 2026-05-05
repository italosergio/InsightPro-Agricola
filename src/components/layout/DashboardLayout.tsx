import { useState, useRef, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { usePage } from '@/store/PageContext'

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [minimized, setMinimized] = useState(() => localStorage.getItem('sidebar_minimized') === 'true')
  const { title, subtitle } = usePage()
  const mainRef = useRef<HTMLDivElement>(null)
  const { pathname } = useLocation()

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }
  }, [])

  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    el.scrollTop = 0
    const raf = requestAnimationFrame(() => { el.scrollTop = 0 })
    const t = setTimeout(() => { el.scrollTop = 0 }, 80)
    return () => { cancelAnimationFrame(raf); clearTimeout(t) }
  }, [pathname])

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
      <main className="main-content" key={pathname} ref={mainRef}>
        <div className="content">
          <div className="content-spacer" />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
