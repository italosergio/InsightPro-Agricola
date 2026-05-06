import { Link } from 'react-router-dom'
import { useTheme } from '@/store/ThemeContext'

export function LandingPage() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className={`min-h-screen flex flex-col ${isDark ? 'bg-stone-950' : 'bg-stone-50'}`}>
      {/* Header com toggle tema */}
      <header className="absolute top-0 right-0 p-6 z-10">
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-lg transition-colors shadow-lg ${
            isDark ? 'bg-stone-800 text-stone-200 hover:bg-stone-700' : 'bg-white text-stone-700 hover:bg-stone-100'
          }`}
          aria-label="Alternar tema"
        >
          {isDark ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )}
        </button>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-6xl">
          <div
            className="relative rounded-3xl shadow-2xl overflow-hidden"
            style={{
              backgroundImage: isDark
                ? 'linear-gradient(rgba(12, 10, 9, 0.85), rgba(12, 10, 9, 0.85)), url(https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1200&q=80)'
                : 'linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)), url(https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=1200&q=80)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: '500px',
            }}
          >
            <div className="relative z-10 p-8 md:p-16 lg:p-20">
              <div className="max-w-2xl">
                <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold mb-6 ${isDark ? 'text-stone-50' : 'text-stone-900'}`}>
                  InsightPro<br />Agrícola
                </h1>
                <p className={`text-xl md:text-2xl mb-8 leading-relaxed ${isDark ? 'text-stone-300' : 'text-stone-700'}`}>
                  Plataforma completa de análise e gestão de clientes para o agronegócio. 
                  Transforme dados em decisões estratégicas.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl bg-green-600 text-white hover:bg-green-700 transform hover:scale-105"
                  >
                    Entrar na Plataforma
                    <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>
                </div>
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
