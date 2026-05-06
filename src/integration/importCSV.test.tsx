import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { DataProvider, useData } from '@/store/DataContext'
import { ClientesPage } from '@/pages/ClientesPage'
import { localDB, DB_KEYS } from '@/lib/localDB'
import type { Cliente } from '@/types'

// ⚠️ ATENÇÃO: Estes testes simulam importação de CSV com dados em memória/localStorage.
// Após integração com banco de dados real, os testes I-3.1 a I-3.3 devem ser
// atualizados para mockar o endpoint de importação e verificar persistência via API.

const CSV_VALIDO = `nome,cidade,estado,cultura_principal,area_hectares,faturamento_anual,potencial_compra,status
João Silva,São Paulo,SP,Soja,100,500000,50000,ativo
Maria Santos,Campinas,SP,Milho,200,800000,80000,prospect`

const CSV_COLUNAS_FALTANDO = `nome,cidade
Carlos Souza,Curitiba`

function ImportTrigger() {
  const { importCSV, rawData } = useData()
  return (
    <div>
      <span data-testid="count">{rawData.length}</span>
      <button onClick={() => importCSV(CSV_VALIDO)}>importar-valido</button>
      <button onClick={() => importCSV(CSV_COLUNAS_FALTANDO)}>importar-incompleto</button>
      <button onClick={() => importCSV('')}>importar-vazio</button>
    </div>
  )
}

function renderImport() {
  return render(
    <MemoryRouter>
      <DataProvider>
        <ImportTrigger />
        <ClientesPage />
      </DataProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('Integração: Importação CSV', () => {
  it('I-3.1 importa CSV válido → clientes aparecem na listagem', async () => {
    renderImport()
    await userEvent.click(screen.getByText('importar-valido'))
    await waitFor(() => {
      expect(screen.getByText('João Silva')).toBeInTheDocument()
      expect(screen.getByText('Maria Santos')).toBeInTheDocument()
    })
  })

  it('I-3.2 dados importados persistem no localStorage', async () => {
    renderImport()
    await userEvent.click(screen.getByText('importar-valido'))
    await waitFor(() => {
      const clientes = localDB.list<Cliente>(DB_KEYS.data)
      expect(clientes).toHaveLength(2)
      expect(clientes[0].nome).toBe('João Silva')
    })
  })

  it('I-3.3 CSV com colunas faltando não quebra e preenche com defaults', async () => {
    renderImport()
    await userEvent.click(screen.getByText('importar-incompleto'))
    await waitFor(() => {
      const clientes = localDB.list<Cliente>(DB_KEYS.data)
      expect(clientes).toHaveLength(1)
      expect(clientes[0].nome).toBe('Carlos Souza')
      expect(clientes[0].faturamento_anual).toBe(0) // default numérico
      expect(clientes[0].status).toBe('ativo')       // default de status
    })
  })
})
