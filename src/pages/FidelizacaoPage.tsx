import { useMemo } from 'react'
import { useData } from '@/store/DataContext'
import { useTheme } from '@/store/ThemeContext'
import { usePageTitle } from '@/hooks/useTheme'
import Highcharts from 'highcharts'
import { LazyChart } from '@/components/LazyChart'
import { produtosAJINOMOTO, getClientProductos } from '@/data/produtos'
import { DownloadReportButton } from '@/lib/downloadUtils'

function buildHCTheme(theme: 'light' | 'dark') {
  const isDark = theme === 'dark'
  return {
    chart: { backgroundColor: 'transparent', style: { fontFamily: 'Inter, system-ui, sans-serif' }, animation: { duration: 800 }, spacing: [8, 8, 8, 8] },
    title: { text: undefined },
    legend: { itemStyle: { color: isDark ? '#8fad9a' : '#57534e', fontSize: '11px' } },
    xAxis: { labels: { style: { color: isDark ? '#5a7a66' : '#78716c', fontSize: '11px' } }, lineColor: isDark ? '#1a2e20' : '#e7e5e4', tickColor: 'transparent', gridLineColor: isDark ? '#1a2e20' : '#f5f5f4' },
    yAxis: { labels: { style: { color: isDark ? '#5a7a66' : '#78716c', fontSize: '11px' } }, tickColor: 'transparent', gridLineColor: isDark ? '#1a2e20' : '#f5f5f4', title: { text: undefined } },
    tooltip: { backgroundColor: isDark ? '#192a1f' : '#ffffff', borderColor: isDark ? '#264033' : '#e7e5e4', borderRadius: 8, style: { color: isDark ? '#edfcf2' : '#1c1917', fontSize: '12px' } },
    plotOptions: { series: { animation: { duration: 800 } }, bar: { borderRadius: 6, borderWidth: 0 }, column: { borderRadius: 6, borderWidth: 0 }, pie: { borderWidth: 3, borderColor: isDark ? '#0d1710' : '#f8fafc' } },
    credits: { enabled: false },
  }
}

export function FidelizacaoPage() {
  const { rawData } = useData()
  const { theme } = useTheme()
  usePageTitle('Fidelizacao')

  const clientCount = rawData.length > 0 ? rawData.length : 45
  const hcTheme = useMemo(() => buildHCTheme(theme), [theme])
  const isDark = theme === 'dark'

  const productVolume = useMemo(() => {
    const map: Record<string, { nome: string; quantidade: number; clientCount: number }> = {}
    produtosAJINOMOTO.forEach(p => { map[p] = { nome: p, quantidade: 0, clientCount: 0 } })
    for (let i = 0; i < clientCount; i++) {
      const prods = getClientProductos(i)
      prods.forEach(p => {
        if (map[p]) {
          map[p].quantidade += 1 + (i % 10)
          map[p].clientCount++
        }
      })
    }
    return Object.values(map)
      .map(p => ({ ...p, valor: p.quantidade * 1500 * (1 + (p.clientCount % 5) * 0.3) }))
      .sort((a, b) => b.valor - a.valor)
  }, [clientCount])

  const topProducts = productVolume.slice(0, 5)
  const volumeTotal = productVolume.reduce((s, p) => s + p.quantidade, 0)
  const valorTotal = productVolume.reduce((s, p) => s + p.valor, 0)

  const downloadData = useMemo(() => {
    return productVolume.map(p => ({
      nome: p.nome,
      quantidade: p.quantidade,
      clientes: p.clientCount,
      valor: p.valor,
    }))
  }, [productVolume])

  const abcData = useMemo(() => {
    const sorted = [...productVolume]
    let cum = 0
    let a = 0, b = 0, c = 0
    sorted.forEach(p => { cum += p.valor; const pct = valorTotal > 0 ? cum / valorTotal : 0; if (pct <= 0.8) a++; else if (pct <= 0.95) b++; else c++ })
    return { a, b, c }
  }, [productVolume, valorTotal])

  const topChart = useMemo<Highcharts.Options>(() => ({
    ...hcTheme, chart: { ...hcTheme.chart, type: 'bar', height: 280 },
    xAxis: { ...hcTheme.xAxis, categories: topProducts.map(p => p.nome.length > 15 ? p.nome.substring(0, 15) + '…' : p.nome) },
    yAxis: { ...hcTheme.yAxis, allowDecimals: false },
    plotOptions: { ...hcTheme.plotOptions, bar: { ...hcTheme.plotOptions?.bar, colorByPoint: true } },
    colors: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899'],
    series: [{ type: 'bar', name: 'Volume', data: topProducts.map(p => p.quantidade), showInLegend: false }],
  }), [topProducts, hcTheme])

  const abcChart = useMemo<Highcharts.Options>(() => ({
    ...hcTheme, chart: { ...hcTheme.chart, type: 'pie', height: 280 },
    plotOptions: { ...hcTheme.plotOptions, pie: { innerSize: '50%', dataLabels: { enabled: true, format: '<b>{point.name}</b>: {y}', style: { fontSize: '11px', fontWeight: '500', textOutline: 'none' }, color: isDark ? '#d6d3d1' : '#57534e' } } },
    colors: ['#22c55e', '#f59e0b', '#ef4444'],
    series: [{ type: 'pie', name: 'Produtos', data: [{ name: 'Classe A', y: abcData.a }, { name: 'Classe B', y: abcData.b }, { name: 'Classe C', y: abcData.c }] }],
  }), [abcData, hcTheme, isDark])

  const fmt = (v: number) => {
    if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(1).replace('.', ',')} Bi`
    if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1).replace('.', ',')} Mi`
    return `R$ ${(v / 1e3).toFixed(0)}k`
  }

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--gray" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <span className="page-hero-eyebrow">Fidelizacao</span>
            <h2 className="page-hero-title">Análise de Produtos</h2>
            <p className="page-hero-subtitle">Volume total, top produtos e distribuição ABC de produtos na carteira</p>
            <DownloadReportButton data={downloadData} filename="fidelizacao.csv" />
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi"><span className="page-hero-kpi-value">{productVolume.length}</span><span className="page-hero-kpi-label">Produtos</span></div>
            <div className="page-hero-kpi"><span className="page-hero-kpi-value">{volumeTotal.toLocaleString('pt-BR')}</span><span className="page-hero-kpi-label">Volume Total</span></div>
            <div className="page-hero-kpi"><span className="page-hero-kpi-value">{fmt(valorTotal)}</span><span className="page-hero-kpi-label">Valor Total</span></div>
          </div>
        </div>
      </div>

      <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="kpi-card"><div className="kpi-label">Volume Total Mensal</div><div className="kpi-value">{volumeTotal.toLocaleString('pt-BR')} un</div></div>
        <div className="kpi-card"><div className="kpi-label">Valor Total</div><div className="kpi-value">{fmt(valorTotal)}</div></div>
        <div className="kpi-card"><div className="kpi-label">Top Produto</div><div className="kpi-value" style={{ fontSize: 'var(--text-lg)' }}>{topProducts[0]?.nome || '—'}</div></div>
        <div className="kpi-card"><div className="kpi-label">Preço Médio</div><div className="kpi-value">{productVolume.length > 0 ? fmt(valorTotal / productVolume.length) : '—'}</div></div>
      </div>

      <div className="chart-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><h2 className="dash-section-title">Top 5 Produtos</h2></div>
          <div className="card-body"><LazyChart options={topChart} height={280} /></div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><h2 className="dash-section-title">Distribuição ABC</h2></div>
          <div className="card-body"><LazyChart options={abcChart} height={280} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="dash-section-title">Produtos da Carteira</h2></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead><tr><th>Produto</th><th>Volume (un)</th><th>Clientes</th><th>Valor Total</th><th>% do Total</th></tr></thead>
              <tbody>
                {productVolume.map((p, i) => (
                  <tr key={i}>
                    <td><strong>{p.nome}</strong></td>
                    <td>{p.quantidade.toLocaleString('pt-BR')}</td>
                    <td>{p.clientCount}</td>
                    <td>{fmt(p.valor)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${valorTotal > 0 ? (p.valor / valorTotal) * 100 : 0}%`, background: isDark ? '#22c55e' : '#16a34a', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 36 }}>{valorTotal > 0 ? ((p.valor / valorTotal) * 100).toFixed(1) : '0'}%</span>
                      </div>
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
