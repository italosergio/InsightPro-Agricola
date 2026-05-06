import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { AuthRoute, PublicRoute } from '@/components/ProtectedRoute'

function renderRoutes(isAuth: boolean) {
  if (isAuth) sessionStorage.setItem('insightpro_auth', 'true')
  else sessionStorage.removeItem('insightpro_auth')

  const { container } = render(
    <MemoryRouter initialEntries={['/']}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={
            <AuthRoute><span>área protegida</span></AuthRoute>
          } />
          <Route path="/login" element={<span>login</span>} />
          <Route path="/inicio" element={
            <PublicRoute><span>página pública</span></PublicRoute>
          } />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  )
  return container
}

beforeEach(() => sessionStorage.clear())

describe('Snapshot: ProtectedRoute', () => {
  it('S-2a AuthRoute sem autenticação redireciona para /login', () => {
    expect(renderRoutes(false)).toMatchSnapshot()
  })

  it('S-2b AuthRoute com autenticação renderiza conteúdo', () => {
    expect(renderRoutes(true)).toMatchSnapshot()
  })
})
