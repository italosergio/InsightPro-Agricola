import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { ThemeProvider } from '@/store/ThemeContext'
import { DataProvider } from '@/store/DataContext'
import { PageProvider } from '@/store/PageContext'
import { localDB, DB_KEYS } from '@/lib/localDB'
import type { Cliente } from '@/types'

// Páginas
import { HomePage } from '@/pages/HomePage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ClientesPage } from '@/pages/ClientesPage'
import { ClientesCadastroPage } from '@/pages/ClientesCadastroPage'
import { AnaliseABCPage } from '@/pages/AnaliseABCPage'
import { PenetracaoPage } from '@/pages/PenetracaoPage'
import { CulturaPage } from '@/pages/CulturaPage'
import { OportunidadesPage } from '@/pages/OportunidadesPage'
import { TerritorialPage } from '@/pages/TerritorialPage'
import { GapsPage } from '@/pages/GapsPage'
import { FidelizacaoPage } from '@/pages/FidelizacaoPage'
import { SWOTPage } from '@/pages/SWOTPage'
import { GUTPage } from '@/pages/GUTPage'
import { PESTPage } from '@/pages/PESTPage'
import { MetasPage } from '@/pages/MetasPage'
import { CampanhasPage } from '@/pages/CampanhasPage'
import { PipelinePage } from '@/pages/PipelinePage'
import { RelatoriosPage } from '@/pages/RelatoriosPage'
import { ExportarPage } from '@/pages/ExportarPage'
import { ProdutosPage } from '@/pages/ProdutosPage'

const clientesMock: Cliente[] = [
  {
    id: 'c1', nome: 'João Silva', cpf_cnpj: '529.982.247-25',
    telefone: '(11) 99999-9999', email: 'joao@email.com',
    cidade: 'São Paulo', estado: 'SP', cultura_principal: 'Soja',
    area_hectares: 100, faturamento_anual: 500000, potencial_compra: 50000,
    ultima_compra: '2024-01-01', status: 'ativo', produtos: {},
  },
]

function renderPage(Component: React.ComponentType) {
  return render(
    <MemoryRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <PageProvider>
              <Component />
            </PageProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  localDB.set(DB_KEYS.data, clientesMock)
})

describe('Smoke Test: Todas as rotas renderizam sem erro', () => {
  it('1.1 /inicio renderiza', () => {
    const { container } = renderPage(HomePage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.2 /dashboard renderiza', () => {
    const { container } = renderPage(DashboardPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.3 /clientes renderiza', () => {
    renderPage(ClientesPage)
    expect(screen.getByText(/João Silva/i)).toBeInTheDocument()
  })

  it('1.4 /cadastro-clientes renderiza', () => {
    const { container } = renderPage(ClientesCadastroPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.5 /analise-abc renderiza', () => {
    const { container } = renderPage(AnaliseABCPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.6 /penetracao renderiza', () => {
    const { container } = renderPage(PenetracaoPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.7 /cultura renderiza', () => {
    const { container } = renderPage(CulturaPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.8 /oportunidades renderiza', () => {
    const { container } = renderPage(OportunidadesPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.9 /territorial renderiza', () => {
    const { container } = renderPage(TerritorialPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.10 /gaps renderiza', () => {
    const { container } = renderPage(GapsPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.11 /fidelizacao renderiza', () => {
    const { container } = renderPage(FidelizacaoPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.12 /swot renderiza', () => {
    const { container } = renderPage(SWOTPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.13 /gut renderiza', () => {
    const { container } = renderPage(GUTPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.14 /pest renderiza', () => {
    const { container } = renderPage(PESTPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.15 /metas renderiza', () => {
    const { container } = renderPage(MetasPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.16 /campanhas renderiza', () => {
    const { container } = renderPage(CampanhasPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.17 /pipeline renderiza', () => {
    const { container } = renderPage(PipelinePage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.18 /relatorios renderiza', () => {
    const { container } = renderPage(RelatoriosPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.19 /exportar renderiza', () => {
    const { container } = renderPage(ExportarPage)
    expect(container.firstChild).toBeTruthy()
  })

  it('1.20 /produtos renderiza', () => {
    const { container } = renderPage(ProdutosPage)
    expect(container.firstChild).toBeTruthy()
  })
})
