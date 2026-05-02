import { useMemo } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'

const levels = [
  { key: 'excelente', label: 'Excelente', color: '#16a34a', bg: 'rgba(22,163,74,0.12)', desc: 'Top 10%' },
  { key: 'otima',     label: 'Ótima',     color: '#22c55e', bg: 'rgba(34,197,94,0.12)', desc: 'Top 30%' },
  { key: 'boa',       label: 'Boa',       color: '#eab308', bg: 'rgba(234,179,8,0.12)', desc: 'Top 60%' },
  { key: 'ruim',      label: 'Ruim',      color: '#f97316', bg: 'rgba(249,115,22,0.12)', desc: 'Top 85%' },
  { key: 'muitoRuim', label: 'Muito Ruim',color: '#ef4444', bg: 'rgba(239,68,68,0.12)', desc: '15% inferior' },
]

function getClassification(pct: number) {
  if (pct >= 50) return 'excelente'
  if (pct >= 30) return 'otima'
  if (pct >= 15) return 'boa'
  if (pct >= 5)  return 'ruim'
  return 'muitoRuim'
}

const products = [
  { nome: 'AminoPlus® AJINOMOTO',        clientCount: 4, total: 5, pct: 80.0 },
  { nome: 'Amino Arginine® AJINOMOTO',   clientCount: 4, total: 5, pct: 80.0 },
  { nome: 'Amino Proline® AJINOMOTO',    clientCount: 4, total: 5, pct: 80.0 },
  { nome: 'Amiorgan® AJINOMOTO',         clientCount: 4, total: 5, pct: 80.0 },
  { nome: 'Ajifol® Premium+ AJINOMOTO',  clientCount: 4, total: 5, pct: 80.0 },
  { nome: 'AminoFort® AJINOMOTO',        clientCount: 3, total: 5, pct: 60.0 },
  { nome: 'AminoReten® AJINOMOTO',       clientCount: 3, total: 5, pct: 60.0 },
  { nome: 'AjiPower® AJINOMOTO',         clientCount: 3, total: 5, pct: 60.0 },
  { nome: 'Ajifol® K-Mg AJINOMOTO',      clientCount: 3, total: 5, pct: 60.0 },
  { nome: 'AlgenMax® AJINOMOTO',         clientCount: 3, total: 5, pct: 60.0 },
  { nome: 'Bokashi® AJINOMOTO',          clientCount: 3, total: 5, pct: 60.0 },
  { nome: 'Ajifol® SM-Boro AJINOMOTO',   clientCount: 2, total: 5, pct: 40.0 },
].map(p => ({ ...p, classificacao: getClassification(p.pct) }))

export function PenetracaoPage() {
  const { rawData } = useData()
  usePageTitle('Penetracao')

  const totalClientes = rawData.length > 0 ? rawData.length : 5

  const productPenetration = useMemo(() => products, [])

  const levelCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    levels.forEach(l => { counts[l.key] = 0 })
    productPenetration.forEach(p => { counts[p.classificacao]++ })
    return counts
  }, [productPenetration])

  const getLevelMeta = (key: string) => levels.find(l => l.key === key)!

  return (
    <AppLayout title="Penetracao" subtitle="Análise de penetração de produtos">
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--teal" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <span className="page-hero-eyebrow">Penetracao de Produtos</span>
            <h2 className="page-hero-title">Análise Detalhada de Produtos</h2>
            <p className="page-hero-subtitle">Porcentagem de clientes que utilizam cada produto na carteira</p>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{productPenetration.length}</span>
              <span className="page-hero-kpi-label">Produtos</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{levelCounts.excelente + levelCounts.otima}</span>
              <span className="page-hero-kpi-label">Boa+</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{totalClientes}</span>
              <span className="page-hero-kpi-label">Clientes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        {levels.map(l => (
          <div key={l.key} className="kpi-card" style={{ borderLeft: `3px solid ${l.color}` }}>
            <div className="kpi-label">{l.label}</div>
            <div className="kpi-value" style={{ color: l.color }}>{levelCounts[l.key]}</div>
            <div className="kpi-trend" style={{ color: l.color }}>{l.desc}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="dash-section-title">Penetração por Produto</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Produto</th>
                  <th>Clientes</th>
                  <th>Penetração %</th>
                  <th>Classificação</th>
                </tr>
              </thead>
              <tbody>
                {productPenetration.map((p, i) => {
                  const meta = getLevelMeta(p.classificacao)
                  return (
                    <tr key={i}>
                      <td><strong>{p.nome}</strong></td>
                      <td>{p.clientCount} / {p.total}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
                          <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                            <div style={{
                              height: '100%',
                              width: `${p.pct}%`,
                              background: meta.color,
                              borderRadius: 4,
                              transition: 'width 0.4s ease',
                            }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 40, textAlign: 'right', fontWeight: 600 }}>
                            {p.pct.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className="badge" style={{ background: meta.bg, color: meta.color, fontWeight: 600 }}>
                          {meta.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
