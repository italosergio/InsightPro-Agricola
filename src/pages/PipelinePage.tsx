import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePageTitle } from '@/hooks/useTheme'

interface PipelineItem {
  id: string
  cliente: string
  cultura: string
  cidade: string
  valor: number
  probabilidade: number
  contato: string
  ultimoContato: string
  observacao: string
}

interface PipelineData {
  prospeccao: PipelineItem[]
  qualificacao: PipelineItem[]
  proposta: PipelineItem[]
  negociacao: PipelineItem[]
  fechado_ganho: PipelineItem[]
  fechado_perdido: PipelineItem[]
}

const stages: { key: keyof PipelineData; label: string; color: string }[] = [
  { key: 'prospeccao', label: 'Prospecção', color: '#6366f1' },
  { key: 'qualificacao', label: 'Qualificação', color: '#3b82f6' },
  { key: 'proposta', label: 'Proposta', color: '#f59e0b' },
  { key: 'negociacao', label: 'Negociação', color: '#8b5cf6' },
  { key: 'fechado_ganho', label: 'Ganho', color: '#22c55e' },
  { key: 'fechado_perdido', label: 'Perdido', color: '#ef4444' },
]

const emptyForm = {
  cliente: '', cultura: '', cidade: '', valor: 0,
  probabilidade: 50, contato: '', ultimoContato: new Date().toISOString().split('T')[0], observacao: '', estagio: 'prospeccao' as keyof PipelineData,
}

export function PipelinePage() {
  usePageTitle('Pipeline')
  const [pipeline, setPipeline] = useState<PipelineData>(() => {
    const saved = localStorage.getItem('insightpro_pipeline')
    return saved ? JSON.parse(saved) : { prospeccao: [], qualificacao: [], proposta: [], negociacao: [], fechado_ganho: [], fechado_perdido: [] }
  })
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(emptyForm)

  const savePipeline = (data: PipelineData) => {
    setPipeline(data)
    localStorage.setItem('insightpro_pipeline', JSON.stringify(data))
  }

  const addItem = () => {
    if (!form.cliente.trim()) return
    const item: PipelineItem = {
      id: Date.now().toString(),
      cliente: form.cliente, cultura: form.cultura, cidade: form.cidade,
      valor: form.valor, probabilidade: form.probabilidade,
      contato: form.contato, ultimoContato: form.ultimoContato, observacao: form.observacao,
    }
    savePipeline({ ...pipeline, [form.estagio]: [...pipeline[form.estagio], item] })
    setForm(emptyForm)
    setShowForm(false)
  }

  const removeItem = (stage: keyof PipelineData, id: string) =>
    savePipeline({ ...pipeline, [stage]: pipeline[stage].filter(i => i.id !== id) })

  const moveItem = (from: keyof PipelineData, to: keyof PipelineData, id: string) => {
    const item = pipeline[from].find(i => i.id === id)
    if (!item) return
    savePipeline({ ...pipeline, [from]: pipeline[from].filter(i => i.id !== id), [to]: [...pipeline[to], item] })
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

  const allItems = Object.values(pipeline).flat()
  const totalOportunidades = allItems.length
  const totalValor = allItems.reduce((s, i) => s + i.valor, 0)
  const valorPonderado = allItems.reduce((s, i) => s + i.valor * (i.probabilidade / 100), 0)
  const ganhos = pipeline.fechado_ganho.reduce((s, i) => s + i.valor, 0)
  const perdidos = pipeline.fechado_perdido.reduce((s, i) => s + i.valor, 0)
  const closeRate = totalOportunidades > 0
    ? Math.round((pipeline.fechado_ganho.length / totalOportunidades) * 100)
    : 0

  return (
    <AppLayout title="Pipeline" subtitle="Acompanhamento de oportunidades comerciais">
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--purple" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <span className="page-hero-eyebrow">Funil de Vendas</span>
            <h2 className="page-hero-title">Pipeline Comercial</h2>
            <p className="page-hero-subtitle">Gerencie e acompanhe todas as oportunidades de negócio em tempo real.</p>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{totalOportunidades}</span>
              <span className="page-hero-kpi-label">Oportunidades</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{fmt(valorPonderado)}</span>
              <span className="page-hero-kpi-label">Val. Ponderado</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{closeRate}%</span>
              <span className="page-hero-kpi-label">Taxa de Fechamento</span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="kpi-card">
          <div className="kpi-label">Oportunidades</div>
          <div className="kpi-value">{totalOportunidades}</div>
          <div className="kpi-trend positive">{pipeline.fechado_ganho.length} fechadas</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Valor Total</div>
          <div className="kpi-value" style={{ fontSize: 'var(--text-xl)' }}>{fmt(totalValor)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Valor Ponderado</div>
          <div className="kpi-value" style={{ color: 'var(--color-info)', fontSize: 'var(--text-xl)' }}>{fmt(valorPonderado)}</div>
          <div className="kpi-trend">Probabilidade ajustada</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Ganhos / Perdas</div>
          <div className="kpi-value" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'baseline', flexWrap: 'wrap' }}>
            <span style={{ color: 'var(--color-success)', fontSize: 'var(--text-lg)' }}>{fmt(ganhos)}</span>
            <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-base)' }}>{fmt(perdidos)}</span>
          </div>
        </div>
      </div>

      {/* Add Opportunity */}
      <div className="pipeline-add-section">
        <button className="pipeline-add-toggle" onClick={() => setShowForm(v => !v)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Nova Oportunidade
        </button>

        {showForm && (
          <div className="card" style={{ marginTop: 'var(--space-4)' }}>
            <div className="card-header"><h3>Adicionar Oportunidade</h3></div>
            <div className="card-body">
              <div className="form-grid form-grid-3" style={{ marginBottom: 'var(--space-4)' }}>
                <div className="form-group">
                  <label className="form-label">Cliente *</label>
                  <input className="form-control" value={form.cliente} onChange={e => setForm(p => ({ ...p, cliente: e.target.value }))} placeholder="Nome do cliente" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cultura</label>
                  <input className="form-control" value={form.cultura} onChange={e => setForm(p => ({ ...p, cultura: e.target.value }))} placeholder="Ex: Soja, Milho" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cidade/UF</label>
                  <input className="form-control" value={form.cidade} onChange={e => setForm(p => ({ ...p, cidade: e.target.value }))} placeholder="Ex: Cascavel/PR" />
                </div>
                <div className="form-group">
                  <label className="form-label">Valor (R$)</label>
                  <input type="number" className="form-control" value={form.valor || ''} onChange={e => setForm(p => ({ ...p, valor: Number(e.target.value) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Probabilidade (%)</label>
                  <input type="number" className="form-control" min="0" max="100" value={form.probabilidade} onChange={e => setForm(p => ({ ...p, probabilidade: Math.min(100, Math.max(0, Number(e.target.value))) }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Estágio</label>
                  <select className="form-control" value={form.estagio} onChange={e => setForm(p => ({ ...p, estagio: e.target.value as keyof PipelineData }))}>
                    {stages.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Contato</label>
                  <input className="form-control" value={form.contato} onChange={e => setForm(p => ({ ...p, contato: e.target.value }))} placeholder="Nome do contato" />
                </div>
                <div className="form-group">
                  <label className="form-label">Último Contato</label>
                  <input type="date" className="form-control" value={form.ultimoContato} onChange={e => setForm(p => ({ ...p, ultimoContato: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Observação</label>
                  <input className="form-control" value={form.observacao} onChange={e => setForm(p => ({ ...p, observacao: e.target.value }))} placeholder="Detalhes adicionais" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
                <button className="btn btn--primary" onClick={addItem}>Adicionar</button>
                <button className="btn btn--secondary" onClick={() => { setShowForm(false); setForm(emptyForm) }}>Cancelar</button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="pipeline-board-wrapper">
        <div className="pipeline-board">
          {stages.map(stage => (
            <div key={stage.key} className="pipeline-column" style={{ '--col-color': stage.color } as React.CSSProperties}>
              <div className="pipeline-column-header">
                <div className="pipeline-column-dot" />
                <span className="pipeline-column-label">{stage.label}</span>
                <span className="pipeline-column-count">{pipeline[stage.key].length}</span>
              </div>

              <div className="pipeline-column-body">
                {pipeline[stage.key].map(item => (
                  <div key={item.id} className="pipeline-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 'var(--space-1)' }}>
                      <span className="pipeline-card-name">{item.cliente}</span>
                      <button
                        className="btn btn--ghost btn--sm"
                        onClick={() => removeItem(stage.key, item.id)}
                        aria-label="Remover"
                        style={{ flexShrink: 0, padding: '2px' }}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 13, height: 13 }}>
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    <div className="pipeline-card-meta">
                      {item.cultura && <span className="badge badge--info" style={{ fontSize: '10px' }}>{item.cultura}</span>}
                      {item.cidade && <span className="badge badge--neutral" style={{ fontSize: '10px' }}>{item.cidade}</span>}
                    </div>

                    <div className="pipeline-card-value">
                      <strong style={{ color: 'var(--color-success)', fontSize: 'var(--text-sm)' }}>{fmt(item.valor)}</strong>
                      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{item.probabilidade}%</span>
                    </div>

                    <div className="pipeline-card-bar">
                      <div className="pipeline-card-bar-fill" style={{ width: `${item.probabilidade}%`, background: stage.color }} />
                    </div>

                    {item.contato && (
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                        {item.contato} · {new Date(item.ultimoContato).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                    {item.observacao && (
                      <p style={{ fontSize: '11px', color: 'var(--text-secondary)', margin: 0, fontStyle: 'italic', lineHeight: 1.4 }}>{item.observacao}</p>
                    )}

                    {stage.key !== 'fechado_ganho' && stage.key !== 'fechado_perdido' && (
                      <div className="pipeline-card-actions">
                        {stages
                          .filter(s => s.key !== stage.key && s.key !== 'fechado_perdido')
                          .slice(0, 3)
                          .map(next => (
                            <button
                              key={next.key}
                              className="btn btn--ghost btn--sm"
                              style={{ fontSize: '10px', padding: '2px 5px', color: next.color }}
                              onClick={() => moveItem(stage.key, next.key, item.id)}
                              title={`Mover para ${next.label}`}
                            >
                              → {next.label.split(' ')[0]}
                            </button>
                          ))}
                        <button
                          className="btn btn--ghost btn--sm"
                          style={{ fontSize: '10px', padding: '2px 5px', color: '#ef4444' }}
                          onClick={() => moveItem(stage.key, 'fechado_perdido', item.id)}
                          title="Marcar como perdido"
                        >
                          ✗
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {pipeline[stage.key].length === 0 && (
                  <div className="pipeline-empty">Nenhuma oportunidade</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
