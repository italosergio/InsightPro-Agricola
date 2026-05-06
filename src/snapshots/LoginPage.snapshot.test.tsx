import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { ThemeProvider } from '@/store/ThemeContext'
import { LoginPage } from '@/pages/LoginPage'

function renderLogin() {
  const { container } = render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
  return container
}

beforeEach(() => sessionStorage.clear())

describe('Snapshot: LoginPage', () => {
  it('S-1 estrutura do formulário de login não mudou', () => {
    expect(renderLogin()).toMatchSnapshot()
  })
})
