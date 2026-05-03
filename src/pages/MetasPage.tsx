import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePageTitle } from '@/hooks/useTheme'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

interface Meta {
  id: string
  nome: string
  tipo: string
  valorMeta: number
  valorAtual: number
  unidade: string
  responsavel: string
  prazo: string
  status: string
}

export function MetasPage() {
  usePageTitle('Metas & KPIs')
  const [metas, setMetas] = useState<Meta[]>(() => {
    const saved = localStorage.getItem('insightpro_metas')
    return saved ? JSON.parse(saved) : []
  })

  const [form, setForm] = useState({ nome: '', tipo: 'comercial', valorMeta: 0, valorAtual: 0, unidade: 'R$', responsavel: '', prazo: '' })

  const saveMetas = (data: Meta[]) => {
    setMetas(data)
    localStorage.setItem('insightpro_metas', JSON.stringify(data))
  }

  const addMeta = () => {
    if (!form.nome.trim()) return
    const meta: Meta = { id: Date.now().toString(), ...form, status: 'em_andamento' }
    saveMetas([...metas, meta])
    setForm({ nome: '', tipo: 'comercial', valorMeta: 0, valorAtual: 0, unidade: 'R$', responsavel: '', prazo: '' })
  }

  const removeMeta = (id: string) => saveMetas(metas.filter(m => m.id !== id))

  const formatValue = (value: number, unidade: string) => {
    if (unidade === 'R$') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
    if (unidade === '%') return `${value}%`
    return `${value.toLocaleString('pt-BR')} ${unidade}`
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'concluido': return 'badge--success'
      case 'atrasado': return 'badge--error'
      case 'em_andamento': return 'badge--info'
      default: return 'badge--neutral'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'concluido': return 'Concluida'
      case 'atrasado': return 'Atrasada'
      case 'em_andamento': return 'Em Andamento'
      default: return status
    }
  }

  const getTipoBadge = (tipo: string) => {
    const map: Record<string, string> = {
      financeiro: 'badge--success',
      comercial: 'badge--info',
      expansao: 'badge--warning',
      qualidade: 'badge--info',
      produto: 'badge--info',
      tecnologia: 'badge--info',
      operacional: 'badge--neutral',
    }
    return map[tipo] || 'badge--neutral'
  }

  const metasEmAndamento = metas.filter(m => m.status !== 'concluido')
  const metasConcluidas = metas.filter(m => m.status === 'concluido')
  const mediaProgresso = metas.length > 0
    ? metas.reduce((sum, m) => sum + Math.min(100, (m.valorAtual / m.valorMeta) * 100), 0) / metas.length
    : 0

  const progressChartData = {
    labels: metasEmAndamento.map(m => m.nome.length > 25 ? m.nome.substring(0, 25) + '...' : m.nome),
    datasets: [
      {
        label: 'Alcancado (%)',
        data: metasEmAndamento.map(m => Math.min(100, Math.round((m.valorAtual / m.valorMeta) * 100))),
        backgroundColor: metasEmAndamento.map(m => m.status === 'atrasado' ? 'rgba(239, 68, 68, 0.7)' : 'rgba(34, 197, 94, 0.7)'),
        borderColor: metasEmAndamento.map(m => m.status === 'atrasado' ? '#ef4444' : '#16a34a'),
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    scales: { x: { min: 0, max: 100, ticks: { callback: (v: string | number) => v + '%' } } },
    plugins: { legend: { display: false } },
  }

  return (
    <AppLayout title="Metas & KPIs" subtitle="Definicao e acompanhamento de metas comerciais e operacionais">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total de Metas</div>
          <div className="kpi-value">{metas.length}</div>
          <div className="kpi-trend positive">{metasConcluidas.length} concluidas</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Progresso Medio</div>
          <div className="kpi-value">{mediaProgresso.toFixed(0)}%</div>
          <div className="kpi-trend" style={{ color: mediaProgresso >= 50 ? 'var(--color-success)' : 'var(--color-warning)' }}>
            {metasEmAndamento.length} em andamento
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Metas Atrasadas</div>
          <div className="kpi-value" style={{ color: 'var(--color-error)' }}>{metas.filter(m => m.status === 'atrasado').length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Metas Concluidas</div>
          <div className="kpi-value" style={{ color: 'var(--color-success)' }}>{metasConcluidas.length}</div>
        </div>
      </div>

      {metasEmAndamento.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h2>Progresso das Metas</h2>
          </div>
          <div className="card-body">
            <div style={{ height: 300 }}>
              <Bar data={progressChartData} options={chartOptions} />
            </div>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h2>Adicionar Meta</h2>
        </div>
        <div className="card-body">
          <div className="form-grid form-grid-3" style={{ marginBottom: 'var(--space-4)' }}>
            <div className="form-group">
              <label className="form-label">Nome da Meta</label>
              <input type="text" className="form-control" placeholder="Ex: Aumentar faturamento em 20%" value={form.nome} onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Tipo</label>
              <select className="form-control" value={form.tipo} onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value }))}>
                <option value="comercial">Comercial</option>
                <option value="financeiro">Financeiro</option>
                <option value="expansao">Expansao</option>
                <option value="qualidade">Qualidade</option>
                <option value="produto">Produto</option>
                <option value="tecnologia">Tecnologia</option>
                <option value="operacional">Operacional</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Responsavel</label>
              <input type="text" className="form-control" placeholder="Ex: Diretoria Comercial" value={form.responsavel} onChange={e => setForm(prev => ({ ...prev, responsavel: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Valor da Meta</label>
              <input type="number" className="form-control" value={form.valorMeta || ''} onChange={e => setForm(prev => ({ ...prev, valorMeta: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Valor Atual</label>
              <input type="number" className="form-control" value={form.valorAtual || ''} onChange={e => setForm(prev => ({ ...prev, valorAtual: Number(e.target.value) }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Unidade</label>
              <select className="form-control" value={form.unidade} onChange={e => setForm(prev => ({ ...prev, unidade: e.target.value }))}>
                <option value="R$">R$</option>
                <option value="%">%</option>
                <option value="clientes">Clientes</option>
                <option value="estados">Estados</option>
                <option value="pontos">Pontos</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Prazo</label>
              <input type="date" className="form-control" value={form.prazo} onChange={e => setForm(prev => ({ ...prev, prazo: e.target.value }))} />
            </div>
          </div>
          <button className="btn btn--primary" onClick={addMeta}>Adicionar Meta</button>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Todas as Metas</h2>
        </div>
        <div className="card-body">
          {metas.length === 0 ? (
            <div className="empty-state"><h3>Nenhuma meta cadastrada</h3><p>Adicione metas para acompanhar o progresso da sua operacao.</p></div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Meta</th>
                    <th>Tipo</th>
                    <th>Meta</th>
                    <th>Atual</th>
                    <th>Progresso</th>
                    <th>Responsavel</th>
                    <th>Prazo</th>
                    <th>Status</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {metas.map(m => {
                    const progress = Math.min(100, Math.round((m.valorAtual / m.valorMeta) * 100))
                    return (
                      <tr key={m.id}>
                        <td><strong>{m.nome}</strong></td>
                        <td><span className={`badge ${getTipoBadge(m.tipo)}`}>{m.tipo}</span></td>
                        <td>{formatValue(m.valorMeta, m.unidade)}</td>
                        <td>{formatValue(m.valorAtual, m.unidade)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${progress}%`, height: '100%', background: m.status === 'atrasado' ? 'var(--color-error)' : progress >= 80 ? 'var(--color-success)' : 'var(--color-info)', borderRadius: 4, transition: 'width 0.3s' }} />
                            </div>
                            <span style={{ fontSize: 'var(--text-sm)', minWidth: 36, textAlign: 'right' }}>{progress}%</span>
                          </div>
                        </td>
                        <td>{m.responsavel}</td>
                        <td>{new Date(m.prazo).toLocaleDateString('pt-BR')}</td>
                        <td><span className={`badge ${getStatusBadge(m.status)}`}>{getStatusLabel(m.status)}</span></td>
                        <td>
                          <button className="btn btn--ghost btn--sm" onClick={() => removeMeta(m.id)} aria-label="Remover">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
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
    </AppLayout>
  )
}
