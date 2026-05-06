import { useTheme } from '@/store/ThemeContext'

export function Header({ title, subtitle, onMenuToggle }: { title: string; subtitle?: string; onMenuToggle: () => void }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <header
      className="app-header"
      style={{
        backdropFilter: 'blur(14px) saturate(1.2)',
        WebkitBackdropFilter: 'blur(14px) saturate(1.2)',
        background: isDark ? 'rgba(13,23,16,0.78)' : 'rgba(255,255,255,0.72)',
      }}
    >
      <div className="header-left">
        <button
          className="header-menu-mobile"
          onClick={onMenuToggle}
          aria-label="Abrir menu"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="header-title-group">
          <h1 className="header-title">{title}</h1>
          {subtitle && (
            <p className="header-subtitle">
              <span className="header-subtitle-dot" />
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="header-right">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
          {theme === 'light' ? (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              <span>Escuro</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
              <span>Claro</span>
            </>
          )}
        </button>
      </div>
    </header>
  )
}
