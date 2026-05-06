import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { DataProvider } from '@/store/DataContext'
import { ClientesCadastroPage } from '@/pages/ClientesCadastroPage'
import { localDB, DB_KEYS } from '@/lib/localDB'
import type { Cliente } from '@/types'

// ⚠️ ATENÇÃO: Estes testes usam localStorage como persistência.
// Após integração com banco de dados real, os testes I-2.1 a I-2.5 devem ser
// atualizados para mockar os endpoints CRUD: POST, PUT, DELETE /api/clientes.

function renderCadastro() {
  return render(
    <MemoryRouter>
      <DataProvider>
        <ClientesCadastroPage />
      </DataProvider>
    </MemoryRouter>
  )
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
})

describe('Integração: Cadastro de Cliente', () => {
  it('I-2.1 preenche formulário válido e salva → cliente aparece na tabela', async () => {
    renderCadastro()

    await userEvent.type(screen.getByLabelText('Nome *'), 'João Silva')
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'SP')
    await userEvent.selectOptions(screen.getByLabelText('Cultura Principal'), 'Soja')

    await userEvent.click(screen.getByRole('button', { name: /salvar cliente/i }))

    expect(await screen.findByText('João Silva')).toBeInTheDocument()
  })

  it('I-2.2 cliente salvo persiste no localStorage', async () => {
    renderCadastro()

    await userEvent.type(screen.getByLabelText('Nome *'), 'Maria Santos')
    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'SP')
    await userEvent.selectOptions(screen.getByLabelText('Cultura Principal'), 'Milho')

    await userEvent.click(screen.getByRole('button', { name: /salvar cliente/i }))

    await waitFor(() => {
      const clientes = localDB.list<Cliente>(DB_KEYS.data)
      expect(clientes).toHaveLength(1)
      expect(clientes[0].nome).toBe('Maria Santos')
    })
  })

  it('I-2.3 edita cliente existente → tabela atualiza', async () => {
    localDB.add<Cliente>(DB_KEYS.data, {
      id: 'c1', nome: 'Pedro Costa', cpf_cnpj: '', telefone: '',
      email: '', cidade: 'São Paulo', estado: 'SP', cultura_principal: 'Café',
      area_hectares: 50, faturamento_anual: 100000, potencial_compra: 20000,
      ultima_compra: '', status: 'ativo', produtos: {},
    })

    renderCadastro()

    await userEvent.click(screen.getByRole('button', { name: 'Editar Pedro Costa' }))

    const nomeInput = screen.getByLabelText('Nome *')
    await userEvent.clear(nomeInput)
    await userEvent.type(nomeInput, 'Pedro Costa Atualizado')

    await userEvent.click(screen.getByRole('button', { name: /atualizar cliente/i }))

    expect(await screen.findByText('Pedro Costa Atualizado')).toBeInTheDocument()
    expect(screen.queryByText('Pedro Costa')).not.toBeInTheDocument()
  })

  it('I-2.4 exclui cliente → some da tabela', async () => {
    localDB.add<Cliente>(DB_KEYS.data, {
      id: 'c2', nome: 'Ana Lima', cpf_cnpj: '', telefone: '',
      email: '', cidade: 'Rio de Janeiro', estado: 'RJ', cultura_principal: 'Cana-de-Açúcar',
      area_hectares: 100, faturamento_anual: 200000, potencial_compra: 40000,
      ultima_compra: '', status: 'ativo', produtos: {},
    })

    renderCadastro()

    expect(screen.getByText('Ana Lima')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Remover Ana Lima' }))

    const confirmButton = await screen.findByRole('button', { name: 'Confirmar exclusão' })
    await userEvent.click(confirmButton)

    await waitFor(() => {
      expect(screen.queryByText('Ana Lima')).not.toBeInTheDocument()
    })
  })

  it('I-2.5 CPF inválido exibe indicador de erro no campo', async () => {
    renderCadastro()

    await userEvent.type(screen.getByLabelText('CPF/CNPJ'), '000.000.000-00')
    // Dispara o blur para acionar a validação
    await userEvent.tab()

    await waitFor(() => {
      expect(screen.getByText('✕')).toBeInTheDocument()
    })
  })
})
