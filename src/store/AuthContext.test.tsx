import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider, useAuth } from './AuthContext'

function LoginButton() {
  const { isAuthenticated, login, logout } = useAuth()
  return (
    <div>
      <span data-testid="status">{isAuthenticated ? 'logado' : 'deslogado'}</span>
      <button onClick={() => login('admin', 'admin')}>login-ok</button>
      <button onClick={() => login('admin', 'errada')}>login-fail</button>
      <button onClick={logout}>logout</button>
    </div>
  )
}

function renderAuth() {
  return render(
    <AuthProvider>
      <LoginButton />
    </AuthProvider>
  )
}

beforeEach(() => {
  sessionStorage.clear()
})

describe('AuthContext', () => {
  it('3.1 login com credenciais corretas autentica', async () => {
    renderAuth()
    await userEvent.click(screen.getByText('login-ok'))
    expect(screen.getByTestId('status').textContent).toBe('logado')
  })

  it('3.2 login com senha errada não autentica', async () => {
    renderAuth()
    await userEvent.click(screen.getByText('login-fail'))
    expect(screen.getByTestId('status').textContent).toBe('deslogado')
  })

  it('3.4 após login isAuthenticated é true', async () => {
    renderAuth()
    await userEvent.click(screen.getByText('login-ok'))
    expect(screen.getByTestId('status').textContent).toBe('logado')
  })

  it('3.5 após logout isAuthenticated é false', async () => {
    renderAuth()
    await userEvent.click(screen.getByText('login-ok'))
    await userEvent.click(screen.getByText('logout'))
    expect(screen.getByTestId('status').textContent).toBe('deslogado')
  })

  it('3.6 login persiste no sessionStorage', async () => {
    renderAuth()
    await userEvent.click(screen.getByText('login-ok'))
    expect(sessionStorage.getItem('insightpro_auth')).toBe('true')
  })

  it('3.7 logout limpa o sessionStorage', async () => {
    renderAuth()
    await userEvent.click(screen.getByText('login-ok'))
    await userEvent.click(screen.getByText('logout'))
    expect(sessionStorage.getItem('insightpro_auth')).toBeNull()
  })

  it('3.8 useAuth fora do Provider lança erro', () => {
    const consoleError = console.error
    console.error = () => {}
    expect(() => render(<LoginButton />)).toThrow('useAuth must be used within an AuthProvider')
    console.error = consoleError
  })
})
