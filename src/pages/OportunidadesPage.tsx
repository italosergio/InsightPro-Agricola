import { useMemo } from 'react'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'
import { getClientProductos, getClientName } from '@/data/produtos'
import { DownloadReportButton } from '@/lib/downloadUtils'

export function OportunidadesPage() {
  const { rawData } = useData()
  usePageTitle('Oportunidades')

  const clientCount = rawData.length > 0 ? rawData.length : 45

  const quadrant = useMemo(() => {
    const clients = Array.from({ length: clientCount }, (_, i) => {
      const nome = rawData[i]?.nome || getClientName(i)
      const faturamento = rawData[i]?.faturamento_anual || 0
      const penCount = getClientProductos(i).length
      return { nome, faturamento, penetracao: penCount }
    }).sort((a, b) => b.faturamento - a.faturamento)

    const mid = Math.floor(clients.length / 2)
    const fatMedian = clients.length >= 2 ? clients[mid].faturamento : 0
    const penCounts = clients.map(c => c.penetracao).sort((a, b) => a - b)
    const penMedian = penCounts.length >= 2 ? penCounts[Math.floor(penCounts.length / 2)] : 0

    return clients.map(c => ({
      ...c,
      isLarge: c.faturamento >= fatMedian,
      isHighPen: c.penetracao >= penMedian,
    }))
  }, [clientCount, rawData])

  const stars = quadrant.filter(q => q.isLarge && q.isHighPen)
  const opportunities = quadrant.filter(q => q.isLarge && !q.isHighPen)
  const niche = quadrant.filter(q => !q.isLarge && q.isHighPen)
  const avoid = quadrant.filter(q => !q.isLarge && !q.isHighPen)

  const downloadData = useMemo(() => {
    return quadrant.map(q => ({
      nome: q.nome,
      faturamento: q.faturamento,
      penetracao: q.penetracao,
      quadrante: q.isLarge ? (q.isHighPen ? 'Estrela' : 'Oportunidade') : (q.isHighPen ? 'Nicho' : 'Evitar'),
    }))
  }, [quadrant])

  const quads = [
    { key: 'stars', label: 'Estrelas', sub: 'Alta penetração em clientes grandes', data: stars, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', action: 'Proteger e expandir' },
    { key: 'opportunities', label: 'Oportunidades', sub: 'Baixa penetração em clientes grandes', data: opportunities, color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', action: 'Aumentar penetração' },
    { key: 'niche', label: 'Nicho', sub: 'Alta penetração em clientes pequenos', data: niche, color: '#a855f7', bg: 'rgba(168,85,247,0.08)', action: 'Manter relacionamento' },
    { key: 'avoid', label: 'Evitar', sub: 'Baixa penetração em clientes pequenos', data: avoid, color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', action: 'Avaliar investimento' },
  ]

  const fmt = (v: number) => {
    if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(1).replace('.', ',')} Bi`
    if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1).replace('.', ',')} Mi`
    return `R$ ${(v / 1e3).toFixed(0)}k`
  }

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--purple" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <span className="page-hero-eyebrow">Matriz de Oportunidades</span>
            <h2 className="page-hero-title">Cruzamento Penetração x Tamanho</h2>
            <p className="page-hero-subtitle">Identifique onde concentrar esforços comerciais baseado na penetração de produtos e tamanho do cliente</p>
            <DownloadReportButton data={downloadData} filename="oportunidades.csv" />
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{quadrant.filter(q => q.penetracao > 0).length}</span>
              <span className="page-hero-kpi-label">Com Produtos</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{stars.length + opportunities.length}</span>
              <span className="page-hero-kpi-label">Grandes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="home-section">
        <h2 className="home-section-title" style={{ marginBottom: 'var(--space-4)' }}>Matriz de Oportunidades</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 'var(--space-4)' }}>
          {quads.map(q => (
            <div key={q.key} className="card" style={{ marginBottom: 0, borderLeft: `4px solid ${q.color}` }}>
              <div className="card-body" style={{ padding: 'var(--space-4)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 'var(--space-3)' }}>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: q.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: q.color }}>
                    {q.key === 'stars' ? '⭐' : q.key === 'opportunities' ? '🚀' : q.key === 'niche' ? '🎯' : '⚠️'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>{q.label}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>{q.sub}</div>
                  </div>
                </div>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-2)' }}>
                  <strong>{q.data.length} clientes</strong> — {q.action}
                </div>
                {q.data.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {q.data.slice(0, 5).map(c => (
                      <span key={c.nome} style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 11, background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>{c.nome}</span>
                    ))}
                    {q.data.length > 5 && <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>+{q.data.length - 5} mais</span>}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card-header"><h2 className="dash-section-title">Detalhamento por Cliente</h2></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead><tr><th>Cliente</th><th>Faturamento</th><th>Produtos</th><th>Quadrante</th></tr></thead>
              <tbody>
                {quadrant.map((q, i) => (
                  <tr key={i}>
                    <td><strong>{q.nome}</strong></td>
                    <td>{fmt(q.faturamento)}</td>
                    <td>{q.penetracao}</td>
                    <td>
                      <span className="badge" style={{
                        background: q.isLarge ? (q.isHighPen ? 'rgba(34,197,94,0.12)' : 'rgba(59,130,246,0.12)') : (q.isHighPen ? 'rgba(168,85,247,0.12)' : 'rgba(245,158,11,0.12)'),
                        color: q.isLarge ? (q.isHighPen ? '#22c55e' : '#3b82f6') : (q.isHighPen ? '#a855f7' : '#f59e0b'),
                        fontWeight: 600,
                      }}>{q.isLarge ? (q.isHighPen ? 'Estrela' : 'Oportunidade') : (q.isHighPen ? 'Nicho' : 'Evitar')}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  )
}
