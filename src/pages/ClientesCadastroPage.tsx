import { useState, useRef } from 'react'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'
import type { Cliente } from '@/types'

const estados = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']
const culturas = ['Soja', 'Milho', 'Café', 'Algodão', 'Cana-de-Açúcar', 'Uva', 'Manga', 'Tomate', 'Citros', 'Arroz', 'Feijão', 'Trigo', 'Dendê', 'Pecuária de Corte', 'Pecuária Leiteira', 'Fruticultura', 'Hortaliças', 'Reflorestamento']
const statusList = ['ativo', 'inativo', 'prospect']

const emptyForm: Cliente = {
  id: '',
  nome: '',
  cpf_cnpj: '',
  telefone: '',
  email: '',
  cidade: '',
  estado: '',
  cultura_principal: '',
  area_hectares: 0,
  faturamento_anual: 0,
  potencial_compra: 0,
  produtos: {},
  ultima_compra: '',
  status: 'ativo',
}

export function ClientesCadastroPage() {
  usePageTitle('Cadastro de Clientes')
  const { rawData, setRawData } = useData()
  const [form, setForm] = useState<Cliente>({ ...emptyForm })
  const [editId, setEditId] = useState<string | null>(null)
  const formRef = useRef<HTMLDivElement>(null)

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const saveClientes = (data: Cliente[]) => {
    setRawData(data)
  }

  const addCliente = () => {
    if (!form.nome.trim()) return
    if (editId) {
      saveClientes(rawData.map(c => c.id === editId ? { ...form, id: editId } : c))
      setEditId(null)
    } else {
      saveClientes([...rawData, { ...form, id: `client_${Date.now()}` }])
    }
    setForm({ ...emptyForm })
  }

  const editCliente = (c: Cliente) => {
    setForm({ ...c })
    setEditId(c.id)
  }

  const removeCliente = (id: string) => saveClientes(rawData.filter(c => c.id !== id))

  const fmt = (v: number) => {
    if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(1).replace('.', ',')} Bi`
    if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1).replace('.', ',')} Mi`
    return `R$ ${(v / 1e3).toFixed(0)}k`
  }

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--green" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <span className="page-hero-eyebrow">Cadastro</span>
            <h2 className="page-hero-title">Clientes</h2>
            <p className="page-hero-subtitle">Cadastre e gerencie os clientes da sua carteira agrícola</p>
            <button
              onClick={scrollToForm}
              style={{
                whiteSpace: 'nowrap',
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.9)',
                padding: 0,
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              + Adicionar Cliente
            </button>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{rawData.length}</span>
              <span className="page-hero-kpi-label">Cadastrados</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }} ref={formRef}>
        <div className="card-header">
          <h2 className="dash-section-title">{editId ? 'Editar Cliente' : 'Novo Cliente'}</h2>
        </div>
        <div className="card-body">
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label">Nome *</label>
              <input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Razão social ou nome" />
            </div>
            <div className="form-group">
              <label className="form-label">CPF/CNPJ</label>
              <input className="form-control" value={form.cpf_cnpj} onChange={e => setForm({ ...form, cpf_cnpj: e.target.value })} placeholder="000.000.000-00" />
            </div>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Cliente['status'] })}>
                {statusList.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Telefone</label>
              <input className="form-control" value={form.telefone} onChange={e => setForm({ ...form, telefone: e.target.value })} placeholder="(00) 00000-0000" />
            </div>
            <div className="form-group">
              <label className="form-label">E-mail</label>
              <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@exemplo.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Cidade</label>
              <input className="form-control" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} placeholder="Cidade" />
            </div>
            <div className="form-group">
              <label className="form-label">Estado</label>
              <select className="form-control" value={form.estado} onChange={e => setForm({ ...form, estado: e.target.value })}>
                <option value="">Selecione</option>
                {estados.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Cultura Principal</label>
              <select className="form-control" value={form.cultura_principal} onChange={e => setForm({ ...form, cultura_principal: e.target.value })}>
                <option value="">Selecione</option>
                {culturas.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Área (hectares)</label>
              <input className="form-control" type="number" value={form.area_hectares || ''} onChange={e => setForm({ ...form, area_hectares: Number(e.target.value) })} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Faturamento Anual (R$)</label>
              <input className="form-control" type="number" value={form.faturamento_anual || ''} onChange={e => setForm({ ...form, faturamento_anual: Number(e.target.value) })} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Potencial de Compra (R$)</label>
              <input className="form-control" type="number" value={form.potencial_compra || ''} onChange={e => setForm({ ...form, potencial_compra: Number(e.target.value) })} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Última Compra</label>
              <input className="form-control" type="date" value={form.ultima_compra} onChange={e => setForm({ ...form, ultima_compra: e.target.value })} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <button className="btn btn--primary" onClick={addCliente}>{editId ? 'Atualizar Cliente' : 'Salvar Cliente'}</button>
            <button className="btn btn--secondary" onClick={() => { setForm({ ...emptyForm }); setEditId(null) }}>Limpar</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="dash-section-title" style={{ marginBottom: 0 }}>Clientes Cadastrados</h2>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{rawData.length} clientes</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {rawData.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum cliente cadastrado ainda.</h3>
              <p>Use o formulário acima para cadastrar o primeiro cliente.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Cidade/UF</th>
                    <th>Cultura</th>
                    <th>Área (ha)</th>
                    <th>Faturamento</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {rawData.map(c => (
                    <tr key={c.id}>
                      <td>
                        <strong>{c.nome}</strong>
                        {c.telefone && <br />}
                        {c.telefone && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{c.telefone}</span>}
                      </td>
                      <td>{c.cidade}{c.estado ? `/${c.estado}` : ''}</td>
                      <td>{c.cultura_principal || 'N/A'}</td>
                      <td>{c.area_hectares.toLocaleString('pt-BR')}</td>
                      <td>{fmt(c.faturamento_anual)}</td>
                      <td>
                        <span className={`badge ${c.status === 'ativo' ? 'badge--success' : c.status === 'prospect' ? 'badge--info' : 'badge--error'}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 4 }}>
                          <button className="btn btn--ghost btn--sm" onClick={() => editCliente(c)} style={{ color: '#3b82f6' }}>Editar</button>
                          <button className="btn btn--ghost btn--sm" onClick={() => removeCliente(c.id)} style={{ color: '#ef4444' }}>Remover</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
