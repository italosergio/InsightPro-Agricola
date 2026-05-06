import { describe, it, expect, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { ThemeProvider } from '@/store/ThemeContext'
import { DataProvider } from '@/store/DataContext'
import { PageProvider } from '@/store/PageContext'
import { RelatoriosPage } from '@/pages/RelatoriosPage'
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
]

function renderRelatorios() {
  const { container } = render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <PageProvider>
              <RelatoriosPage />
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
  localDB.set(DB_KEYS.relatorios, []) // sem relatórios salvos
})

describe('Snapshot: RelatoriosPage', () => {
  it('S-5 estrutura da página de relatórios não mudou', () => {
    expect(renderRelatorios()).toMatchSnapshot()
  })
})
