import { useMemo } from 'react'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'
import { produtosAJINOMOTO, getClientProductos, getClientName } from '@/data/produtos'
import { DownloadReportButton } from '@/lib/downloadUtils'

export function GapsPage() {
  const { rawData } = useData()
  usePageTitle('Gaps')

  const clientCount = rawData.length > 0 ? rawData.length : 45

  const gapData = useMemo(() => {
    return Array.from({ length: clientCount }, (_, i) => {
      const nome = rawData[i]?.nome || getClientName(i)
      const faturamento = rawData[i]?.faturamento_anual || 0
      const clientProducts = getClientProductos(i)
      const gaps = produtosAJINOMOTO.filter(p => !clientProducts.includes(p))
      return { nome, usando: clientProducts.length, usandoList: clientProducts, gap: gaps.length, gapList: gaps, potencial: gaps.length, faturamento }
    }).sort((a, b) => b.potencial - a.potencial)
  }, [clientCount, rawData])

  const downloadData = useMemo(() => {
    return gapData.map(g => ({
      nome: g.nome,
      usando: g.usando,
      gap: g.gap,
      potencial: g.potencial,
      faturamento: g.faturamento,
    }))
  }, [gapData])

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--gray" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <span className="page-hero-eyebrow">Análise de Gaps</span>
            <h2 className="page-hero-title">Oportunidades de Crescimento</h2>
            <p className="page-hero-subtitle">Identifique produtos não utilizados em clientes-alvo</p>
            <DownloadReportButton data={downloadData} filename="gaps.csv" />
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{produtosAJINOMOTO.length}</span>
              <span className="page-hero-kpi-label">Produtos Únicos</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{gapData.reduce((s, g) => s + g.gap, 0)}</span>
              <span className="page-hero-kpi-label">Gaps Totais</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">
                {gapData.length > 0 ? (gapData.reduce((s, g) => s + g.potencial, 0) / gapData.length).toFixed(1) : 0}
              </span>
              <span className="page-hero-kpi-label">Média/Cliente</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="dash-section-title">Ranking de Clientes com Maior Potencial</h2></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Usando</th>
                  <th>Gap (não usando)</th>
                  <th>Potencial</th>
                </tr>
              </thead>
              <tbody>
                {gapData.map((g, i) => (
                  <tr key={i}>
                    <td><strong>{g.nome}</strong></td>
                    <td>{g.usando} produtos</td>
                    <td><span style={{ color: '#ef4444', fontWeight: 600 }}>{g.gap} produtos</span></td>
                    <td>
                      <span className={`badge ${g.potencial >= 8 ? 'badge--info' : g.potencial >= 5 ? 'badge--warning' : 'badge--neutral'}`}>
                        {g.potencial}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 'var(--space-6)' }}>
        <div className="card-header"><h2 className="dash-section-title">Detalhamento de Gaps por Cliente</h2></div>
        <div className="card-body">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            {gapData.filter(g => g.gap > 0).map((g, i) => (
              <div key={i} style={{
                padding: 'var(--space-4)', background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-primary)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
                  <strong>{g.nome}</strong>
                  <div style={{ display: 'flex', gap: 12, fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    <span style={{ color: '#22c55e' }}>✓ {g.usando} usando</span>
                    <span style={{ color: '#ef4444' }}>✗ {g.gap} em gap</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {g.gapList.map(prod => (
                    <span key={prod} style={{
                      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
                      fontSize: 11, background: 'rgba(239,68,68,0.1)', color: '#dc2626',
                      border: '1px solid rgba(239,68,68,0.2)',
                    }}>{prod}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
