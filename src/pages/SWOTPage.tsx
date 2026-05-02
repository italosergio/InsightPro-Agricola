import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePageTitle } from '@/hooks/useTheme'

interface SwotItem {
  id: string
  text: string
}

interface SwotData {
  strengths: SwotItem[]
  weaknesses: SwotItem[]
  opportunities: SwotItem[]
  threats: SwotItem[]
}

export function SWOTPage() {
  usePageTitle('Analise SWOT')
  const [swotData, setSwotData] = useState<SwotData>(() => {
    const saved = localStorage.getItem('insightpro_swot')
    return saved ? JSON.parse(saved) : { strengths: [], weaknesses: [], opportunities: [], threats: [] }
  })

  const [newItem, setNewItem] = useState<Record<string, string>>({
    strengths: '',
    weaknesses: '',
    opportunities: '',
    threats: '',
  })

  const saveSwot = (data: SwotData) => {
    setSwotData(data)
    localStorage.setItem('insightpro_swot', JSON.stringify(data))
  }

  const addItem = (category: keyof SwotData) => {
    if (!newItem[category].trim()) return
    const item: SwotItem = { id: Date.now().toString(), text: newItem[category] }
    const updated = { ...swotData, [category]: [...swotData[category], item] }
    saveSwot(updated)
    setNewItem(prev => ({ ...prev, [category]: '' }))
  }

  const removeItem = (category: keyof SwotData, id: string) => {
    const updated = { ...swotData, [category]: swotData[category].filter(i => i.id !== id) }
    saveSwot(updated)
  }

  const sections: { key: keyof SwotData; title: string; cssClass: string }[] = [
    { key: 'strengths', title: 'Forcas (Strengths)', cssClass: 'swot-card--strengths' },
    { key: 'weaknesses', title: 'Fraquezas (Weaknesses)', cssClass: 'swot-card--weaknesses' },
    { key: 'opportunities', title: 'Oportunidades (Opportunities)', cssClass: 'swot-card--opportunities' },
    { key: 'threats', title: 'Ameacas (Threats)', cssClass: 'swot-card--threats' },
  ]

  return (
    <AppLayout title="Analise SWOT" subtitle="Matriz de forcas, fraquezas, oportunidades e ameacas">
      <div className="swot-grid">
        {sections.map(({ key, title, cssClass }) => (
          <div key={key} className={`swot-card ${cssClass}`}>
            <h4>{title}</h4>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {swotData[key].map(item => (
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
                placeholder="Adicionar item..."
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
