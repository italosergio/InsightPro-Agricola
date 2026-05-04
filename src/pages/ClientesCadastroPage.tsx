import { useState, useRef, useMemo, useCallback } from 'react'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'
import { validarCPFouCNPJ, validarTelefone, validarEmail } from '@/lib/validators'
import { cidadesPorEstado } from '@/data/cidades'
import { localDB, DB_KEYS } from '@/lib/localDB'
import type { Cliente, ProdutoInfo } from '@/types'

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

type SortField = keyof Cliente
type SortDir = 'asc' | 'desc'

export function ClientesCadastroPage() {
  usePageTitle('Cadastro de Clientes')
  const { rawData, addCliente, updateCliente, removeCliente } = useData()
  const [form, setForm] = useState<Cliente>({ ...emptyForm })
  const [editId, setEditId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [highlightedId, setHighlightedId] = useState<string | null>(null)
  const [cityInput, setCityInput] = useState('')
  const [cityFocus, setCityFocus] = useState(false)
  const [cityIndex, setCityIndex] = useState(-1)
  const [sortField, setSortField] = useState<SortField>('nome')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const formRef = useRef<HTMLDivElement>(null)
  const tableRef = useRef<HTMLDivElement>(null)
  const cityRef = useRef<HTMLDivElement>(null)

  const cpfResult = form.cpf_cnpj ? validarCPFouCNPJ(form.cpf_cnpj) : null
  const telResult = form.telefone ? validarTelefone(form.telefone) : null
  const emailValido = form.email ? validarEmail(form.email) : true

  const cidadesSugeridas = useMemo(() => {
    if (!form.estado || !cityInput.trim()) return []
    const lista = cidadesPorEstado[form.estado] || []
    const termo = cityInput.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    return lista
      .filter(c => c.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(termo))
      .slice(0, 8)
  }, [form.estado, cityInput])

  const selectCity = useCallback((cidade: string) => {
    setForm(prev => ({ ...prev, cidade }))
    setCityInput(cidade)
    setCityFocus(false)
    setCityIndex(-1)
  }, [])

  const handleCityKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!cityFocus || cidadesSugeridas.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCityIndex(prev => Math.min(prev + 1, cidadesSugeridas.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCityIndex(prev => Math.max(prev - 1, -1))
    } else if (e.key === 'Enter' && cityIndex >= 0) {
      e.preventDefault()
      selectCity(cidadesSugeridas[cityIndex])
    } else if (e.key === 'Escape') {
      setCityFocus(false)
      setCityIndex(-1)
    }
  }

  const scrollToForm = () => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  const scrollToTable = () => tableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  const saveCliente = () => {
    if (!form.nome.trim()) return
    if (editId) {
      updateCliente(editId, form)
      setEditId(null)
    } else {
      const novoId = `client_${Date.now()}`
      addCliente({ ...form, id: novoId })
      setHighlightedId(novoId)
      setTimeout(() => setHighlightedId(null), 1200)
    }
    setForm({ ...emptyForm })
    setCityInput('')
    setCityFocus(false)
    setCityIndex(-1)
    if (!editId) {
      setTimeout(() => scrollToTable(), 100)
    }
    setEditId(null)
  }

  const editCliente = (c: Cliente) => {
    setForm({ ...c })
    setEditId(c.id)
    setCityInput(c.cidade || '')
    scrollToForm()
  }

  const doRemoveCliente = (id: string) => {
    removeCliente(id)
    setConfirmDelete(null)
    if (editId === id) {
      setEditId(null)
      setForm({ ...emptyForm })
      setCityInput('')
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const sortIcon = (field: SortField) => {
    if (sortField !== field) return ' ↕'
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  const sortedData = useMemo(() => {
    return [...rawData].sort((a, b) => {
      const aVal = a[sortField]
      const bVal = b[sortField]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })
  }, [rawData, sortField, sortDir])

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

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">CPF/CNPJ</label>
              <input
                className="form-control"
                value={form.cpf_cnpj}
                onChange={e => {
                  const v = e.target.value
                  setForm({ ...form, cpf_cnpj: v })
                }}
                onBlur={() => {
                  if (form.cpf_cnpj && cpfResult?.valido) {
                    setForm(prev => ({ ...prev, cpf_cnpj: cpfResult.formatado }))
                  }
                }}
                placeholder="000.000.000-00"
                style={{ paddingRight: 32 }}
              />
              {cpfResult && (
                <span className={`validation-indicator ${cpfResult.valido ? 'validation-indicator--valid' : 'validation-indicator--invalid'}`}>
                  {cpfResult.valido ? '✓' : '✕'}
                </span>
              )}
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">Telefone</label>
              <input
                className="form-control"
                value={form.telefone}
                onChange={e => setForm({ ...form, telefone: e.target.value })}
                onBlur={() => {
                  if (form.telefone && telResult?.valido) {
                    setForm(prev => ({ ...prev, telefone: telResult.formatado }))
                  }
                }}
                placeholder="(00) 00000-0000"
                style={{ paddingRight: 32 }}
              />
              {telResult && (
                <span className={`validation-indicator ${telResult.valido ? 'validation-indicator--valid' : 'validation-indicator--invalid'}`}>
                  {telResult.valido ? '✓' : '✕'}
                </span>
              )}
            </div>

            <div className="form-group" style={{ position: 'relative' }}>
              <label className="form-label">E-mail</label>
              <input
                className="form-control"
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="email@exemplo.com"
                style={{ paddingRight: 32 }}
              />
              {form.email && (
                <span className={`validation-indicator ${emailValido ? 'validation-indicator--valid' : 'validation-indicator--invalid'}`}>
                  {emailValido ? '✓' : '✕'}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Estado</label>
              <select
                className="form-control"
                value={form.estado}
                onChange={e => {
                  setForm(prev => ({ ...prev, estado: e.target.value, cidade: '' }))
                  setCityInput('')
                }}
              >
                <option value="">Selecione</option>
                {estados.map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>

            <div className="form-group" style={{ position: 'relative' }} ref={cityRef}>
              <label className="form-label">Cidade</label>
              <input
                className="form-control"
                value={cityInput}
                onChange={e => {
                  setCityInput(e.target.value)
                  setForm(prev => ({ ...prev, cidade: e.target.value }))
                  setCityIndex(-1)
                }}
                onFocus={() => { if (form.estado) setCityFocus(true) }}
                onBlur={() => {
                  setTimeout(() => { setCityFocus(false); setCityIndex(-1) }, 150)
                }}
                onKeyDown={handleCityKeyDown}
                placeholder={form.estado ? 'Digite a cidade...' : 'Selecione o estado primeiro'}
                disabled={!form.estado}
                autoComplete="off"
              />
              {cityFocus && form.estado && cidadesSugeridas.length > 0 && (
                <div className="city-autocomplete">
                  {cidadesSugeridas.map((cidade, i) => {
                    const idx = cidade.toLowerCase().indexOf(cityInput.toLowerCase())
                    return (
                      <div
                        key={cidade}
                        className={`city-autocomplete-item ${i === cityIndex ? 'city-autocomplete-item--active' : ''}`}
                        onMouseDown={e => { e.preventDefault(); selectCity(cidade) }}
                      >
                        {idx >= 0 ? <>
                          {cidade.slice(0, idx)}
                          <strong>{cidade.slice(idx, idx + cityInput.length)}</strong>
                          {cidade.slice(idx + cityInput.length)}
                        </> : cidade}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Cultura Principal</label>
              <select className="form-control" value={form.cultura_principal} onChange={e => setForm({ ...form, cultura_principal: e.target.value })}>
                <option value="">Selecione</option>
                {culturas.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Status</label>
              <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value as Cliente['status'] })}>
                {statusList.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
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

          <div style={{ marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-primary)' }}>
            <h3 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>Produtos Associados</h3>
            {Object.keys(form.produtos).length > 0 && (
              <div style={{ marginBottom: 'var(--space-3)', display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                {Object.entries(form.produtos).map(([key, p]) => (
                  <span key={key} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'var(--color-green-50)', border: '1px solid var(--color-green-200)',
                    borderRadius: 'var(--radius-sm)', padding: '4px 10px', fontSize: 'var(--text-sm)',
                  }}>
                    <strong>{p.nome}</strong>
                    <span style={{ color: 'var(--text-tertiary)' }}>x{p.quantidade} R${p.valor_total.toLocaleString('pt-BR')}</span>
                    <button
                      onClick={() => {
                        const next = { ...form.produtos }
                        delete next[key]
                        setForm({ ...form, produtos: next })
                      }}
                      style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, fontSize: 14, lineHeight: 1 }}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: 160, marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>Produto</label>
                <select
                  className="form-control"
                  onChange={e => {
                    const nome = e.target.value
                    if (!nome) return
                    setForm(prev => ({
                      ...prev,
                      produtos: {
                        ...prev.produtos,
                        [nome.toLowerCase().replace(/\s+/g, '_')]: { nome, quantidade: 1, valor_total: 0 },
                      },
                    }))
                    e.target.value = ''
                  }}
                  value=""
                >
                  <option value="">Selecionar produto...</option>
                  {localDB.list<{ id: string; nome: string }>(DB_KEYS.produtos).map(p => (
                    <option key={p.id} value={p.nome}>{p.nome}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
            <button className="btn btn--primary" onClick={saveCliente}>{editId ? 'Atualizar Cliente' : 'Salvar Cliente'}</button>
            <button className="btn btn--secondary" onClick={() => { setForm({ ...emptyForm }); setEditId(null); setCityInput('') }}>Limpar</button>
          </div>
        </div>
      </div>

      <div className="card" ref={tableRef}>
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="dash-section-title" style={{ marginBottom: 0 }}>Clientes Cadastrados</h2>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{rawData.length} clientes</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {sortedData.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum cliente cadastrado ainda.</h3>
              <p>Use o formulário acima para cadastrar o primeiro cliente.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>Nome{sortIcon('nome')}</th>
                    <th onClick={() => handleSort('cidade')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>Cidade/UF{sortIcon('cidade')}</th>
                    <th onClick={() => handleSort('cultura_principal')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>Cultura{sortIcon('cultura_principal')}</th>
                    <th onClick={() => handleSort('area_hectares')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>Área (ha){sortIcon('area_hectares')}</th>
                    <th onClick={() => handleSort('faturamento_anual')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>Faturamento{sortIcon('faturamento_anual')}</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedData.map(c => (
                    <tr key={c.id} className={highlightedId === c.id ? 'row-highlight' : ''}>
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
                          <button className="btn btn--ghost btn--sm" onClick={() => setConfirmDelete(c.id)} style={{ color: '#ef4444' }}>Remover</button>
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

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h3 style={{ margin: '0 0 var(--space-3)' }}>Confirmar exclusão</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button className="btn btn--secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn--danger" onClick={() => doRemoveCliente(confirmDelete)} style={{ background: '#ef4444', color: '#fff' }}>Remover</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
