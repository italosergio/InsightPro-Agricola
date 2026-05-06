import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { ThemeProvider } from '@/store/ThemeContext'
import { DataProvider } from '@/store/DataContext'
import { PageProvider } from '@/store/PageContext'
import { HomePage } from '@/pages/HomePage'
import { localDB, DB_KEYS } from '@/lib/localDB'
import type { Cliente } from '@/types'

// Dados fixos para snapshot estável
const clientesFixos: Cliente[] = [
  {
    id: 'c1', nome: 'João Silva', cpf_cnpj: '529.982.247-25',
    telefone: '(11) 99999-9999', email: 'joao@email.com',
    cidade: 'São Paulo', estado: 'SP', cultura_principal: 'Soja',
    area_hectares: 100, faturamento_anual: 500000, potencial_compra: 50000,
    ultima_compra: '2024-01-01', status: 'ativo', produtos: {},
  },
  {
    id: 'c2', nome: 'Maria Santos', cpf_cnpj: '11.222.333/0001-81',
    telefone: '(21) 98888-8888', email: 'maria@email.com',
    cidade: 'Campinas', estado: 'SP', cultura_principal: 'Milho',
    area_hectares: 200, faturamento_anual: 800000, potencial_compra: 80000,
    ultima_compra: '2024-02-01', status: 'prospect', produtos: {},
  },
]

function renderHome() {
  const { container } = render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <PageProvider>
              <HomePage />
            </PageProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
  return container
}

beforeEach(() => {
  localStorage.clear()
  localDB.set(DB_KEYS.data, clientesFixos)
})

describe('Snapshot: HomePage', () => {
  it('S-4 estrutura da página de início não mudou', () => {
    expect(renderHome()).toMatchSnapshot()
  })
})
