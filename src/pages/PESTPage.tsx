import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePageTitle } from '@/hooks/useTheme'

interface PestItem {
  id: string
  text: string
}

interface PestData {
  political: PestItem[]
  economic: PestItem[]
  social: PestItem[]
  technological: PestItem[]
}

export function PESTPage() {
  usePageTitle('Analise PEST')
  const [pestData, setPestData] = useState<PestData>(() => {
    const saved = localStorage.getItem('insightpro_pest')
    return saved ? JSON.parse(saved) : { political: [], economic: [], social: [], technological: [] }
  })

  const [newItem, setNewItem] = useState<Record<string, string>>({
    political: '',
    economic: '',
    social: '',
    technological: '',
  })

  const savePest = (data: PestData) => {
    setPestData(data)
    localStorage.setItem('insightpro_pest', JSON.stringify(data))
  }

  const addItem = (category: keyof PestData) => {
    if (!newItem[category].trim()) return
    const item: PestItem = { id: Date.now().toString(), text: newItem[category] }
    const updated = { ...pestData, [category]: [...pestData[category], item] }
    savePest(updated)
    setNewItem(prev => ({ ...prev, [category]: '' }))
  }

  const removeItem = (category: keyof PestData, id: string) => {
    const updated = { ...pestData, [category]: pestData[category].filter(i => i.id !== id) }
    savePest(updated)
  }

  const sections: { key: keyof PestData; title: string; cssClass: string; color: string }[] = [
    { key: 'political', title: 'Politico (Political)', cssClass: 'swot-card--opportunities', color: 'var(--color-info)' },
    { key: 'economic', title: 'Economico (Economic)', cssClass: 'swot-card--strengths', color: 'var(--color-success)' },
    { key: 'social', title: 'Social (Social)', cssClass: 'swot-card--weaknesses', color: 'var(--color-error)' },
    { key: 'technological', title: 'Tecnologico (Technological)', cssClass: 'swot-card--threats', color: 'var(--color-warning)' },
  ]

  return (
    <AppLayout title="Analise PEST" subtitle="Factores externos Politicos, Economicos, Sociais e Tecnologicos">
      <div className="swot-grid">
        {sections.map(({ key, title, cssClass }) => (
          <div key={key} className={`swot-card ${cssClass}`}>
            <h4>{title}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {pestData[key].map(item => (
                <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) 0', borderBottom: '1px solid var(--border-primary)' }}>
                  <span>{item.text}</span>
                  <button className="btn btn--ghost btn--sm" onClick={() => removeItem(key, item.id)} aria-label={`Remover ${item.text}`}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
              <input
                type="text"
                className="form-control"
                placeholder="Adicionar factor..."
                value={newItem[key]}
                onChange={e => setNewItem(prev => ({ ...prev, [key]: e.target.value }))}
                onKeyDown={e => e.key === 'Enter' && addItem(key)}
              />
              <button className="btn btn--primary btn--sm" onClick={() => addItem(key)}>+</button>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  )
}
