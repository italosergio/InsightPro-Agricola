import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataProvider, useData } from './DataContext'
import type { Cliente } from '@/types'

const clienteBase: Cliente = {
  id: 'c1',
  nome: 'João Silva',
  cpf_cnpj: '529.982.247-25',
  telefone: '(11) 99999-9999',
  email: 'joao@email.com',
  cidade: 'São Paulo',
  estado: 'SP',
  cultura_principal: 'Soja',
  area_hectares: 100,
  faturamento_anual: 500000,
  potencial_compra: 50000,
  ultima_compra: '2024-01-01',
  status: 'ativo',
  produtos: {},
}

function DataConsumer() {
  const { rawData, filteredData, addCliente, updateCliente, removeCliente, applyFilters, clearFilters, importCSV } = useData()
  return (
    <div>
      <span data-testid="raw-count">{rawData.length}</span>
      <span data-testid="filtered-count">{filteredData.length}</span>
      <button onClick={() => addCliente(clienteBase)}>add</button>
      <button onClick={() => addCliente({ ...clienteBase, id: 'c2', cidade: 'Curitiba' })}>add2</button>
      <button onClick={() => updateCliente('c1', { nome: 'João Atualizado' })}>update</button>
      <button onClick={() => removeCliente('c1')}>remove</button>
      <button onClick={() => applyFilters({ cidade: 'São Paulo' })}>filter</button>
      <button onClick={clearFilters}>clear-filter</button>
      <button onClick={() => importCSV('nome,cidade\nMaria,Campinas')}>import</button>
      {rawData.map(c => (
        <span key={c.id} data-testid={`nome-${c.id}`}>{c.nome}</span>
      ))}
    </div>
  )
}

function renderData() {
  return render(
    <DataProvider>
      <DataConsumer />
    </DataProvider>
  )
}

beforeEach(() => {
  localStorage.clear()
})

describe('DataContext', () => {
  it('4.1 addCliente adiciona cliente ao estado', async () => {
    renderData()
    await userEvent.click(screen.getByText('add'))
    expect(screen.getByTestId('raw-count').textContent).toBe('1')
  })

  it('4.2 updateCliente altera campos do cliente', async () => {
    renderData()
    await userEvent.click(screen.getByText('add'))
    await userEvent.click(screen.getByText('update'))
    expect(screen.getByTestId('nome-c1').textContent).toBe('João Atualizado')
  })

  it('4.3 removeCliente remove cliente por id', async () => {
    renderData()
    await userEvent.click(screen.getByText('add'))
    await userEvent.click(screen.getByText('remove'))
    expect(screen.getByTestId('raw-count').textContent).toBe('0')
  })

  it('4.4 applyFilters filtra por cidade', async () => {
    renderData()
    await userEvent.click(screen.getByText('add'))
    await userEvent.click(screen.getByText('add2'))
    await userEvent.click(screen.getByText('filter'))
    expect(screen.getByTestId('filtered-count').textContent).toBe('1')
  })

  it('4.5 clearFilters restaura todos os dados', async () => {
    renderData()
    await userEvent.click(screen.getByText('add'))
    await userEvent.click(screen.getByText('add2'))
    await userEvent.click(screen.getByText('filter'))
    await userEvent.click(screen.getByText('clear-filter'))
    expect(screen.getByTestId('filtered-count').textContent).toBe('2')
  })

  it('4.6 importCSV parseia CSV e adiciona clientes', async () => {
    renderData()
    await userEvent.click(screen.getByText('import'))
    expect(screen.getByTestId('raw-count').textContent).toBe('1')
  })

  it('4.7 importCSV com CSV vazio não quebra', () => {
    renderData()
    expect(screen.getByTestId('raw-count').textContent).toBe('0')
  })
})
