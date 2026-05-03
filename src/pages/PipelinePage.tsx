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
  { key: 'prospeccao', label: 'Prospeccao', color: '#6366f1' },
  { key: 'qualificacao', label: 'Qualificacao', color: '#3b82f6' },
  { key: 'proposta', label: 'Proposta', color: '#f59e0b' },
  { key: 'negociacao', label: 'Negociacao', color: '#8b5cf6' },
  { key: 'fechado_ganho', label: 'Fechado (Ganho)', color: '#22c55e' },
  { key: 'fechado_perdido', label: 'Fechado (Perdido)', color: '#ef4444' },
]

export function PipelinePage() {
  usePageTitle('Pipeline')
  const [pipeline, setPipeline] = useState<PipelineData>(() => {
    const saved = localStorage.getItem('insightpro_pipeline')
    return saved ? JSON.parse(saved) : { prospeccao: [], qualificacao: [], proposta: [], negociacao: [], fechado_ganho: [], fechado_perdido: [] }
  })

  const savePipeline = (data: PipelineData) => {
    setPipeline(data)
    localStorage.setItem('insightpro_pipeline', JSON.stringify(data))
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

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

  const totalValor = Object.values(pipeline).flat().reduce((sum, i) => sum + i.valor, 0)
  const totalOportunidades = Object.values(pipeline).flat().length
  const valorPonderado = Object.values(pipeline).flat().reduce((sum, i) => sum + (i.valor * (i.probabilidade / 100)), 0)
  const ganhos = pipeline.fechado_ganho.reduce((sum, i) => sum + i.valor, 0)
  const perdidos = pipeline.fechado_perdido.reduce((sum, i) => sum + i.valor, 0)

  return (
    <AppLayout title="Pipeline" subtitle="Acompanhamento de oportunidades em andamento">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Oportunidades</div>
          <div className="kpi-value">{totalOportunidades}</div>
          <div className="kpi-trend positive">{pipeline.fechado_ganho.length} fechadas</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Valor Total</div>
          <div className="kpi-value" style={{ fontSize: 'var(--text-xl)' }}>{formatCurrency(totalValor)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Valor Ponderado</div>
          <div className="kpi-value" style={{ color: 'var(--color-info)', fontSize: 'var(--text-xl)' }}>{formatCurrency(valorPonderado)}</div>
          <div className="kpi-trend">Probabilidade ajustada</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Ganhos vs Perdas</div>
          <div className="kpi-value" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'baseline' }}>
            <span style={{ color: 'var(--color-success)' }}>{formatCurrency(ganhos)}</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)' }}>/</span>
            <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-base)' }}>{formatCurrency(perdidos)}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', overflowX: 'auto', paddingBottom: 'var(--space-4)' }}>
        {stages.map(stage => (
          <div key={stage.key} style={{ minWidth: 280, flex: '0 0 280px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)', padding: 'var(--space-2) var(--space-1)' }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: stage.color }} />
              <h3 style={{ margin: 0, fontSize: 'var(--text-sm)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.025em', color: 'var(--text-secondary)' }}>
                {stage.label}
              </h3>
              <span className="badge badge--neutral" style={{ marginLeft: 'auto' }}>{pipeline[stage.key].length}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {pipeline[stage.key].map(item => (
                <div key={item.id} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-3)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-2)' }}>
                    <strong style={{ fontSize: 'var(--text-sm)', lineHeight: 1.3, flex: 1 }}>{item.cliente}</strong>
                    <button className="btn btn--ghost btn--sm" onClick={() => removeItem(stage.key, item.id)} aria-label="Remover" style={{ flexShrink: 0 }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', marginBottom: 'var(--space-2)' }}>
                    <span className="badge badge--info" style={{ fontSize: 'var(--text-xs)' }}>{item.cultura}</span>
                    <span className="badge badge--neutral" style={{ fontSize: 'var(--text-xs)' }}>{item.cidade}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
                    <strong style={{ color: 'var(--color-success)', fontSize: 'var(--text-sm)' }}>{formatCurrency(item.valor)}</strong>
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{item.probabilidade}%</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, marginBottom: 'var(--space-2)', overflow: 'hidden' }}>
                    <div style={{ width: `${item.probabilidade}%`, height: '100%', background: stage.color, borderRadius: 2 }} />
                  </div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-1)' }}>
                    <strong>Contato:</strong> {item.contato} | {new Date(item.ultimoContato).toLocaleDateString('pt-BR')}
                  </div>
                  {item.observacao && (
                    <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', margin: 'var(--space-1) 0', fontStyle: 'italic' }}>{item.observacao}</p>
                  )}
                  {stage.key !== 'fechado_ganho' && stage.key !== 'fechado_perdido' && (
                    <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
                      {stages.filter(s => s.key !== stage.key).slice(0, 4).map(next => (
                        <button
                          key={next.key}
                          className="btn btn--ghost btn--sm"
                          style={{ fontSize: 'var(--text-xs)', padding: '2px 6px' }}
                          onClick={() => moveItem(stage.key, next.key, item.id)}
                          title={`Mover para ${next.label}`}
                        >
                          {'>'} {next.label.split(' ')[0]}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {pipeline[stage.key].length === 0 && (
                <div style={{ textAlign: 'center', padding: 'var(--space-6)', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)' }}>
                  Nenhuma oportunidade
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
