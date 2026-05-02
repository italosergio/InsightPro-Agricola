import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePageTitle } from '@/hooks/useTheme'

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

const categorias = ['Fungicida', 'Inseticida', 'Herbicida', 'Adjuvante', 'Fertilizante Foliar', 'Bioestimulante', 'Regulador de Crescimento', 'Outros']
const culturas = ['Uva', 'Manga', 'Soja', 'Milho', 'Café', 'Algodão', 'Cana-de-Açúcar', 'Tomate', 'Citros', 'Arroz', 'Feijão', 'Trigo', 'Dendê', 'Pecuária']
const modosAcao = ['Contato', 'Sistêmico', 'Translaminar', 'Ingestão', 'Fumigante', 'Mesostêmico']
const tiposAplicacao = ['Foliar', 'Solo', 'Fertirrigação', 'Tratamento de Sementes', 'Pulverização', 'Aplicação Localizada']
const epocasAplicacao = ['Pré-plantio', 'Pós-plantio', 'Vegetativo', 'Pré-floração', 'Floração', 'Frutificação', 'Pós-colheita', 'Ano todo']

const sectionHeader = (emoji: string, title: string) => ({
  marginBottom: 'var(--space-3)',
  fontSize: 'var(--text-sm)',
  fontWeight: 600,
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
})

export function ProdutosPage() {
  usePageTitle('Produtos')
  const [produtos, setProdutos] = useState<ProdutoCadastro[]>(() => {
    const saved = localStorage.getItem('insightpro_produtos')
    return saved ? JSON.parse(saved) : []
  })
  const [form, setForm] = useState<ProdutoCadastro>({ ...emptyForm })

  const saveProdutos = (data: ProdutoCadastro[]) => {
    setProdutos(data)
    localStorage.setItem('insightpro_produtos', JSON.stringify(data))
  }

  const addProduto = () => {
    if (!form.nome.trim() || !form.fornecedor.trim()) return
    saveProdutos([...produtos, { ...form, id: `prod_${Date.now()}` }])
    setForm({ ...emptyForm })
  }

  const removeProduto = (id: string) => saveProdutos(produtos.filter(p => p.id !== id))

  const exportProdutos = () => {
    const header = 'Nome;Fornecedor;Custo;Categoria;Cultura;Modo de Ação;Ingrediente Ativo;Finalidade;Tipo de Aplicação;Dose;Intervalo;Época\n'
    const rows = produtos.map(p =>
      `${p.nome};${p.fornecedor};${p.custo};${p.categoria};${p.cultura};${p.modoAcao};${p.ingredienteAtivo};${p.finalidade};${p.tipoAplicacao};${p.doseRecomendada};${p.intervalo};${p.epocaAplicacao}`
    ).join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `produtos_insightpro_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  return (
    <AppLayout title="Produtos" subtitle="Cadastro de produtos agrícolas">
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--teal" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <span className="page-hero-eyebrow">Cadastro de Produtos</span>
            <h2 className="page-hero-title">Produtos Agrícolas</h2>
            <p className="page-hero-subtitle">Cadastre e gerencie produtos para culturas como Uva, Manga e outras</p>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{produtos.length}</span>
              <span className="page-hero-kpi-label">Cadastrados</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <h2 className="dash-section-title">Novo Produto</h2>
        </div>
        <div className="card-body">

          <div style={{ marginBottom: 'var(--space-5)' }}>
            <h3 style={sectionHeader('🏷️', 'Identificação')}>🏷️ Identificação</h3>
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label">Nome do Produto *</label>
                <input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Ex: Mancozeb 800 WP" />
              </div>
              <div className="form-group">
                <label className="form-label">Fornecedor/Marca *</label>
                <input className="form-control" value={form.fornecedor} onChange={e => setForm({ ...form, fornecedor: e.target.value })} placeholder="Ex: Bayer, Syngenta" />
              </div>
              <div className="form-group">
                <label className="form-label">Custo (R$/L ou R$/kg) *</label>
                <input className="form-control" type="number" value={form.custo || ''} onChange={e => setForm({ ...form, custo: Number(e.target.value) })} placeholder="Ex: 45.50" />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-5)' }}>
            <h3 style={sectionHeader('🧪', 'Classificação')}>🧪 Classificação</h3>
            <div className="form-grid form-grid-2">
              <div className="form-group">
                <label className="form-label">Categoria *</label>
                <select className="form-control" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                  <option value="">Selecione</option>
                  {categorias.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Cultura Aplicada *</label>
                <select className="form-control" value={form.cultura} onChange={e => setForm({ ...form, cultura: e.target.value })}>
                  <option value="">Selecione</option>
                  {culturas.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Modo de Ação</label>
                <select className="form-control" value={form.modoAcao} onChange={e => setForm({ ...form, modoAcao: e.target.value })}>
                  <option value="">Selecione</option>
                  {modosAcao.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Ingrediente Ativo/Composição *</label>
                <input className="form-control" value={form.ingredienteAtivo} onChange={e => setForm({ ...form, ingredienteAtivo: e.target.value })} placeholder="Ex: Mancozeb 800 g/kg" />
              </div>
              <div className="form-group">
                <label className="form-label">Finalidade *</label>
                <input className="form-control" value={form.finalidade} onChange={e => setForm({ ...form, finalidade: e.target.value })} placeholder="Ex: Controle de antracnose, oídio, míldio" />
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-5)' }}>
            <h3 style={sectionHeader('💧', 'Aplicação')}>💧 Aplicação</h3>
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label">Tipo de Aplicação *</label>
                <select className="form-control" value={form.tipoAplicacao} onChange={e => setForm({ ...form, tipoAplicacao: e.target.value })}>
                  <option value="">Selecione</option>
                  {tiposAplicacao.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Dose Recomendada *</label>
                <input className="form-control" value={form.doseRecomendada} onChange={e => setForm({ ...form, doseRecomendada: e.target.value })} placeholder="Ex: 2,5 L/ha ou 300 g/100L" />
              </div>
              <div className="form-group">
                <label className="form-label">Intervalo de Segurança (dias) *</label>
                <input className="form-control" value={form.intervalo} onChange={e => setForm({ ...form, intervalo: e.target.value })} placeholder="Ex: 14" />
              </div>
              <div className="form-group">
                <label className="form-label">Época de Aplicação</label>
                <select className="form-control" value={form.epocaAplicacao} onChange={e => setForm({ ...form, epocaAplicacao: e.target.value })}>
                  <option value="">Selecione</option>
                  {epocasAplicacao.map(e => <option key={e} value={e}>{e}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 'var(--space-5)' }}>
            <h3 style={sectionHeader('⚠️', 'Segurança e Compatibilidade')}>⚠️ Segurança e Compatibilidade</h3>
            <div className="form-grid form-grid-1">
              <div className="form-group">
                <label className="form-label">Compatibilidade com Outros Produtos</label>
                <textarea className="form-control" value={form.compatibilidade} onChange={e => setForm({ ...form, compatibilidade: e.target.value })} rows={2} placeholder="Ex: Compatível com óleos minerais. Não misturar com produtos alcalinos." />
              </div>
              <div className="form-group">
                <label className="form-label">Restrições e Cuidados</label>
                <textarea className="form-control" value={form.restricoes} onChange={e => setForm({ ...form, restricoes: e.target.value })} rows={2} placeholder="Ex: Não aplicar em temperaturas acima de 30°C. Evitar deriva para culturas sensíveis." />
              </div>
              <div className="form-group">
                <label className="form-label">Observações Técnicas</label>
                <textarea className="form-control" value={form.observacoes} onChange={e => setForm({ ...form, observacoes: e.target.value })} rows={2} placeholder="Ex: Produto com ação preventiva. Aplicar com pH da calda entre 6,0-7,0." />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button className="btn btn--primary" onClick={addProduto}>Salvar Produto</button>
            <button className="btn btn--secondary" onClick={() => setForm({ ...emptyForm })}>Limpar</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <h2 className="dash-section-title" style={{ marginBottom: 0 }}>Produtos Cadastrados</h2>
          {produtos.length > 0 && (
            <button className="btn btn--secondary btn--sm" onClick={exportProdutos}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                <line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 12 15 15" />
              </svg>
              Exportar Produtos
            </button>
          )}
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {produtos.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum produto cadastrado ainda.</h3>
            </div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>Categoria</th>
                    <th>Cultura</th>
                    <th>Dose</th>
                    <th>Intervalo</th>
                    <th>Custo</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.nome}</strong><br /><span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{p.fornecedor}</span></td>
                      <td><span className="badge badge--neutral">{p.categoria || 'N/A'}</span></td>
                      <td>{p.cultura || 'N/A'}</td>
                      <td>{p.doseRecomendada || 'N/A'}</td>
                      <td>{p.intervalo ? `${p.intervalo} dias` : 'N/A'}</td>
                      <td>{p.custo > 0 ? fmt(p.custo) : 'N/A'}</td>
                      <td>
                        <button className="btn btn--ghost btn--sm" onClick={() => removeProduto(p.id)} style={{ color: '#ef4444' }}>Remover</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
