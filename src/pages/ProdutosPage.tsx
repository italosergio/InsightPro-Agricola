import { useState } from 'react'
import { usePageTitle } from '@/hooks/useTheme'
import { produtosAJINOMOTO } from '@/data/produtos'

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

export function ProdutosPage() {
  usePageTitle('Produtos')
  const [produtos, setProdutos] = useState<ProdutoCadastro[]>(() => {
    const saved = localStorage.getItem('insightpro_produtos')
    if (saved) return JSON.parse(saved)
    return produtosAJINOMOTO.map((nome, i) => ({
      id: `prod_seed_${i}`,
      nome,
      fornecedor: 'AJINOMOTO',
      custo: [85, 120, 95, 65, 150, 78, 110, 90, 72, 88, 105, 55][i],
      categoria: ['Bioestimulante', 'Bioestimulante', 'Bioestimulante', 'Fertilizante Foliar', 'Fertilizante Foliar', 'Fertilizante Foliar', 'Adjuvante', 'Regulador de Crescimento', 'Fertilizante Foliar', 'Bioestimulante', 'Fertilizante Foliar', 'Fertilizante Foliar'][i],
      cultura: ['Uva', 'Manga', 'Tomate', 'Soja', 'Café', 'Milho', 'Algodão', 'Soja', 'Uva', 'Citros', 'Arroz', 'Feijão'][i],
      modoAcao: 'Sistêmico',
      ingredienteAtivo: `Composto bioativo AJN-${100 + i}`,
      finalidade: 'Aumento de produtividade e qualidade',
      tipoAplicacao: 'Foliar',
      doseRecomendada: `${(1.5 + i * 0.3).toFixed(1)} L/ha`,
      intervalo: `${7 + (i % 3) * 7}`,
      epocaAplicacao: 'Vegetativo',
      compatibilidade: 'Compatível com a maioria dos defensivos',
      restricoes: 'Evitar aplicação com temperaturas acima de 30°C',
      observacoes: 'Aplicar nas primeiras horas da manhã',
    }))
  })
  const [editando, setEditando] = useState<string | null>(null)
  const [form, setForm] = useState<ProdutoCadastro>({} as ProdutoCadastro)
  const [mostrarForm, setMostrarForm] = useState(false)

  const saveProdutos = (data: ProdutoCadastro[]) => {
    setProdutos(data)
    localStorage.setItem('insightpro_produtos', JSON.stringify(data))
  }

  const startEdit = (p: ProdutoCadastro) => {
    setForm({ ...p })
    setEditando(p.id)
  }

  const saveEdit = () => {
    if (!form.nome.trim()) return
    saveProdutos(produtos.map(p => p.id === editando ? { ...form, id: editando } : p))
    setEditando(null)
  }

  const removeProduto = (id: string) => {
    saveProdutos(produtos.filter(p => p.id !== id))
    if (editando === id) setEditando(null)
  }

  const addProduto = () => {
    if (!form.nome.trim() || !form.fornecedor.trim()) return
    saveProdutos([...produtos, { ...form, id: `prod_${Date.now()}` }])
    setForm({} as ProdutoCadastro)
    setMostrarForm(false)
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
              onClick={() => setMostrarForm(!mostrarForm)}
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
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{produtos.length}</span>
              <span className="page-hero-kpi-label">Cadastrados</span>
            </div>
          </div>
        </div>
      </div>

      {mostrarForm && (
        <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
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
              <button className="btn btn--secondary" onClick={() => { setForm({} as ProdutoCadastro); setMostrarForm(false) }}>Cancelar</button>
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
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Categoria</th>
                  <th>Cultura</th>
                  <th>Fornecedor</th>
                  <th>Dose</th>
                  <th>Custo</th>
                </tr>
              </thead>
              <tbody>
                {produtos.map(p => (
                  <tr key={p.id}>
                    <td><strong>{p.nome}</strong></td>
                    <td><span className="badge badge--neutral">{p.categoria || 'N/A'}</span></td>
                    <td>{p.cultura || 'N/A'}</td>
                    <td>{p.fornecedor}</td>
                    <td>{p.doseRecomendada || 'N/A'}</td>
                    <td>{p.custo > 0 ? fmt(p.custo) : 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editando && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
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
              <button className="btn btn--secondary" onClick={() => setEditando(null)}>Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
