import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePageTitle } from '@/hooks/useTheme'

interface Campanha {
  id: string
  nome: string
  tipo: string
  publico: string
  orcamento: number
  retornoEstimado: number
  inicio: string
  fim: string
  status: string
  canais: string[]
}

const canalLabels: Record<string, string> = {
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  redes_sociais: 'Redes Sociais',
  visita_tecnica: 'Visita Técnica',
  presencial: 'Presencial',
  telefone: 'Telefone',
}

const tipoLabels: Record<string, string> = {
  comercial: 'Comercial',
  evento: 'Evento',
  lancamento: 'Lançamento',
  retencao: 'Retenção',
  promocao: 'Promoção',
  feira: 'Feira',
  fidelizacao: 'Fidelização',
  educacional: 'Educacional',
}

const statusLabels: Record<string, string> = {
  planejada: 'Planejada',
  em_execucao: 'Em Execução',
  concluida: 'Concluída',
  cancelada: 'Cancelada',
}

const statusClass: Record<string, string> = {
  em_execucao: 'badge--info',
  concluida: 'badge--success',
  cancelada: 'badge--error',
  planejada: 'badge--neutral',
}

const emptyForm: Campanha = {
  id: '',
  nome: '',
  tipo: 'comercial',
  publico: '',
  orcamento: 0,
  retornoEstimado: 0,
  inicio: new Date().toISOString().split('T')[0],
  fim: '',
  status: 'planejada',
  canais: [],
}

export function CampanhasPage() {
  usePageTitle('Campanhas')
  const [campanhas, setCampanhas] = useState<Campanha[]>(() => {
    const saved = localStorage.getItem('insightpro_campanhas')
    return saved ? JSON.parse(saved) : []
  })

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<Campanha>({ ...emptyForm })

  const saveCampanhas = (data: Campanha[]) => {
    setCampanhas(data)
    localStorage.setItem('insightpro_campanhas', JSON.stringify(data))
  }

  const addCampanha = () => {
    if (!form.nome.trim()) return
    saveCampanhas([...campanhas, { ...form, id: `camp_${Date.now()}` }])
    setForm({ ...emptyForm })
    setShowForm(false)
  }

  const removeCampanha = (id: string) => saveCampanhas(campanhas.filter(c => c.id !== id))

  const toggleCanal = (canal: string) => {
    setForm(prev => ({
      ...prev,
      canais: prev.canais.includes(canal)
        ? prev.canais.filter(c => c !== canal)
        : [...prev.canais, canal],
    }))
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const orcamentoTotal = campanhas.reduce((sum, c) => sum + c.orcamento, 0)
  const retornoTotal = campanhas.reduce((sum, c) => sum + c.retornoEstimado, 0)
  const ativas = campanhas.filter(c => c.status === 'em_execucao').length
  const roi = orcamentoTotal > 0 ? retornoTotal / orcamentoTotal : 0

  const [filter, setFilter] = useState('todas')
  const filtered = filter === 'todas' ? campanhas : campanhas.filter(c => c.status === filter)

  return (
    <AppLayout title="Campanhas" subtitle="Gestão de campanhas de marketing e vendas">
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--purple" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <p className="page-hero-eyebrow">Campanhas</p>
            <h1 className="page-hero-title">Gestão de Campanhas</h1>
            <p className="page-hero-subtitle">Acompanhe o desempenho das suas campanhas de marketing e vendas</p>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{campanhas.length}</span>
              <span className="page-hero-kpi-label">Total</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{ativas}</span>
              <span className="page-hero-kpi-label">Em Execução</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{roi.toFixed(2)}x</span>
              <span className="page-hero-kpi-label">ROI Médio</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{fmt(retornoTotal)}</span>
              <span className="page-hero-kpi-label">Retorno Est.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total de Campanhas</div>
          <div className="kpi-value">{campanhas.length}</div>
          <div className="kpi-trend positive">{ativas} em execução</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Investimento Total</div>
          <div className="kpi-value">{fmt(orcamentoTotal)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Retorno Estimado</div>
          <div className="kpi-value" style={{ color: 'var(--color-success)' }}>{fmt(retornoTotal)}</div>
          <div className={`kpi-trend ${retornoTotal >= orcamentoTotal ? 'positive' : 'negative'}`}>
            {retornoTotal >= orcamentoTotal ? 'Lucro' : 'Prejuízo'}
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">ROI Médio</div>
          <div className="kpi-value" style={{ color: 'var(--color-info)' }}>{roi.toFixed(2)}x</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <h2>Campanhas</h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['todas', 'planejada', 'em_execucao', 'concluida'].map(f => (
              <button key={f} className={`btn btn--sm ${filter === f ? 'btn--primary' : 'btn--secondary'}`} onClick={() => setFilter(f)}>
                {f === 'todas' ? 'Todas' : statusLabels[f]}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <button
            className="btn btn--secondary"
            onClick={() => setShowForm(!showForm)}
            style={{ marginBottom: 'var(--space-4)' }}
          >
            {showForm ? 'Fechar Formulário' : 'Nova Campanha'}
          </button>

          {showForm && (
            <div style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
              <div className="form-grid form-grid-3">
                <div className="form-group">
                  <label className="form-label">Nome*</label>
                  <input className="form-control" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })} placeholder="Nome da campanha" />
                </div>
                <div className="form-group">
                  <label className="form-label">Tipo</label>
                  <select className="form-control" value={form.tipo} onChange={e => setForm({ ...form, tipo: e.target.value })}>
                    {Object.entries(tipoLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Público-alvo</label>
                  <input className="form-control" value={form.publico} onChange={e => setForm({ ...form, publico: e.target.value })} placeholder="Ex: Produtores de soja" />
                </div>
                <div className="form-group">
                  <label className="form-label">Orçamento</label>
                  <input className="form-control" type="number" value={form.orcamento || ''} onChange={e => setForm({ ...form, orcamento: Number(e.target.value) })} placeholder="0,00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Retorno Estimado</label>
                  <input className="form-control" type="number" value={form.retornoEstimado || ''} onChange={e => setForm({ ...form, retornoEstimado: Number(e.target.value) })} placeholder="0,00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {Object.entries(statusLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Data Início</label>
                  <input className="form-control" type="date" value={form.inicio} onChange={e => setForm({ ...form, inicio: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Data Fim</label>
                  <input className="form-control" type="date" value={form.fim} onChange={e => setForm({ ...form, fim: e.target.value })} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: 'var(--space-4)' }}>
                <label className="form-label">Canais</label>
                <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
                  {Object.entries(canalLabels).map(([k, v]) => (
                    <button
                      key={k}
                      className={`btn btn--sm ${form.canais.includes(k) ? 'btn--primary' : 'btn--secondary'}`}
                      onClick={() => toggleCanal(k)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
                <button className="btn btn--primary" onClick={addCampanha}>Adicionar Campanha</button>
                <button className="btn btn--secondary" onClick={() => { setForm({ ...emptyForm }); setShowForm(false) }}>Cancelar</button>
              </div>
            </div>
          )}

          {filtered.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhuma campanha encontrada</h3>
              <p>{filter === 'todas' ? 'Nenhuma campanha cadastrada. Clique em "Nova Campanha" para começar.' : `Nenhuma campanha com status "${statusLabels[filter]}".`}</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {filtered.map(c => (
                <div key={c.id} className="campanha-card">
                  <div className="campanha-card-header">
                    <div>
                      <h3 className="campanha-card-title">{c.nome}</h3>
                      <p className="campanha-card-meta">{tipoLabels[c.tipo] || c.tipo} | Público: {c.publico}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                      <span className={`badge ${statusClass[c.status] || 'badge--neutral'}`}>{statusLabels[c.status] || c.status}</span>
                      <button className="btn btn--ghost btn--sm" onClick={() => removeCampanha(c.id)} aria-label="Remover">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      </button>
                    </div>
                  </div>
                  <div className="campanha-stats">
                    <div className="campanha-stat">
                      <div className="campanha-stat-label">Período</div>
                      <div className="campanha-stat-value">{new Date(c.inicio).toLocaleDateString('pt-BR')} - {new Date(c.fim).toLocaleDateString('pt-BR')}</div>
                    </div>
                    <div className="campanha-stat">
                      <div className="campanha-stat-label">Investimento</div>
                      <div className="campanha-stat-value">{fmt(c.orcamento)}</div>
                    </div>
                    <div className="campanha-stat">
                      <div className="campanha-stat-label">Retorno Est.</div>
                      <div className="campanha-stat-value" style={{ color: 'var(--color-success)' }}>{fmt(c.retornoEstimado)}</div>
                    </div>
                    <div className="campanha-stat">
                      <div className="campanha-stat-label">ROI</div>
                      <div className="campanha-stat-value" style={{ color: 'var(--color-info)' }}>{c.orcamento > 0 ? (c.retornoEstimado / c.orcamento).toFixed(2) : '0.00'}x</div>
                    </div>
                  </div>
                  <div className="campanha-canais">
                    {c.canais.map(canal => (
                      <span key={canal} className="badge badge--neutral" style={{ fontSize: 'var(--text-xs)' }}>{canalLabels[canal] || canal}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
