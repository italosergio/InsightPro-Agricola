import { useState } from 'react'
import { Link } from 'react-router-dom'
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
  cliente: '',
  cultura: '',
  cidade: '',
  valor: 0,
  probabilidade: 50,
  estagio: 'prospeccao' as keyof PipelineData,
  contato: '',
  ultimoContato: new Date().toISOString().split('T')[0],
  observacao: '',
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
    const newItem: PipelineItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      cliente: form.cliente,
      cultura: form.cultura,
      cidade: form.cidade,
      valor: form.valor,
      probabilidade: form.probabilidade,
      contato: form.contato,
      ultimoContato: form.ultimoContato,
      observacao: form.observacao,
    }
    savePipeline({
      ...pipeline,
      [form.estagio]: [...pipeline[form.estagio], newItem],
    })
    setForm(emptyForm)
    setShowForm(false)
  }

  const removeItem = (stage: keyof PipelineData, id: string) => {
    savePipeline({ ...pipeline, [stage]: pipeline[stage].filter(i => i.id !== id) })
  }

  const moveItem = (from: keyof PipelineData, to: keyof PipelineData, id: string) => {
    const item = pipeline[from].find(i => i.id === id)
    if (!item) return
    const updatedFrom = pipeline[from].filter(i => i.id !== id)
    const updatedTo = [...pipeline[to], item]
    savePipeline({ ...pipeline, [from]: updatedFrom, [to]: updatedTo })
  }

  const fmt = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

  const totalValor = Object.values(pipeline).flat().reduce((sum, i) => sum + i.valor, 0)
  const totalOportunidades = Object.values(pipeline).flat().length
  const valorPonderado = Object.values(pipeline).flat().reduce((sum, i) => sum + (i.valor * (i.probabilidade / 100)), 0)
  const ganhos = pipeline.fechado_ganho.reduce((sum, i) => sum + i.valor, 0)
  const perdidos = pipeline.fechado_perdido.reduce((sum, i) => sum + i.valor, 0)
  const closeRate = totalOportunidades > 0 ? ((pipeline.fechado_ganho.length / totalOportunidades) * 100).toFixed(1) : '0'

  const activeStages = stages.filter(s => s.key !== 'fechado_ganho' && s.key !== 'fechado_perdido')

  return (
    <AppLayout title="Pipeline" subtitle="Acompanhamento de oportunidades em andamento">

      <section className="page-hero">
        <div className="hero-KPIs">
          <div className="hero-kpi">
            <div className="hero-kpi-label">Oportunidades</div>
            <div className="hero-kpi-value">{totalOportunidades}</div>
          </div>
          <div className="hero-kpi">
            <div className="hero-kpi-label">Val. Ponderado</div>
            <div className="hero-kpi-value">{fmt(valorPonderado)}</div>
          </div>
          <div className="hero-kpi">
            <div className="hero-kpi-label">Taxa de Fechamento</div>
            <div className="hero-kpi-value">{closeRate}%</div>
          </div>
        </div>
      </section>

      <div className="kpi-grid">
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
          <div className="kpi-value" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'baseline' }}>
            <span style={{ color: 'var(--color-success)' }}>{fmt(ganhos)}</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>/</span>
            <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-base)' }}>{fmt(perdidos)}</span>
          </div>
        </div>
      </div>

      <div className="pipeline-add-toggle">
        <button className="btn btn--primary" onClick={() => { setShowForm(!showForm); if (!showForm) setForm(emptyForm) }}>
          {showForm ? 'Fechar' : '+ Nova Oportunidade'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
          <div className="form-grid form-grid-3">
            <label>
              Cliente*
              <input type="text" className="input" value={form.cliente} onChange={e => setForm({ ...form, cliente: e.target.value })} required />
            </label>
            <label>
              Cultura
              <input type="text" className="input" value={form.cultura} onChange={e => setForm({ ...form, cultura: e.target.value })} />
            </label>
            <label>
              Cidade/UF
              <input type="text" className="input" value={form.cidade} onChange={e => setForm({ ...form, cidade: e.target.value })} />
            </label>
            <label>
              Valor
              <input type="number" className="input" value={form.valor} onChange={e => setForm({ ...form, valor: Number(e.target.value) })} />
            </label>
            <label>
              Probabilidade
              <input type="number" className="input" min="0" max="100" value={form.probabilidade} onChange={e => setForm({ ...form, probabilidade: Number(e.target.value) })} />
            </label>
            <label>
              Estágio
              <select className="input" value={form.estagio} onChange={e => setForm({ ...form, estagio: e.target.value as keyof PipelineData })}>
                {stages.map(s => (
                  <option key={s.key} value={s.key}>{s.label}</option>
                ))}
              </select>
            </label>
            <label>
              Contato
              <input type="text" className="input" value={form.contato} onChange={e => setForm({ ...form, contato: e.target.value })} />
            </label>
            <label>
              Último Contato
              <input type="date" className="input" value={form.ultimoContato} onChange={e => setForm({ ...form, ultimoContato: e.target.value })} />
            </label>
            <label>
              Observação
              <input type="text" className="input" value={form.observacao} onChange={e => setForm({ ...form, observacao: e.target.value })} />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
            <button className="btn btn--primary" onClick={addItem}>Adicionar</button>
            <button className="btn btn--ghost" onClick={() => { setForm(emptyForm); setShowForm(false) }}>Cancelar</button>
          </div>
        </div>
      )}

      <div className="pipeline-board-wrapper">
        <div className="pipeline-board">
          {stages.map(stage => (
            <div className="pipeline-column" key={stage.key} style={{ '--col-color': stage.color } as React.CSSProperties}>
              <div className="pipeline-column-header">
                <div className="dot" style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color }} />
                <span className="label" style={{ fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', color: 'var(--text-secondary)' }}>
                  {stage.label}
                </span>
                <span className="badge badge--neutral" style={{ marginLeft: 'auto' }}>{pipeline[stage.key].length}</span>
              </div>
              <div className="pipeline-column-body">
                {pipeline[stage.key].map(item => (
                  <div className="pipeline-card" key={item.id}>
                    <div className="card-name">{item.cliente}</div>
                    <div className="card-meta">
                      <span className="badge badge--info" style={{ fontSize: 'var(--text-xs)' }}>{item.cultura}</span>
                      <span className="badge badge--neutral" style={{ fontSize: 'var(--text-xs)' }}>{item.cidade}</span>
                    </div>
                    <div className="card-value" style={{ color: 'var(--color-success)', fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                      {fmt(item.valor)}
                    </div>
                    <div className="card-bar" style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 'var(--space-2)', overflow: 'hidden' }}>
                      <div style={{ width: `${item.probabilidade}%`, height: '100%', background: stage.color, borderRadius: 2 }} />
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                      <strong>Contato:</strong> {item.contato} | {new Date(item.ultimoContato).toLocaleDateString('pt-BR')}
                    </div>
                    {item.observacao && (
                      <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 'var(--space-1) 0', fontStyle: 'italic' }}>{item.observacao}</p>
                    )}
                    <div className="card-actions" style={{ display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap', marginTop: 'var(--space-2)' }}>
                      {activeStages.filter(s => s.key !== stage.key).map(next => (
                        <button
                          key={next.key}
                          className="btn btn--ghost btn--sm"
                          style={{ fontSize: 'var(--text-xs)', padding: '2px 6px' }}
                          onClick={() => moveItem(stage.key, next.key, item.id)}
                          title={`Mover para ${next.label}`}
                        >
                          <span style={{ color: next.color }}>→</span> {next.label}
                        </button>
                      ))}
                      {stage.key !== 'fechado_perdido' && (
                        <button
                          className="btn btn--ghost btn--sm"
                          style={{ fontSize: 'var(--text-xs)', padding: '2px 6px', color: '#ef4444' }}
                          onClick={() => moveItem(stage.key, 'fechado_perdido', item.id)}
                          title="Marcar como perdido"
                        >
                          ✗ Perdido
                        </button>
                      )}
                      {stage.key === 'fechado_perdido' && (
                        <button
                          className="btn btn--ghost btn--sm"
                          style={{ fontSize: 'var(--text-xs)', padding: '2px 6px', color: '#ef4444' }}
                          onClick={() => removeItem(stage.key, item.id)}
                          title="Remover"
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {pipeline[stage.key].length === 0 && (
                  <div className="pipeline-empty" style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                    Nenhuma oportunidade
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </AppLayout>
  )
}
