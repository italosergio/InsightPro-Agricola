import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePageTitle } from '@/hooks/useTheme'

interface GutItem {
  id: string
  problema: string
  gravidade: number
  urgencia: number
  tendencia: number
  score: number
}

export function GUTPage() {
  usePageTitle('Matriz GUT')
  const [items, setItems] = useState<GutItem[]>(() => {
    const saved = localStorage.getItem('insightpro_gut')
    return saved ? JSON.parse(saved) : []
  })

  const [form, setForm] = useState({ problema: '', gravidade: 1, urgencia: 1, tendencia: 1 })

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

  const getPriorityBadge = (score: number) => {
    if (score >= 20) return 'badge--error'
    if (score >= 10) return 'badge--warning'
    return 'badge--info'
  }

  return (
    <AppLayout title="Matriz GUT" subtitle="Gravidade, Urgencia e Tendencia">
      <div className="card">
        <div className="card-header">
          <h2>Adicionar Problema</h2>
        </div>
        <div className="card-body">
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label">Problema</label>
              <input
                type="text"
                className="form-control"
                value={form.problema}
                onChange={e => setForm(prev => ({ ...prev, problema: e.target.value }))}
                placeholder="Descreva o problema"
              />
            </div>
            {(['gravidade', 'urgencia', 'tendencia'] as const).map(field => (
              <div className="form-group" key={field}>
                <label className="form-label">
                  {field === 'gravidade' ? 'Gravidade' : field === 'urgencia' ? 'Urgencia' : 'Tendencia'}
                  <span className="form-label-hint"> (1-5)</span>
                </label>
                <input
                  type="number"
                  className="form-control"
                  min={1}
                  max={5}
                  value={form[field]}
                  onChange={e => setForm(prev => ({ ...prev, [field]: Math.min(5, Math.max(1, Number(e.target.value))) }))}
                />
              </div>
            ))}
          </div>
          <button className="btn btn--primary" onClick={addItem}>Adicionar</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Ranking de Problemas</h2>
        </div>
        <div className="card-body">
          {items.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum problema cadastrado</h3>
              <p>Adicione problemas para priorizar acoes.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Problema</th>
                    <th>Gravidade</th>
                    <th>Urgencia</th>
                    <th>Tendencia</th>
                    <th>Score</th>
                    <th>Prioridade</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.problema}</td>
                      <td>{item.gravidade}</td>
                      <td>{item.urgencia}</td>
                      <td>{item.tendencia}</td>
                      <td><strong>{item.score}</strong></td>
                      <td>
                        <span className={`badge ${getPriorityBadge(item.score)}`}>
                          {item.score >= 20 ? 'Critica' : item.score >= 10 ? 'Alta' : 'Media'}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn--ghost btn--sm" onClick={() => removeItem(item.id)} aria-label="Remover">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                          </svg>
                        </button>
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
