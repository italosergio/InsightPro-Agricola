import { useState, useMemo } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useTheme } from '@/store/ThemeContext'
import { usePageTitle } from '@/hooks/useTheme'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

function buildHCTheme(theme: 'light' | 'dark') {
  const isDark = theme === 'dark'
  return {
    chart: {
      backgroundColor: 'transparent',
      style: { fontFamily: 'Inter, system-ui, sans-serif' },
      animation: { duration: 1000, easing: 'easeOutQuart' },
    },
    title: { style: { color: isDark ? '#fafaf9' : '#1c1917', fontSize: '16px', fontWeight: '600' } },
    legend: {
      itemStyle: { color: isDark ? '#a8a29e' : '#57534e', fontSize: '12px' },
      itemHoverStyle: { color: isDark ? '#fafaf9' : '#1c1917' },
    },
    xAxis: {
      labels: { style: { color: isDark ? '#a8a29e' : '#78716c', fontSize: '11px' } },
      lineColor: isDark ? '#292524' : '#e7e5e4',
      tickColor: isDark ? '#292524' : '#e7e5e4',
      gridLineColor: isDark ? '#292524' : '#f5f5f4',
      title: { style: { color: isDark ? '#a8a29e' : '#78716c' } },
    },
    yAxis: {
      labels: { style: { color: isDark ? '#a8a29e' : '#78716c', fontSize: '11px' } },
      lineColor: isDark ? '#292524' : '#e7e5e4',
      tickColor: isDark ? '#292524' : '#e7e5e4',
      gridLineColor: isDark ? '#292524' : '#f5f5f4',
      title: { style: { color: isDark ? '#a8a29e' : '#78716c' } },
    },
    tooltip: {
      backgroundColor: isDark ? '#292524' : '#ffffff',
      borderColor: isDark ? '#44403c' : '#e7e5e4',
      style: { color: isDark ? '#fafaf9' : '#1c1917', fontSize: '12px' },
    },
    plotOptions: {
      series: { animation: { duration: 1000, easing: 'easeOutQuart' } },
      bar: { borderRadius: 4 },
      column: { borderRadius: 4 },
    },
    credits: { enabled: false },
  }
}

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

const tipoColors: Record<string, string> = {
  financeiro: 'badge--success',
  comercial: 'badge--info',
  expansao: 'badge--warning',
  qualidade: 'badge--info',
  produto: 'badge--info',
  tecnologia: 'badge--info',
  operacional: 'badge--neutral',
}

const tipos: { value: string; label: string }[] = [
  { value: 'comercial', label: 'Comercial' },
  { value: 'financeiro', label: 'Financeiro' },
  { value: 'expansao', label: 'Expansão' },
  { value: 'qualidade', label: 'Qualidade' },
  { value: 'produto', label: 'Produto' },
  { value: 'tecnologia', label: 'Tecnologia' },
  { value: 'operacional', label: 'Operacional' },
]

const unidades: { value: string; label: string }[] = [
  { value: 'R$', label: 'R$' },
  { value: '%', label: '%' },
  { value: 'clientes', label: 'Clientes' },
  { value: 'estados', label: 'Estados' },
  { value: 'pontos', label: 'Pontos' },
]

function formatValue(value: number, unidade: string) {
  if (unidade === 'R$') return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)
  if (unidade === '%') return `${value}%`
  return `${value.toLocaleString('pt-BR')} ${unidade}`
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'concluida': return 'badge--success'
    case 'atrasada': return 'badge--error'
    case 'em_andamento': return 'badge--info'
    default: return 'badge--neutral'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'concluida': return 'Concluída'
    case 'atrasada': return 'Atrasada'
    case 'em_andamento': return 'Em Andamento'
    default: return status
  }
}

export function MetasPage() {
  const { theme } = useTheme()
  usePageTitle('Metas & KPIs')
  const hcTheme = useMemo(() => buildHCTheme(theme), [theme])

  const [metas, setMetas] = useState<Meta[]>(() => {
    const saved = localStorage.getItem('insightpro_metas')
    return saved ? JSON.parse(saved) : []
  })

  const [showForm, setShowForm] = useState(false)
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
    setShowForm(false)
  }

  const removeMeta = (id: string) => saveMetas(metas.filter(m => m.id !== id))

  const updateStatus = (id: string, status: string) => {
    saveMetas(metas.map(m => m.id === id ? { ...m, status } : m))
  }

  const metasEmAndamento = metas.filter(m => m.status !== 'concluida')
  const metasConcluidas = metas.filter(m => m.status === 'concluida')
  const metasAtrasadas = metas.filter(m => m.status === 'atrasada')

  const mediaProgresso = metas.length > 0
    ? metas.reduce((sum, m) => {
      if (m.valorMeta > 0) return sum + Math.min(100, (m.valorAtual / m.valorMeta) * 100)
      return sum
    }, 0) / metas.length
    : 0

  const chartHeight = Math.max(280, metasEmAndamento.length * 44)

  const progressChartOptions = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'bar', height: chartHeight },
    title: { text: undefined },
    xAxis: {
      ...hcTheme.xAxis,
      categories: metasEmAndamento.map(m => m.nome.length > 30 ? m.nome.substring(0, 30) + '…' : m.nome),
      reversed: false,
    },
    yAxis: {
      ...hcTheme.yAxis,
      title: { text: undefined },
      min: 0,
      max: 100,
      labels: {
        ...hcTheme.yAxis?.labels,
        formatter: function () { return `${this.value}%` },
      },
    },
    tooltip: {
      ...hcTheme.tooltip,
      pointFormatter: function () {
        const meta = metasEmAndamento[this.index]
        return `<b>${this.y}%</b><br/>${meta ? formatValue(meta.valorAtual, meta.unidade) : ''} / ${meta ? formatValue(meta.valorMeta, meta.unidade) : ''}`
      },
    },
    plotOptions: {
      ...hcTheme.plotOptions,
      bar: {
        ...hcTheme.plotOptions?.bar,
        dataLabels: {
          enabled: true,
          format: '{y}%',
          style: { fontSize: '11px', fontWeight: '600', textOutline: 'none' },
          color: theme === 'dark' ? '#d6d3d1' : '#57534e',
        },
      },
    },
    series: [{
      type: 'bar',
      name: 'Progresso',
      data: metasEmAndamento.map(m => {
        const progress = m.valorMeta > 0 ? Math.min(100, Math.round((m.valorAtual / m.valorMeta) * 100)) : 0
        const color = m.status === 'atrasada' ? '#ef4444' : progress >= 80 ? '#22c55e' : '#3b82f6'
        return { y: progress, color }
      }),
      showInLegend: false,
    }],
  }), [metasEmAndamento, hcTheme, theme, chartHeight])

  return (
    <AppLayout title="Metas & KPIs" subtitle="Definição e acompanhamento de metas comerciais e operacionais">
      {metas.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" />
              </svg>
              <h3>Nenhuma meta cadastrada</h3>
              <p>Adicione metas para acompanhar o progresso da sua operação.</p>
              <button className="btn btn--primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => setShowForm(true)}>
                Nova Meta
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="dash-hero" style={{ minHeight: 220 }}>
            <div
              className="dash-hero-bg"
              style={{
                background: 'linear-gradient(135deg, #14532d 0%, #15803d 40%, #16a34a 75%, #22c55e 100%)',
              }}
            />
            <div className="dash-hero-content">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-1) var(--space-3)', background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                Metas & KPIs
              </div>
              <h1 style={{ color: '#fff', fontSize: 'var(--text-3xl)', fontWeight: 700, marginTop: 'var(--space-3)', letterSpacing: '-0.02em' }}>
                Acompanhamento de Metas
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-5)', color: '#fff', minWidth: 110 }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{metas.length}</div>
                  <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8, marginTop: 2 }}>Total</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-5)', color: '#fff', minWidth: 110 }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{mediaProgresso.toFixed(0)}%</div>
                  <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8, marginTop: 2 }}>Progresso Médio</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-5)', color: '#fff', minWidth: 110 }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{metasConcluidas.length}</div>
                  <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8, marginTop: 2 }}>Concluídas</div>
                </div>
              </div>
            </div>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Total de Metas</div>
              <div className="kpi-value">{metas.length}</div>
              <div className="kpi-trend positive">{metasConcluidas.length} concluídas</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Progresso Médio</div>
              <div className="kpi-value">{mediaProgresso.toFixed(0)}%</div>
              <div style={{ marginTop: 'var(--space-3)', height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ width: `${mediaProgresso}%`, height: '100%', background: mediaProgresso >= 80 ? 'var(--color-success)' : mediaProgresso >= 50 ? 'var(--color-warning)' : 'var(--color-error)', borderRadius: 4, transition: 'width 0.3s' }} />
              </div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Em Andamento</div>
              <div className="kpi-value" style={{ color: 'var(--color-info)' }}>{metas.filter(m => m.status === 'em_andamento').length}</div>
              <div className="kpi-trend">{metasEmAndamento.length} ativas</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Atrasadas</div>
              <div className="kpi-value" style={{ color: metasAtrasadas.length > 0 ? 'var(--color-error)' : undefined }}>{metasAtrasadas.length}</div>
              <div className="kpi-trend" style={{ color: metasAtrasadas.length > 0 ? 'var(--color-error)' : undefined }}>{metasAtrasadas.length > 0 ? 'Atenção necessária' : 'Nenhuma'}</div>
            </div>
          </div>

          {metasEmAndamento.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h2>Progresso das Metas</h2>
              </div>
              <div className="card-body">
                <div className="chart-container">
                  <HighchartsReact highcharts={Highcharts} options={progressChartOptions} />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      <div className="card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2>Metas</h2>
            <button className="btn btn--primary btn--sm pipeline-add-toggle" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancelar' : 'Nova Meta'}
            </button>
          </div>
        </div>
        {showForm && (
          <div className="card-body" style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <div className="form-grid form-grid-3">
              <div className="form-group">
                <label className="form-label">Nome da Meta</label>
                <input type="text" className="form-control" placeholder="Ex: Aumentar faturamento em 20%" value={form.nome} onChange={e => setForm(prev => ({ ...prev, nome: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo</label>
                <select className="form-control" value={form.tipo} onChange={e => setForm(prev => ({ ...prev, tipo: e.target.value }))}>
                  {tipos.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Responsável</label>
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
                  {unidades.map(u => <option key={u.value} value={u.value}>{u.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Prazo</label>
                <input type="date" className="form-control" value={form.prazo} onChange={e => setForm(prev => ({ ...prev, prazo: e.target.value }))} />
              </div>
            </div>
            <button className="btn btn--primary" onClick={addMeta}>Adicionar Meta</button>
          </div>
        )}
        <div className="card-body">
          {metas.length === 0 ? (
            <div className="empty-state"><h3>Nenhuma meta cadastrada</h3><p>Clique em "Nova Meta" para começar.</p></div>
          ) : (
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Meta</th>
                    <th>Tipo</th>
                    <th>Meta / Atual</th>
                    <th>Progresso</th>
                    <th>Responsável</th>
                    <th>Prazo</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {metas.map(m => {
                    const progress = m.valorMeta > 0 ? Math.min(100, Math.round((m.valorAtual / m.valorMeta) * 100)) : 0
                    return (
                      <tr key={m.id}>
                        <td><strong>{m.nome}</strong></td>
                        <td><span className={`badge ${tipoColors[m.tipo] || 'badge--neutral'}`}>{m.tipo}</span></td>
                        <td style={{ whiteSpace: 'nowrap' }}>
                          {formatValue(m.valorAtual, m.unidade)} / {formatValue(m.valorMeta, m.unidade)}
                        </td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                            <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                              <div style={{ width: `${progress}%`, height: '100%', background: m.status === 'atrasada' ? 'var(--color-error)' : progress >= 80 ? 'var(--color-success)' : 'var(--color-info)', borderRadius: 4, transition: 'width 0.3s' }} />
                            </div>
                            <span style={{ fontSize: 'var(--text-sm)', minWidth: 36, textAlign: 'right' }}>{progress}%</span>
                          </div>
                        </td>
                        <td>{m.responsavel}</td>
                        <td>{new Date(m.prazo).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <select
                            className="form-control"
                            value={m.status}
                            onChange={e => updateStatus(m.id, e.target.value)}
                            style={{ padding: 'var(--space-1) var(--space-2)', fontSize: 'var(--text-xs)', width: 'auto', minWidth: 140 }}
                          >
                            <option value="em_andamento">Em Andamento</option>
                            <option value="concluida">Concluída</option>
                            <option value="atrasada">Atrasada</option>
                          </select>
                        </td>
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
