import { NavLink } from 'react-router-dom'
import { type ReactNode } from 'react'
import { useAuth } from '@/store/AuthContext'

interface NavSection {
  title: string
  items: { path: string; label: string; icon: string }[]
}

const navSections: NavSection[] = [
  {
    title: 'Principal',
    items: [
      { path: '/inicio', label: 'Início', icon: 'home' },
      { path: '/', label: 'Dashboard', icon: 'dashboard' },
      { path: '/upload', label: 'Upload de Dados', icon: 'upload' },
      { path: '/clientes', label: 'Clientes', icon: 'clientes' },
    ],
  },
  {
    title: 'Analises',
    items: [
      { path: '/analise-abc', label: 'Analise ABC', icon: 'abc' },
      { path: '/penetracao', label: 'Penetracao', icon: 'penetracao' },
      { path: '/swot', label: 'Analise SWOT', icon: 'swot' },
      { path: '/gut', label: 'Matriz GUT', icon: 'gut' },
      { path: '/pest', label: 'Analise PEST', icon: 'pest' },
    ],
  },
  {
    title: 'Estrategia',
    items: [
      { path: '/metas', label: 'Metas & KPIs', icon: 'metas' },
      { path: '/campanhas', label: 'Campanhas', icon: 'campanhas' },
      { path: '/pipeline', label: 'Pipeline', icon: 'pipeline' },
    ],
  },
  {
    title: 'Relatorios',
    items: [
      { path: '/relatorios', label: 'Relatorios', icon: 'relatorios' },
      { path: '/exportar', label: 'Exportar', icon: 'exportar' },
    ],
  },
]

const icons: Record<string, ReactNode> = {
  home: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
    </svg>
  ),
  upload: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  ),
  clientes: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  abc: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  ),
  penetracao: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" />
    </svg>
  ),
  swot: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="12" y1="3" x2="12" y2="21" />
    </svg>
  ),
  gut: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  pest: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  metas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  campanhas: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 17H2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3z" /><path d="M16 8a4 4 0 0 0-8 0v5h8V8z" />
    </svg>
  ),
  pipeline: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  ),
  relatorios: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  ),
  exportar: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
      <line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 12 15 15" />
    </svg>
  ),
}

export function Sidebar({ isOpen, onClose, minimized, onToggleMinimized }: {
  isOpen: boolean
  onClose: () => void
  minimized: boolean
  onToggleMinimized: () => void
}) {
  const { logout } = useAuth()

  return (
    <>
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''} ${minimized ? 'minimized' : ''}`} role="navigation" aria-label="Menu principal">
        <div className="sidebar-header">
          {!minimized && (
            <div className="sidebar-logo">
              <div className="logo-icon">IP</div>
              <span className="logo-text">InsightPro</span>
            </div>
          )}
          <button className="sidebar-collapse-btn" onClick={onToggleMinimized} aria-label={minimized ? 'Expandir menu' : 'Minimizar menu'}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {minimized
                ? <polyline points="9 18 15 12 9 6" />
                : <polyline points="15 18 9 12 15 6" />
              }
            </svg>
          </button>
        </div>

        <nav className="sidebar-nav">
          {navSections.map(section => (
            <div key={section.title} className="nav-section">
              {!minimized && <div className="nav-section-title">{section.title}</div>}
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                  onClick={onClose}
                  data-label={item.label}
                >
                  {icons[item.icon]}
                  {!minimized && <span>{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-logout-btn" onClick={logout} data-label="Sair">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            {!minimized && <span>Sair</span>}
          </button>
        </div>
      </aside>
    </>
  )
}
