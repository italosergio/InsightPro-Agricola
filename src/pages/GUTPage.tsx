import { useState } from 'react'
import { usePageTitle } from '@/hooks/useTheme'
import { DownloadReportButton } from '@/lib/downloadUtils'

interface GutItem {
  id: string
  problema: string
  gravidade: number
  urgencia: number
  tendencia: number
  score: number
}

const scoreHints: Record<string, string[]> = {
  gravidade: ['Sem impacto', 'Leve', 'Moderado', 'Grave', 'Gravíssimo'],
  urgencia: ['Pode esperar', 'Pouco urgente', 'Urgência média', 'Urgente', 'Ação imediata'],
  tendencia: ['Vai melhorar', 'Tende a melhorar', 'Estável', 'Pode piorar', 'Vai piorar'],
}

function ScoreInput({ label, value, onChange, hints }: { label: string; value: number; onChange: (v: number) => void; hints: string[] }) {
  return (
    <div className="form-group">
      <label className="form-label">{label} <span className="form-label-hint">(1–5)</span></label>
      <div style={{ display: 'flex', gap: 'var(--space-1)', marginTop: 'var(--space-1)' }}>
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            type="button"
            className="btn btn--sm"
            title={hints[n - 1]}
            onClick={() => onChange(n)}
            style={{
              flex: 1,
              background: value === n ? 'var(--color-primary)' : 'var(--bg-tertiary)',
              borderColor: value === n ? 'var(--color-primary)' : 'transparent',
              color: value === n ? '#fff' : 'var(--text-secondary)',
              fontWeight: value === n ? 'var(--font-bold)' : 'var(--font-normal)',
              padding: 'var(--space-1) var(--space-2)',
              fontSize: 'var(--text-sm)',
              transition: 'all var(--transition-fast)',
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 2, display: 'block' }}>
        {hints[value - 1]}
      </span>
    </div>
  )
}

export function GUTPage() {
  usePageTitle('Matriz GUT')
  const [items, setItems] = useState<GutItem[]>(() => {
    const saved = localStorage.getItem('insightpro_gut')
    return saved ? JSON.parse(saved) : []
  })

  const [form, setForm] = useState({ problema: '', gravidade: 1, urgencia: 1, tendencia: 1 })
  const [showForm, setShowForm] = useState(false)

  const saveItems = (data: GutItem[]) => {
    setItems(data)
    localStorage.setItem('insightpro_gut', JSON.stringify(data))
  }

  const addItem = () => {
    if (!form.problema.trim()) return
    const score = form.gravidade * form.urgencia * form.tendencia
    const item: GutItem = {
      id: Date.now().toString(),
      ...form,
      score,
    }
    const updated = [...items, item].sort((a, b) => b.score - a.score)
    saveItems(updated)
    setForm({ problema: '', gravidade: 1, urgencia: 1, tendencia: 1 })
  }

  const removeItem = (id: string) => {
    saveItems(items.filter(i => i.id !== id))
  }

  const getPriorityInfo = (score: number): { label: string; badgeClass: string; color: string } => {
    if (score >= 75) return { label: 'Crítica', badgeClass: 'badge--error', color: '#ef4444' }
    if (score >= 27) return { label: 'Alta', badgeClass: 'badge--warning', color: '#f59e0b' }
    if (score >= 8) return { label: 'Média', badgeClass: 'badge--info', color: '#3b82f6' }
    return { label: 'Baixa', badgeClass: 'badge--neutral', color: 'var(--text-secondary)' }
  }

  const getRankColor = (index: number) => {
    if (index === 0) return '#ef4444'
    if (index === 1) return '#f59e0b'
    if (index === 2) return '#f59e0b'
    return 'var(--text-tertiary)'
  }

  const criticalCount = items.filter(i => i.score >= 75).length
  const highCount = items.filter(i => i.score >= 27 && i.score < 75).length
  const maxScore = 125

  const downloadData = items.map(item => ({
    problema: item.problema,
    gravidade: item.gravidade,
    urgencia: item.urgencia,
    tendencia: item.tendencia,
    score: item.score,
    prioridade: getPriorityInfo(item.score).label,
  }))

  return (
    <>
      <div style={{ position: 'relative', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', marginBottom: 'var(--space-8)' }}>
        <div className="page-hero-bg page-hero-bg--amber" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <div className="page-hero-eyebrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/></svg>
              Matriz GUT
            </div>
            <h1 className="page-hero-title">Matriz de Priorização GUT</h1>
            <p className="page-hero-subtitle">Classifique problemas por Gravidade, Urgência e Tendência</p>
            <DownloadReportButton data={downloadData} filename="gut.csv" />
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{items.length}</span>
              <span className="page-hero-kpi-label">Problemas</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value" style={{ color: '#f87171' }}>{criticalCount}</span>
              <span className="page-hero-kpi-label">Críticos</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value" style={{ color: '#fbbf24' }}>{highCount}</span>
              <span className="page-hero-kpi-label">Alta Prior.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div
          className="card-header"
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', userSelect: 'none' }}
          onClick={() => setShowForm(prev => !prev)}
        >
          <h2>{showForm ? 'Adicionar Problema' : 'Adicionar Problema'}</h2>
          <span style={{ color: 'var(--text-tertiary)', transition: 'transform var(--transition-fast)', transform: showForm ? 'rotate(180deg)' : 'rotate(0deg)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 18, height: 18 }}><polyline points="6 9 12 15 18 9" /></svg>
          </span>
        </div>
        {showForm && (
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Problema</label>
              <input
                type="text"
                className="form-control"
                value={form.problema}
                onChange={e => setForm(prev => ({ ...prev, problema: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addItem()}
                placeholder="Descreva o problema"
              />
            </div>
            <div className="form-grid form-grid-3" style={{ marginTop: 'var(--space-4)' }}>
              <ScoreInput label="Gravidade" value={form.gravidade} onChange={v => setForm(prev => ({ ...prev, gravidade: v }))} hints={scoreHints.gravidade} />
              <ScoreInput label="Urgência" value={form.urgencia} onChange={v => setForm(prev => ({ ...prev, urgencia: v }))} hints={scoreHints.urgencia} />
              <ScoreInput label="Tendência" value={form.tendencia} onChange={v => setForm(prev => ({ ...prev, tendencia: v }))} hints={scoreHints.tendencia} />
            </div>
            <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Score:</span>
              <span style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--font-bold)', color: 'var(--color-primary)' }}>
                {form.gravidade} × {form.urgencia} × {form.tendencia} = <strong>{form.gravidade * form.urgencia * form.tendencia}</strong>
              </span>
              <span className={`badge ${getPriorityInfo(form.gravidade * form.urgencia * form.tendencia).badgeClass}`} style={{ marginLeft: 'auto' }}>
                {getPriorityInfo(form.gravidade * form.urgencia * form.tendencia).label}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
              <button className="btn btn--primary" onClick={addItem}>Adicionar</button>
              <button className="btn btn--ghost" onClick={() => setForm({ problema: '', gravidade: 1, urgencia: 1, tendencia: 1 })}>Cancelar</button>
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Ranking de Problemas</h2>
        </div>
        <div className="card-body">
          {items.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum problema cadastrado</h3>
              <p>Adicione problemas para priorizar ações.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Problema</th>
                    <th>G</th>
                    <th>U</th>
                    <th>T</th>
                    <th>Score</th>
                    <th>Prioridade</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => {
                    const priority = getPriorityInfo(item.score)
                    const scorePercent = (item.score / maxScore) * 100
                    return (
                      <tr key={item.id}>
                        <td>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            fontSize: 'var(--text-sm)',
                            fontWeight: 'var(--font-bold)',
                            color: getRankColor(index),
                            background: index < 3 ? `${getRankColor(index)}15` : 'transparent',
                          }}>
                            {index + 1}
                          </span>
                        </td>
                        <td>
                          <div>
                            <strong style={{ fontSize: 'var(--text-sm)' }}>{item.problema}</strong>
                            <div className="gut-score-bar">
                              <div
                                className="gut-score-fill"
                                style={{ width: `${scorePercent}%`, background: `linear-gradient(90deg, ${priority.color}, ${priority.color}88)` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--color-error-bg)', color: 'var(--color-error)',
                            fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
                          }}>{item.gravidade}</span>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--color-warning-bg)', color: 'var(--color-warning)',
                            fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
                          }}>{item.urgencia}</span>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                            width: 26, height: 26, borderRadius: '50%',
                            background: 'var(--color-info-bg)', color: 'var(--color-info)',
                            fontSize: 'var(--text-xs)', fontWeight: 'var(--font-semibold)',
                          }}>{item.tendencia}</span>
                        </td>
                        <td>
                          <span style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--font-bold)', color: priority.color }}>
                            {item.score}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${priority.badgeClass}`}>{priority.label}</span>
                        </td>
                        <td>
                          <button className="btn btn--ghost btn--sm" onClick={() => removeItem(item.id)} aria-label="Remover">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
