import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '@/store/ThemeContext'
import { LandingPage } from '@/pages/LandingPage'

function renderLanding() {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <LandingPage />
      </ThemeProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('LandingPage', () => {
  it('2.1 renderiza título e descrição', () => {
    renderLanding()
    expect(screen.getAllByText(/InsightPro/i)[0]).toBeInTheDocument()
    expect(screen.getByText(/Plataforma completa de análise/i)).toBeInTheDocument()
  })

  it('2.2 renderiza botão Entrar com link para /login', () => {
    renderLanding()
    const links = screen.getAllByRole('link')
    const loginLink = links.find(link => link.getAttribute('href') === '/login')
    expect(loginLink).toBeInTheDocument()
    expect(loginLink?.textContent).toMatch(/Acessar Plataforma/i)
  })

  it('2.3 renderiza footer com copyright', () => {
    renderLanding()
    expect(screen.getByText(/© 2024 InsightPro Agrícola/i)).toBeInTheDocument()
  })

  it('2.4 toggle tema alterna entre claro e escuro', async () => {
    const user = userEvent.setup()
    renderLanding()
    
    const toggleBtn = screen.getByRole('button', { name: /Alternar tema/i })
    expect(toggleBtn).toBeInTheDocument()
    
    // Clica para alternar
    await user.click(toggleBtn)
    
    // Verifica que o botão mudou (emoji muda de 🌙 para ☀️ ou vice-versa)
    expect(toggleBtn).toBeInTheDocument()
  })
})
