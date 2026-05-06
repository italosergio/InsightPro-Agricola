import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { ThemeProvider } from '@/store/ThemeContext'
import { PageProvider } from '@/store/PageContext'
import { AppLayout } from '@/components/layout/AppLayout'

function renderLayout() {
  const { container } = render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <PageProvider>
            <AppLayout title="Dashboard" subtitle="Visão geral">
              <span>conteúdo</span>
            </AppLayout>
          </PageProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
  return container
}

describe('Snapshot: DashboardLayout', () => {
  it('S-3 estrutura do layout principal (sidebar + header) não mudou', () => {
    expect(renderLayout()).toMatchSnapshot()
  })
})
