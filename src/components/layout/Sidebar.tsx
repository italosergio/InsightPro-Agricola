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
      { path: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
      { path: '/clientes', label: 'Clientes', icon: 'clientes' },
      { path: '/produtos', label: 'Produtos', icon: 'produtos' },
    ],
  },
  {
    title: 'Analises',
    items: [
      { path: '/penetracao', label: 'Penetracao', icon: 'penetracao' },
      { path: '/analise-abc', label: 'Analise ABC', icon: 'abc' },
      { path: '/cultura', label: 'Cultura', icon: 'cultura' },
      { path: '/oportunidades', label: 'Oportunidades', icon: 'oportunidades' },
      { path: '/territorial', label: 'Territorial', icon: 'territorial' },
      { path: '/gaps', label: 'Gaps', icon: 'gaps' },
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
      { path: '/fidelizacao', label: 'Fidelizacao', icon: 'fidelizacao' },
    ],
  },
  {
    title: 'Relatorios',
    items: [
      { path: '/relatorios', label: 'Relatorios', icon: 'relatorios' },
      { path: '/exportar', label: 'Exportar', icon: 'exportar' },
    ],
  },
  {
    title: 'Cadastros',
    items: [
      { path: '/cadastro-clientes', label: 'Clientes', icon: 'clientes' },
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
  cultura: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 20h10" /><path d="M12 20v-6" /><path d="M8 8c0-2.21 1.79-4 4-4s4 1.79 4 4" />
      <path d="M6 14c0-2.21 1.79-4 4-4s4 1.79 4 4" /><circle cx="12" cy="8" r="1" />
    </svg>
  ),
  oportunidades: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="5" /><line x1="12" y1="2" x2="12" y2="7" />
      <line x1="12" y1="17" x2="12" y2="22" /><line x1="2" y1="12" x2="7" y2="12" /><line x1="17" y1="12" x2="22" y2="12" />
    </svg>
  ),
  territorial: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 22 8 12 14 2 8" /><polyline points="2 8 2 16 12 22 22 16 22 8" />
      <line x1="12" y1="14" x2="12" y2="22" />
    </svg>
  ),
  gaps: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="2" y1="22" x2="22" y2="2" /><path d="M17 14l-3 3 3 3" /><path d="M7 10l3-3-3-3" />
    </svg>
  ),
  fidelizacao: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  produtos: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /><rect x="2" y="8" width="20" height="12" rx="2" />
      <line x1="6" y1="12" x2="10" y2="12" /><line x1="6" y1="16" x2="10" y2="16" />
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
          <div className="sidebar-logo">
            <div className="logo-icon">IP</div>
            {!minimized && (
              <div className="sidebar-logo-text">
                <span className="logo-text">InsightPro</span>
                <span className="logo-subtitle">AGRICULTURA</span>
              </div>
            )}
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            type="button"
            className="sidebar-toggle-btn"
            onClick={onToggleMinimized}
            aria-label={minimized ? 'Expandir menu' : 'Recolher menu'}
            aria-expanded={!minimized}
            data-label={minimized ? 'Expandir menu' : 'Recolher menu'}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="4" width="18" height="16" rx="2" />
              <line x1="9" y1="4" x2="9" y2="20" />
              {minimized
                ? <polyline points="14 9 17 12 14 15" />
                : <polyline points="17 9 14 12 17 15" />
              }
            </svg>
            {!minimized && <span>Minimizar menu</span>}
          </button>
          
          <NavLink
            to="/"
            className="sidebar-home-btn"
            data-label="Página Inicial"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
              <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
              <line x1="12" y1="22.08" x2="12" y2="12" />
            </svg>
            {!minimized && <span>Página Inicial</span>}
          </NavLink>

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
