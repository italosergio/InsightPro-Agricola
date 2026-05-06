import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { AuthRoute, PublicRoute } from './ProtectedRoute'

function renderWithAuth(isAuth: boolean, element: React.ReactNode) {
  // Pré-popula sessionStorage para simular estado de autenticação
  if (isAuth) {
    sessionStorage.setItem('insightpro_auth', 'true')
  } else {
    sessionStorage.removeItem('insightpro_auth')
  }

  return render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={element} />
          <Route path="/login" element={<span>página login</span>} />
          <Route path="/inicio" element={<span>página inicio</span>} />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
}

describe('AuthRoute', () => {
  it('5.1 redireciona para /login sem autenticação', () => {
    renderWithAuth(false, <AuthRoute><span>conteúdo protegido</span></AuthRoute>)
    expect(screen.getByText('página login')).toBeInTheDocument()
    expect(screen.queryByText('conteúdo protegido')).not.toBeInTheDocument()
  })

  it('5.2 renderiza filho com autenticação', () => {
    renderWithAuth(true, <AuthRoute><span>conteúdo protegido</span></AuthRoute>)
    expect(screen.getByText('conteúdo protegido')).toBeInTheDocument()
  })
})

describe('PublicRoute', () => {
  it('5.3 redireciona para /inicio quando já autenticado', () => {
    renderWithAuth(true, <PublicRoute><span>página login</span></PublicRoute>)
    expect(screen.getByText('página inicio')).toBeInTheDocument()
  })

  it('5.4 renderiza filho quando não autenticado', () => {
    renderWithAuth(false, <PublicRoute><span>formulário login</span></PublicRoute>)
    expect(screen.getByText('formulário login')).toBeInTheDocument()
  })
})
