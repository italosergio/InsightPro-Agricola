import { Link } from 'react-router-dom'
import { useTheme } from '@/store/ThemeContext'

export function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-stone-950' : 'bg-stone-50'}`}>
      {/* Header com toggle tema */}
      <header className="absolute top-0 right-0 p-6">
        <button
          onClick={toggleTheme}
          className={`p-2 rounded-lg transition-colors ${
            isDark ? 'bg-stone-800 text-stone-200 hover:bg-stone-700' : 'bg-white text-stone-700 hover:bg-stone-100'
          }`}
          aria-label="Alternar tema"
        >
          {isDark ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-6">
        <div
          className="w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden"
          style={{
            backgroundImage: isDark
              ? 'url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80)'
              : 'url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className={`backdrop-blur-sm p-12 md:p-20 ${isDark ? 'bg-stone-950/80' : 'bg-white/85'}`}>
            <div className="max-w-2xl">
              <h1 className={`text-4xl md:text-6xl font-bold mb-6 ${isDark ? 'text-stone-50' : 'text-stone-900'}`}>
                InsightPro Agrícola
              </h1>
              <p className={`text-lg md:text-xl mb-8 ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                Plataforma completa de análise e gestão de clientes para o agronegócio. 
                Transforme dados em decisões estratégicas.
              </p>
              <div className="flex gap-4">
                <Link
                  to="/login"
                  className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                    isDark
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  Entrar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={`py-6 text-center text-sm ${isDark ? 'text-stone-500' : 'text-stone-600'}`}>
        © 2024 InsightPro Agrícola. Todos os direitos reservados.
      </footer>
    </div>
  )
}
