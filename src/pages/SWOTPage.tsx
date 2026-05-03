import { useState } from 'react'
import { usePageTitle } from '@/hooks/useTheme'

interface SwotItem {
  id: string
  text: string
}

type QuadrantKey = 'strengths' | 'weaknesses' | 'opportunities' | 'threats'

interface SwotData {
  strengths: SwotItem[]
  weaknesses: SwotItem[]
  opportunities: SwotItem[]
  threats: SwotItem[]
}

const quadrants: { key: QuadrantKey; title: string; subtitle: string; icon: string; color: string; borderColor: string; cssMod: string }[] = [
  { key: 'strengths', title: 'Forças', subtitle: 'Pontos fortes internos', icon: '💪', color: '#22c55e', borderColor: '#22c55e', cssMod: 'green' },
  { key: 'weaknesses', title: 'Fraquezas', subtitle: 'Pontos fracos internos', icon: '⚠️', color: '#ef4444', borderColor: '#ef4444', cssMod: 'red' },
  { key: 'opportunities', title: 'Oportunidades', subtitle: 'Fatores externos positivos', icon: '🚀', color: '#3b82f6', borderColor: '#3b82f6', cssMod: 'blue' },
  { key: 'threats', title: 'Ameaças', subtitle: 'Fatores externos negativos', icon: '⚡', color: '#f59e0b', borderColor: '#f59e0b', cssMod: 'amber' },
]

export function SWOTPage() {
  usePageTitle('Análise SWOT')
  const [swotData, setSwotData] = useState<SwotData>(() => {
    const saved = localStorage.getItem('insightpro_swot')
    return saved ? JSON.parse(saved) : { strengths: [], weaknesses: [], opportunities: [], threats: [] }
  })

  const [newItem, setNewItem] = useState<Record<QuadrantKey, string>>({
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
  })

  const saveSwot = (data: SwotData) => {
    setSwotData(data)
    localStorage.setItem('insightpro_swot', JSON.stringify(data))
  }

  const addItem = (category: QuadrantKey) => {
    if (!newItem[category].trim()) return
    const item: SwotItem = { id: Date.now().toString(), text: newItem[category] }
    const updated = { ...swotData, [category]: [...swotData[category], item] }
    saveSwot(updated)
    setNewItem(prev => ({ ...prev, [category]: '' }))
  }

  const removeItem = (category: QuadrantKey, id: string) => {
    const updated = { ...swotData, [category]: swotData[category].filter(i => i.id !== id) }
    saveSwot(updated)
  }

  const totalItems = quadrants.reduce((sum, q) => sum + swotData[q.key].length, 0)
  const positivos = swotData.strengths.length + swotData.opportunities.length
  const aMitigar = swotData.weaknesses.length + swotData.threats.length

  return (
    <>
      <div style={{ position: 'relative', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', marginBottom: 'var(--space-8)' }}>
        <div className="page-hero-bg page-hero-bg--green" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <div className="page-hero-eyebrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Análise SWOT
            </div>
            <h1 className="page-hero-title">Matriz SWOT</h1>
            <p className="page-hero-subtitle">Forças, Fraquezas, Oportunidades e Ameaças do seu negócio agrícola</p>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{totalItems}</span>
              <span className="page-hero-kpi-label">Itens Mapeados</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value" style={{ color: '#4ade80' }}>{positivos}</span>
              <span className="page-hero-kpi-label">Positivos</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value" style={{ color: '#f87171' }}>{aMitigar}</span>
              <span className="page-hero-kpi-label">A Mitigar</span>
            </div>
          </div>
        </div>
      </div>

      <div className="matrix-grid">
        {quadrants.map(({ key, title, subtitle, icon, color, borderColor, cssMod }) => (
          <div key={key} className={`matrix-quadrant matrix-quadrant--${cssMod}`} style={{ borderTop: `3px solid ${borderColor}` }}>
            <div className="matrix-quadrant-header">
              <div className={`matrix-quadrant-icon matrix-quadrant--${cssMod}`}>
                {icon}
              </div>
              <div>
                <h3 className="matrix-quadrant-title">{title}</h3>
                <p className="matrix-quadrant-subtitle">{subtitle}</p>
              </div>
              <span className="badge badge--neutral" style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)' }}>
                {swotData[key].length}
              </span>
            </div>

            {swotData[key].length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', padding: 'var(--space-6) var(--space-4)', textAlign: 'center' }}>
                Nenhum item adicionado
              </div>
            ) : (
              <ul className="matrix-item-list">
                {swotData[key].map(item => (
                  <li key={item.id} className="matrix-item">
                    <span style={{ color, flexShrink: 0, lineHeight: 1.4 }}>▶</span>
                    <span className="matrix-item-text">{item.text}</span>
                    <button className="matrix-item-remove" onClick={() => removeItem(key, item.id)} aria-label={`Remover ${item.text}`}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}>
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div className="matrix-add-row">
              <input
                type="text"
                className="form-control"
                placeholder="Adicionar item..."
                value={newItem[key]}
                onChange={e => setNewItem(prev => ({ ...prev, [key]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addItem(key)}
              />
              <button
                className="btn btn--sm"
                style={{ background: color, borderColor: color, color: '#fff', flexShrink: 0 }}
                onClick={() => addItem(key)}
              >
                Adicionar
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
