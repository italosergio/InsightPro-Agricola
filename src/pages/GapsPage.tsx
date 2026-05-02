import { useMemo } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'

export function GapsPage() {
  const { filteredData, rawData } = useData()
  usePageTitle('Gaps')

  const data = filteredData.length > 0 ? filteredData : rawData

  const allProductNames = useMemo(() => {
    const set = new Set<string>()
    data.forEach(c => Object.values(c.produtos).forEach(p => set.add(p.nome)))
    return Array.from(set)
  }, [data])

  const gapData = useMemo(() => {
    if (allProductNames.length === 0) return []
    return data
      .map(c => {
        const clientProducts = new Set(Object.values(c.produtos).map(p => p.nome))
        const gaps = allProductNames.filter(p => !clientProducts.has(p))
        return {
          nome: c.nome,
          usando: clientProducts.size,
          usandoList: Array.from(clientProducts),
          gap: gaps.length,
          gapList: gaps,
          potencial: gaps.length,
          faturamento: c.faturamento_anual,
        }
      })
      .sort((a, b) => b.potencial - a.potencial)
  }, [data, allProductNames])

  const fmt = (v: number) => {
    if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(1).replace('.', ',')} Bi`
    if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1).replace('.', ',')} Mi`
    return `R$ ${(v / 1e3).toFixed(0)}k`
  }

  return (
    <AppLayout title="Gaps" subtitle="Oportunidades de crescimento por cliente">
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--orange" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <span className="page-hero-eyebrow">Análise de Gaps</span>
            <h2 className="page-hero-title">Oportunidades de Crescimento</h2>
            <p className="page-hero-subtitle">Identifique produtos não utilizados em clientes-alvo</p>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{allProductNames.length}</span>
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
          {gapData.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum dado de produtos</h3>
              <p>Adicione produtos aos clientes para visualizar a análise de gaps.</p>
            </div>
          ) : (
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
                      <td>
                        <span style={{ color: '#ef4444', fontWeight: 600 }}>{g.gap} produtos</span>
                      </td>
                      <td>
                        <span className={`badge ${g.potencial >= 4 ? 'badge--info' : g.potencial >= 2 ? 'badge--warning' : 'badge--neutral'}`}>
                          {g.potencial}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {gapData.length > 0 && (
        <div className="card" style={{ marginTop: 'var(--space-6)' }}>
          <div className="card-header"><h2 className="dash-section-title">Detalhamento de Gaps por Cliente</h2></div>
          <div className="card-body">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {gapData.filter(g => g.gap > 0).map((g, i) => (
                <div key={i} style={{
                  padding: 'var(--space-4)',
                  background: 'var(--bg-secondary)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border-primary)',
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
                      }}>
                        {prod}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
