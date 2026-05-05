import { useState, useMemo } from 'react'
import { usePageTitle } from '@/hooks/useTheme'
import { useData } from '@/store/DataContext'
import { useTheme } from '@/store/ThemeContext'
import { localDB, DB_KEYS } from '@/lib/localDB'
import { DownloadReportButton } from '@/lib/downloadUtils'
import Highcharts from 'highcharts'
import { LazyChart } from '@/components/LazyChart'

interface ProdutoCadastro {
  id: string
  nome: string
  fornecedor: string
  custo: number
  categoria: string
  cultura: string
  modoAcao: string
  ingredienteAtivo: string
  finalidade: string
  tipoAplicacao: string
  doseRecomendada: string
  intervalo: string
  epocaAplicacao: string
  compatibilidade: string
  restricoes: string
  observacoes: string
}

const categorias = ['Fungicida', 'Inseticida', 'Herbicida', 'Adjuvante', 'Fertilizante Foliar', 'Bioestimulante', 'Regulador de Crescimento', 'Outros']
const culturas = ['Uva', 'Manga', 'Soja', 'Milho', 'Café', 'Algodão', 'Cana-de-Açúcar', 'Tomate', 'Citros', 'Arroz', 'Feijão', 'Trigo', 'Dendê', 'Pecuária']

type SortField = keyof ProdutoCadastro | 'penetracao'
type SortDir = 'asc' | 'desc'

const emptyForm: ProdutoCadastro = {
  id: '',
  nome: '',
  fornecedor: '',
  custo: 0,
  categoria: '',
  cultura: '',
  modoAcao: '',
  ingredienteAtivo: '',
  finalidade: '',
  tipoAplicacao: '',
  doseRecomendada: '',
  intervalo: '',
  epocaAplicacao: '',
  compatibilidade: '',
  restricoes: '',
  observacoes: '',
}

export function ProdutosPage() {
  usePageTitle('Produtos')
  const { rawData } = useData()
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const [produtos, setProdutos] = useState<ProdutoCadastro[]>(() => {
    return localDB.list<ProdutoCadastro>(DB_KEYS.produtos)
  })
  const [editando, setEditando] = useState<string | null>(null)
  const [form, setForm] = useState<ProdutoCadastro>({ ...emptyForm })
  const [mostrarForm, setMostrarForm] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>('nome')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

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

  const penetracaoData = useMemo(() => {
    const map: Record<string, number> = {}
    produtos.forEach(p => {
      let count = 0
      rawData.forEach(c => {
        if (c.produtos[p.nome.toLowerCase().replace(/\s+/g, '_')]) count++
      })
      if (count > 0) map[p.nome] = count
    })
    const entries = Object.entries(map).sort(([,a], [,b]) => b - a)
    const total = entries.reduce((s, [,c]) => s + c, 0)
    return entries.map(([nome, count]) => ({
      nome,
      count,
      pct: total > 0 ? ((count / total) * 100).toFixed(0) : '0',
    }))
  }, [produtos, rawData])

  const sortedProdutos = useMemo(() => {
    if (sortField === 'penetracao') {
      return [...produtos].sort((a, b) => {
        const ca = penetracaoData.find(d => d.nome === a.nome)?.count ?? 0
        const cb = penetracaoData.find(d => d.nome === b.nome)?.count ?? 0
        return sortDir === 'asc' ? ca - cb : cb - ca
      })
    }
    return [...produtos].sort((a, b) => {
      const aVal = a[sortField as keyof ProdutoCadastro]
      const bVal = b[sortField as keyof ProdutoCadastro]
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      return 0
    })
  }, [produtos, sortField, sortDir, penetracaoData])

  const downloadData = useMemo(() => {
    return sortedProdutos.map(p => ({
      nome: p.nome,
      fornecedor: p.fornecedor,
      custo: p.custo,
      categoria: p.categoria,
      cultura: p.cultura,
      modo_acao: p.modoAcao,
      ingrediente_ativo: p.ingredienteAtivo,
      dose_recomendada: p.doseRecomendada,
    }))
  }, [sortedProdutos])

  const penetracaoChartOpts = useMemo<Highcharts.Options>(() => ({
    chart: { type: 'bar', height: Math.max(200, penetracaoData.length * 40), backgroundColor: 'transparent', style: { fontFamily: 'Inter, system-ui, sans-serif' }, spacing: [4, 4, 4, 4] },
    title: { text: undefined },
    xAxis: { categories: penetracaoData.map(d => d.nome), labels: { style: { color: isDark ? '#8fad9a' : '#57534e', fontSize: '11px' } }, lineColor: isDark ? '#1a2e20' : '#e7e5e4', tickColor: 'transparent', gridLineColor: isDark ? '#1a2e20' : '#f5f5f4' },
    yAxis: { title: { text: undefined }, labels: { format: '{value}%', style: { color: isDark ? '#5a7a66' : '#78716c', fontSize: '10px' } }, gridLineColor: isDark ? '#1a2e20' : '#f5f5f4' },
    tooltip: { pointFormat: '<b>{point.y}%</b> de penetração<br/>({point.clientes} cliente(s))' },
    plotOptions: { bar: { borderRadius: 5, borderWidth: 0, dataLabels: { enabled: true, format: '{y}%', style: { fontSize: '10px', fontWeight: '600', textOutline: 'none' }, color: isDark ? '#d6d3d1' : '#57534e' } } },
    colors: ['#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#047857', '#065f46', '#059669', '#10b981'],
    series: [{ type: 'bar', name: 'Penetração (%)', data: penetracaoData.map(d => ({ y: Number(d.pct), clientes: d.count })), showInLegend: false }],
    credits: { enabled: false },
  }), [penetracaoData, isDark])

  const refresh = () => {
    setProdutos(localDB.list<ProdutoCadastro>(DB_KEYS.produtos))
  }

  const saveProdutos = (data: ProdutoCadastro[]) => {
    localDB.set(DB_KEYS.produtos, data)
    refresh()
  }

  const startEdit = (p: ProdutoCadastro) => {
    setForm({ ...p })
    setEditando(p.id)
    setMostrarForm(false)
    setTimeout(() => {
      document.getElementById('form-produto')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  const saveEdit = () => {
    if (!form.nome.trim()) return
    saveProdutos(produtos.map(p => p.id === editando ? { ...form, id: editando } : p))
    setEditando(null)
    setForm({ ...emptyForm })
  }

  const removeProduto = (id: string) => {
    saveProdutos(produtos.filter(p => p.id !== id))
    if (editando === id) {
      setEditando(null)
      setForm({ ...emptyForm })
    }
    setConfirmDelete(null)
  }

  const addProduto = () => {
    if (!form.nome.trim() || !form.fornecedor.trim()) return
    saveProdutos([...produtos, { ...form, id: `prod_${Date.now()}` }])
    setForm({ ...emptyForm })
    setMostrarForm(false)
  }

  const cancelEdit = () => {
    setEditando(null)
    setForm({ ...emptyForm })
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--teal" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <span className="page-hero-eyebrow">Cadastro de Produtos</span>
            <h2 className="page-hero-title">Produtos Agrícolas</h2>
            <p className="page-hero-subtitle">Cadastre e gerencie produtos para culturas como Uva, Manga e outras</p>
            <button
              onClick={() => { setMostrarForm(!mostrarForm); setEditando(null); setForm({ ...emptyForm }) }}
              style={{
                whiteSpace: 'nowrap',
                color: 'rgba(255,255,255,0.9)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                textDecoration: 'underline',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              + Adicionar Produto
            </button>
            <br />
            <DownloadReportButton data={downloadData} filename="produtos.csv" />
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{produtos.length}</span>
              <span className="page-hero-kpi-label">Cadastrados</span>
            </div>
          </div>
        </div>
      </div>

      <div className="penetration-bar-wrap">
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: 'var(--space-2)' }}>Penetração</div>
        <div className="desktop-only penetration-bar">
          {penetracaoData.map((item, i) => {
            const colors = ['#16a34a','#2563eb','#d97706','#dc2626','#8b5cf6','#059669','#0d9488','#ea580c','#4f46e5','#be185d','#b45309','#0e7490']
            return (
              <div
                key={item.nome}
                className="penetration-bar-seg"
                style={{ flex: item.count || 0.01, background: colors[i % colors.length], position: 'relative' }}
                title={`${item.nome}: ${item.count} cliente${item.count !== 1 ? 's' : ''} (${item.pct}%)`}
              >
                <span style={{ fontSize: Math.max(7, Math.min(12, 5 + Number(item.pct) * 0.35)), lineHeight: 1.1 }}>{item.nome} {item.pct}%</span>
              </div>
            )
          })}
        </div>
        <div className="mobile-only card" style={{ marginBottom: 0 }}>
          <div className="card-body" style={{ padding: 'var(--space-2)' }}>
            <LazyChart options={penetracaoChartOpts} height={Math.max(200, penetracaoData.length * 40)} />
          </div>
        </div>
      </div>

      {mostrarForm && !editando && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }} id="form-produto">
          <div className="card-header">
            <h2 className="dash-section-title">Novo Produto</h2>
          </div>
          <div className="card-body">
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label">Nome do Produto *</label>
                <input className="form-control" value={form.nome || ''} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Mancozeb 800 WP" />
              </div>
              <div className="form-group">
                <label className="form-label">Fornecedor/Marca *</label>
                <input className="form-control" value={form.fornecedor || ''} onChange={e => setForm({ ...form, fornecedor: e.target.value })} placeholder="Ex: Bayer, Syngenta" />
              </div>
              <div className="form-group">
                <label className="form-label">Custo (R$/L ou R$/kg)</label>
                <input className="form-control" type="number" value={form.custo || ''} onChange={e => setForm({ ...form, custo: Number(e.target.value) })} placeholder="45.50" />
              </div>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select className="form-control" value={form.categoria || ''} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  <option value="">Selecione</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cultura Aplicada</label>
                <select className="form-control" value={form.cultura || ''} onChange={e => setForm({ ...form, cultura: e.target.value })}>
                  <option value="">Selecione</option>
                  {culturas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Dose Recomendada</label>
                <input className="form-control" value={form.doseRecomendada || ''} onChange={e => setForm({ ...form, doseRecomendada: e.target.value })} placeholder="Ex: 2,5 L/ha" />
              </div>
              <div className="form-group">
                <label className="form-label">Intervalo (dias)</label>
                <input className="form-control" value={form.intervalo || ''} onChange={e => setForm({ ...form, intervalo: e.target.value })} placeholder="Ex: 14" />
              </div>
              <div className="form-group">
                <label className="form-label">Modo de Ação</label>
                <input className="form-control" value={form.modoAcao || ''} onChange={e => setForm({ ...form, modoAcao: e.target.value })} placeholder="Ex: Sistêmico" />
              </div>
              <div className="form-group">
                <label className="form-label">Ingrediente Ativo</label>
                <input className="form-control" value={form.ingredienteAtivo || ''} onChange={e => setForm({ ...form, ingredienteAtivo: e.target.value })} placeholder="Ex: Mancozeb 800 g/kg" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn--primary" onClick={addProduto}>Salvar Produto</button>
              <button className="btn btn--secondary" onClick={() => { setForm({ ...emptyForm }); setMostrarForm(false) }}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="dash-section-title" style={{ marginBottom: 0 }}>Produtos Cadastrados</h2>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>{produtos.length} produtos</span>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {produtos.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum produto cadastrado ainda.</h3>
              <p>Use o formulário acima para cadastrar o primeiro produto.</p>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>Produto{sortIcon('nome')}</th>
                    <th onClick={() => handleSort('categoria')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>Categoria{sortIcon('categoria')}</th>
                    <th onClick={() => handleSort('cultura')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>Cultura{sortIcon('cultura')}</th>
                    <th onClick={() => handleSort('fornecedor')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>Fornecedor{sortIcon('fornecedor')}</th>
                    <th onClick={() => handleSort('doseRecomendada')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>Dose{sortIcon('doseRecomendada')}</th>
                    <th onClick={() => handleSort('custo')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>Custo{sortIcon('custo')}</th>
                    <th onClick={() => handleSort('penetracao')} style={{ cursor: 'pointer', whiteSpace: 'nowrap', userSelect: 'none' }}>Penetração{sortIcon('penetracao')}</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedProdutos.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.nome}</strong></td>
                      <td><span className="badge badge--neutral">{p.categoria || 'N/A'}</span></td>
                      <td>{p.cultura || 'N/A'}</td>
                      <td>{p.fornecedor}</td>
                      <td>{p.doseRecomendada || 'N/A'}</td>
                      <td>{p.custo > 0 ? fmt(p.custo) : 'N/A'}</td>
                      <td>
                        {(() => { const pd = penetracaoData.find(d => d.nome === p.nome); return pd ? <span className="badge badge--success">{pd.count} cliente{pd.count !== 1 ? 's' : ''}</span> : <span className="badge badge--neutral">0</span> })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {editando && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }} id="form-produto">
          <div className="card-header">
            <h2 className="dash-section-title">Editar Produto</h2>
          </div>
          <div className="card-body">
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label">Nome do Produto *</label>
                <input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Fornecedor/Marca *</label>
                <input className="form-control" value={form.fornecedor} onChange={e => setForm({ ...form, fornecedor: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Custo (R$/L ou R$/kg)</label>
                <input className="form-control" type="number" value={form.custo || ''} onChange={e => setForm({ ...form, custo: Number(e.target.value) })} />
              </div>
              <div className="form-group">
                <label className="form-label">Categoria</label>
                <select className="form-control" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  <option value="">Selecione</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cultura Aplicada</label>
                <select className="form-control" value={form.cultura} onChange={e => setForm({ ...form, cultura: e.target.value })}>
                  <option value="">Selecione</option>
                  {culturas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Dose Recomendada</label>
                <input className="form-control" value={form.doseRecomendada} onChange={e => setForm({ ...form, doseRecomendada: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Intervalo (dias)</label>
                <input className="form-control" value={form.intervalo} onChange={e => setForm({ ...form, intervalo: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Modo de Ação</label>
                <input className="form-control" value={form.modoAcao} onChange={e => setForm({ ...form, modoAcao: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Ingrediente Ativo</label>
                <input className="form-control" value={form.ingredienteAtivo} onChange={e => setForm({ ...form, ingredienteAtivo: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn--primary" onClick={saveEdit}>Salvar</button>
              <button className="btn btn--secondary" onClick={cancelEdit}>Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <h3 style={{ margin: '0 0 var(--space-3)' }}>Confirmar exclusão</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)' }}>
              Tem certeza que deseja remover este produto? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
              <button className="btn btn--secondary" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button className="btn btn--danger" onClick={() => removeProduto(confirmDelete)} style={{ background: '#ef4444', color: '#fff' }}>Remover</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
