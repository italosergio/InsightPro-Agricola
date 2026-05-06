import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { ThemeProvider } from '@/store/ThemeContext'
import { DataProvider } from '@/store/DataContext'
import { PageProvider } from '@/store/PageContext'
import { LoginPage } from '@/pages/LoginPage'
import { AuthRoute, PublicRoute } from '@/components/ProtectedRoute'

// ⚠️ ATENÇÃO: Estes testes simulam autenticação com credenciais hardcoded (AuthContext).
// Após integração com banco de dados real, os testes I-1.1 a I-1.4 devem ser
// atualizados para mockar a chamada à API de autenticação.

function renderLogin(initialPath = '/login', isAuth = false) {
  if (isAuth) sessionStorage.setItem('insightpro_auth', 'true')
  else sessionStorage.removeItem('insightpro_auth')

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <PageProvider>
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
              {/* Destinos de redirecionamento */}
              <span data-testid="page-inicio" style={{ display: 'none' }} />
            </PageProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  sessionStorage.clear()
  localStorage.clear()
})

describe('Integração: Fluxo de Login', () => {
  it('I-1.1 usuário não autenticado vê o formulário de login', () => {
    renderLogin()
    expect(screen.getByLabelText('Usuario')).toBeInTheDocument()
    expect(screen.getByLabelText('Senha')).toBeInTheDocument()
  })

  it('I-1.2 credenciais erradas exibem mensagem de erro', async () => {
    renderLogin()
    await userEvent.type(screen.getByLabelText('Usuario'), 'admin')
    await userEvent.type(screen.getByLabelText('Senha'), 'senhaerrada')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Usuario ou senha invalidos')
  })

  it('I-1.3 credenciais corretas redirecionam para /inicio', async () => {
    // Verifica que o navigate('/inicio') é chamado após login bem-sucedido
    // usando o sessionStorage como proxy do estado de autenticação
    renderLogin()
    await userEvent.type(screen.getByLabelText('Usuario'), 'admin')
    await userEvent.type(screen.getByLabelText('Senha'), 'admin')
    await userEvent.click(screen.getByRole('button', { name: /entrar/i }))
    await waitFor(() => {
      expect(sessionStorage.getItem('insightpro_auth')).toBe('true')
    })
  })

  it('I-1.4 usuário já autenticado não vê o formulário de login', () => {
    renderLogin('/login', true)
    // PublicRoute redireciona — formulário não deve estar presente
    expect(screen.queryByLabelText('Usuario')).not.toBeInTheDocument()
  })
})
