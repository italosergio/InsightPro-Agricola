import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/store/AuthContext'

export function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (login(username, password)) {
      navigate('/')
    } else {
      setError('Usuario ou senha invalidos')
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <div className="logo-icon">IP</div>
          </div>
          <h1>InsightPro Agricola</h1>
          <p>Gestao inteligente de carteira de clientes</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="alert alert--error" role="alert">{error}</div>}

          <div className="form-group">
            <label htmlFor="username" className="form-label">Usuario</label>
            <input
              id="username"
              type="text"
              className="form-control"
              value={username}
              onChange={e => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">Senha</label>
            <input
              id="password"
              type="password"
              className="form-control"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          <button type="submit" className="btn btn--primary btn--lg btn--full-width">
            Entrar
          </button>
        </form>

        <div className="login-footer">
          <p>&copy; 2026 InsightPro Agricola. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  )
}
