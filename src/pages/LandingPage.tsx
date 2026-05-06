import { Link } from 'react-router-dom'
import { useTheme } from '@/store/ThemeContext'

export function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: isDark ? 'var(--color-stone-950)' : 'var(--color-stone-50)',
    }}>
      {/* Header com toggle tema */}
      <header style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
        <button
          onClick={toggleTheme}
          style={{
            padding: '0.75rem',
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            backgroundColor: isDark ? 'var(--color-stone-800)' : '#fff',
            color: isDark ? 'var(--color-stone-200)' : 'var(--color-stone-700)',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            transition: 'all 0.2s',
          }}
          aria-label="Alternar tema"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Hero */}
      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '1200px' }}>
          <div
            style={{
              position: 'relative',
              borderRadius: '1.5rem',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
              overflow: 'hidden',
              backgroundImage: isDark
                ? 'linear-gradient(rgba(12, 10, 9, 0.85), rgba(12, 10, 9, 0.85)), url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80)'
                : 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '500px',
            }}
          >
            <div style={{ position: 'relative', zIndex: 10, padding: '4rem 2rem' }}>
              <div style={{ maxWidth: '700px' }}>
                <h1 style={{
                  fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                  fontWeight: 700,
                  marginBottom: '1.5rem',
                  color: isDark ? 'var(--color-stone-50)' : 'var(--color-stone-900)',
                  lineHeight: 1.1,
                }}>
                  InsightPro<br />Agrícola
                </h1>
                <p style={{
                  fontSize: 'clamp(1.125rem, 2vw, 1.5rem)',
                  marginBottom: '2rem',
                  lineHeight: 1.6,
                  color: isDark ? 'var(--color-stone-300)' : 'var(--color-stone-700)',
                }}>
                  Plataforma completa de análise e gestão de clientes para o agronegócio. 
                  Transforme dados em decisões estratégicas.
                </p>
                <Link
                  to="/login"
                  style={{
                    display: 'inline-block',
                    padding: '1rem 2rem',
                    borderRadius: '0.75rem',
                    fontWeight: 600,
                    fontSize: '1.125rem',
                    backgroundColor: 'var(--color-green-600)',
                    color: '#fff',
                    textDecoration: 'none',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-green-700)'
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-green-600)'
                    e.currentTarget.style.transform = 'scale(1)'
                  }}
                >
                  Entrar na Plataforma →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '1.5rem',
        textAlign: 'center',
        fontSize: '0.875rem',
        color: isDark ? 'var(--color-stone-500)' : 'var(--color-stone-600)',
      }}>
        © 2024 InsightPro Agrícola. Todos os direitos reservados.
      </footer>
    </div>
  )
}
