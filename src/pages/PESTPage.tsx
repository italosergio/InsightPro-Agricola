import { useState } from 'react'
import { usePageTitle } from '@/hooks/useTheme'
import { DownloadReportButton } from '@/lib/downloadUtils'

interface PestItem {
  id: string
  text: string
}

type QuadrantKey = 'political' | 'economic' | 'social' | 'technological'

interface PestData {
  political: PestItem[]
  economic: PestItem[]
  social: PestItem[]
  technological: PestItem[]
}

const quadrants: { key: QuadrantKey; letter: string; title: string; subtitle: string; icon: string; color: string; borderColor: string; cssMod: string; examples: string[] }[] = [
  {
    key: 'political', letter: 'P', title: 'Político', subtitle: 'Legislação, políticas e regulação',
    icon: '🏛️', color: '#3b82f6', borderColor: '#3b82f6', cssMod: 'blue',
    examples: ['Legislação ambiental', 'Política agrícola', 'Regulação de agrotóxicos', 'Acordos comerciais'],
  },
  {
    key: 'economic', letter: 'E', title: 'Econômico', subtitle: 'Mercado, preços e financiamento',
    icon: '💰', color: '#22c55e', borderColor: '#22c55e', cssMod: 'green',
    examples: ['Preço das commodities', 'Taxa de câmbio', 'Custo de insumos', 'Crédito rural'],
  },
  {
    key: 'social', letter: 'S', title: 'Social', subtitle: 'Demografia, cultura e consumo',
    icon: '👥', color: '#ef4444', borderColor: '#ef4444', cssMod: 'red',
    examples: ['Mudança de hábitos', 'Envelhecimento rural', 'Demanda por orgânicos', 'Êxodo rural'],
  },
  {
    key: 'technological', letter: 'T', title: 'Tecnológico', subtitle: 'Inovação, automação e digital',
    icon: '🔬', color: '#8b5cf6', borderColor: '#8b5cf6', cssMod: 'purple',
    examples: ['Agricultura de precisão', 'Drones e sensores', 'Biotecnologia', 'IoT no campo'],
  },
]

export function PESTPage() {
  usePageTitle('Análise PEST')
  const [pestData, setPestData] = useState<PestData>(() => {
    const saved = localStorage.getItem('insightpro_pest')
    return saved ? JSON.parse(saved) : { political: [], economic: [], social: [], technological: [] }
  })

  const [newItem, setNewItem] = useState<Record<QuadrantKey, string>>({
    political: '',
    economic: '',
    social: '',
    technological: '',
  })

  const savePest = (data: PestData) => {
    setPestData(data)
    localStorage.setItem('insightpro_pest', JSON.stringify(data))
  }

  const addItem = (category: QuadrantKey) => {
    if (!newItem[category].trim()) return
    const item: PestItem = { id: Date.now().toString(), text: newItem[category] }
    const updated = { ...pestData, [category]: [...pestData[category], item] }
    savePest(updated)
    setNewItem(prev => ({ ...prev, [category]: '' }))
  }

  const addExample = (category: QuadrantKey, text: string) => {
    if (pestData[category].some(i => i.text === text)) return
    const item: PestItem = { id: Date.now().toString(), text }
    const updated = { ...pestData, [category]: [...pestData[category], item] }
    savePest(updated)
  }

  const removeItem = (category: QuadrantKey, id: string) => {
    const updated = { ...pestData, [category]: pestData[category].filter(i => i.id !== id) }
    savePest(updated)
  }

  const totalFactors = quadrants.reduce((sum, q) => sum + pestData[q.key].length, 0)

  const downloadData = quadrants.flatMap(q =>
    pestData[q.key].map(item => ({
      quadrante: q.title,
      id: item.id,
      texto: item.text,
    }))
  )

  return (
    <>
      <div style={{ position: 'relative', borderRadius: 'var(--radius-2xl)', overflow: 'hidden', marginBottom: 'var(--space-8)' }}>
        <div className="page-hero-bg page-hero-bg--blue" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <div className="page-hero-eyebrow">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><path d="M21 12a9 9 0 1 1-9-9"/><path d="M15 9h-1a2 2 0 0 0-2 2v1a2 2 0 0 0 2 2h1a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-1"/></svg>
              Análise PEST
            </div>
            <h1 className="page-hero-title">Análise PEST</h1>
            <p className="page-hero-subtitle">Fatores Políticos, Econômicos, Sociais e Tecnológicos do ambiente externo</p>
            <DownloadReportButton data={downloadData} filename="pest.csv" />
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{totalFactors}</span>
              <span className="page-hero-kpi-label">Fatores Mapeados</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value" style={{ color: '#60a5fa' }}>{pestData.political.length}</span>
              <span className="page-hero-kpi-label">Político (P)</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value" style={{ color: '#4ade80' }}>{pestData.economic.length}</span>
              <span className="page-hero-kpi-label">Econômico (E)</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value" style={{ color: '#f87171' }}>{pestData.social.length}</span>
              <span className="page-hero-kpi-label">Social (S)</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value" style={{ color: '#a78bfa' }}>{pestData.technological.length}</span>
              <span className="page-hero-kpi-label">Tecnológico (T)</span>
            </div>
          </div>
        </div>
      </div>

      <div className="matrix-grid">
        {quadrants.map(({ key, letter, title, subtitle, icon, color, borderColor, cssMod, examples }) => (
          <div key={key} className={`matrix-quadrant matrix-quadrant--${cssMod}`} style={{ borderTop: `3px solid ${borderColor}` }}>
            <div className="matrix-quadrant-header">
              <div className={`matrix-quadrant-icon matrix-quadrant--${cssMod}`}>
                <span style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--font-bold)', lineHeight: 1 }}>{letter}</span>
              </div>
              <div>
                <h3 className="matrix-quadrant-title">{icon} {title}</h3>
                <p className="matrix-quadrant-subtitle">{subtitle}</p>
              </div>
              <span className="badge badge--neutral" style={{ marginLeft: 'auto', fontSize: 'var(--text-xs)' }}>
                {pestData[key].length}
              </span>
            </div>

            {pestData[key].length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)', fontSize: 'var(--text-sm)', padding: 'var(--space-6) var(--space-4)', textAlign: 'center' }}>
                Nenhum fator adicionado
              </div>
            ) : (
              <ul className="matrix-item-list">
                {pestData[key].map(item => (
                  <li key={item.id} className="matrix-item">
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%', background: color,
                      flexShrink: 0, marginTop: 5,
                    }} />
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

            <div style={{ marginTop: 'auto', paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-primary)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginBottom: 'var(--space-2)' }}>
                Exemplos rápidos:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-1)' }}>
                {examples.map(ex => (
                  <button
                    key={ex}
                    className="btn btn--sm"
                    disabled={pestData[key].some(i => i.text === ex)}
                    onClick={() => addExample(key, ex)}
                    style={{
                      fontSize: 'var(--text-xs)',
                      padding: '2px var(--space-2)',
                      background: pestData[key].some(i => i.text === ex) ? 'var(--bg-tertiary)' : `${color}12`,
                      borderColor: pestData[key].some(i => i.text === ex) ? 'transparent' : `${color}30`,
                      color: pestData[key].some(i => i.text === ex) ? 'var(--text-tertiary)' : color,
                      cursor: pestData[key].some(i => i.text === ex) ? 'default' : 'pointer',
                      opacity: pestData[key].some(i => i.text === ex) ? 0.5 : 1,
                    }}
                  >
                    + {ex}
                  </button>
                ))}
              </div>
            </div>

            <div className="matrix-add-row">
              <input
                type="text"
                className="form-control"
                placeholder="Adicionar fator..."
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
