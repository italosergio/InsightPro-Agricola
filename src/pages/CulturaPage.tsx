import { useMemo } from 'react'
import { useData } from '@/store/DataContext'
import { useTheme } from '@/store/ThemeContext'
import { usePageTitle } from '@/hooks/useTheme'
import Highcharts from 'highcharts'
import { LazyChart } from '@/components/LazyChart'
import { produtosAJINOMOTO, getClientProductos } from '@/data/produtos'

function buildHCTheme(theme: 'light' | 'dark') {
  const isDark = theme === 'dark'
  return {
    chart: {
      backgroundColor: 'transparent',
      style: { fontFamily: 'Inter, system-ui, sans-serif' },
      animation: { duration: 800 },
      spacing: [8, 8, 8, 8],
    },
    title: { text: undefined },
    legend: { itemStyle: { color: isDark ? '#8fad9a' : '#57534e', fontSize: '11px' } },
    xAxis: {
      labels: { style: { color: isDark ? '#5a7a66' : '#78716c', fontSize: '11px' } },
      lineColor: isDark ? '#1a2e20' : '#e7e5e4',
      tickColor: 'transparent',
      gridLineColor: isDark ? '#1a2e20' : '#f5f5f4',
    },
    yAxis: {
      labels: { style: { color: isDark ? '#5a7a66' : '#78716c', fontSize: '11px' } },
      tickColor: 'transparent',
      gridLineColor: isDark ? '#1a2e20' : '#f5f5f4',
      title: { text: undefined },
    },
    tooltip: {
      backgroundColor: isDark ? '#192a1f' : '#ffffff',
      borderColor: isDark ? '#264033' : '#e7e5e4',
      borderRadius: 8,
      style: { color: isDark ? '#edfcf2' : '#1c1917', fontSize: '12px' },
    },
    plotOptions: {
      series: { animation: { duration: 800 } },
      bar: { borderRadius: 6, borderWidth: 0 },
      column: { borderRadius: 6, borderWidth: 0 },
    },
    credits: { enabled: false },
  }
}

export function CulturaPage() {
  const { rawData } = useData()
  const { theme } = useTheme()
  usePageTitle('Cultura')

  const clientCount = rawData.length > 0 ? rawData.length : 45
  const hcTheme = useMemo(() => buildHCTheme(theme), [theme])

  const cultureData = useMemo(() => {
    const culturas = Array.from(new Set(rawData.map(c => c.cultura_principal).filter(Boolean)))
    if (culturas.length === 0) {
      const fallback = ['Soja', 'Milho', 'Café', 'Algodão', 'Cana-de-Açúcar', 'Uva', 'Manga', 'Tomate']
      return fallback.map((cultura, i) => {
        const clientes = 2 + (i % 5)
        const area = clientes * (50 + i * 30)
        const prods = new Set<string>()
        for (let j = 0; j < clientes; j++) {
          getClientProductos(i * 3 + j).forEach(p => prods.add(p))
        }
        return { cultura, clientes, area, areaMedia: area / clientes, produtosMedio: prods.size, produtos: prods }
      })
    }
    return culturas.map((cultura, i) => {
      const clients = rawData.filter(c => c.cultura_principal === cultura)
      const clientes = clients.length
      const area = clients.reduce((s, c) => s + c.area_hectares, 0)
      const prods = new Set<string>()
      clients.forEach((_, j) => getClientProductos(i * 7 + j).forEach(p => prods.add(p)))
      return { cultura, clientes, area, areaMedia: clientes > 0 ? area / clientes : 0, produtosMedio: prods.size, produtos: prods }
    })
  }, [rawData])

  const clientChart = useMemo<Highcharts.Options>(() => ({
    ...hcTheme, chart: { ...hcTheme.chart, type: 'column', height: 300 },
    xAxis: { ...hcTheme.xAxis, categories: cultureData.map(c => c.cultura) },
    yAxis: { ...hcTheme.yAxis, allowDecimals: false },
    plotOptions: { ...hcTheme.plotOptions, column: { ...hcTheme.plotOptions?.column, colorByPoint: true } },
    colors: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#6366f1'],
    series: [{ type: 'column', name: 'Clientes', data: cultureData.map(c => c.clientes), showInLegend: false }],
  }), [cultureData, hcTheme])

  const areaChart = useMemo<Highcharts.Options>(() => ({
    ...hcTheme, chart: { ...hcTheme.chart, type: 'bar', height: 300 },
    xAxis: { ...hcTheme.xAxis, categories: cultureData.map(c => c.cultura) },
    yAxis: { ...hcTheme.yAxis, labels: { ...hcTheme.yAxis?.labels, formatter: function () { return `${Highcharts.numberFormat(this.value as number, 0, ',', '.')} ha` } } },
    plotOptions: { ...hcTheme.plotOptions, bar: { ...hcTheme.plotOptions?.bar, colorByPoint: true } },
    colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#22c55e'],
    series: [{ type: 'bar', name: 'Área (ha)', data: cultureData.map(c => c.area), showInLegend: false }],
  }), [cultureData, hcTheme])

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--green" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <span className="page-hero-eyebrow">Análise por Cultura</span>
            <h2 className="page-hero-title">Culturas da Carteira</h2>
            <p className="page-hero-subtitle">Distribuição de clientes, área e produtos por cultura principal</p>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{cultureData.length}</span>
              <span className="page-hero-kpi-label">Culturas</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{produtosAJINOMOTO.length}</span>
              <span className="page-hero-kpi-label">Produtos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><h2 className="dash-section-title">Clientes por Cultura</h2></div>
          <div className="card-body"><LazyChart options={clientChart} height={300} /></div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><h2 className="dash-section-title">Área por Cultura</h2></div>
          <div className="card-body"><LazyChart options={areaChart} height={300} /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header"><h2 className="dash-section-title">Detalhamento por Cultura</h2></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead><tr><th>Cultura</th><th>Clientes</th><th>Área Total</th><th>Área Média</th><th>Produtos Médio</th></tr></thead>
              <tbody>
                {cultureData.map((c, i) => (
                  <tr key={i}>
                    <td><strong>{c.cultura}</strong></td>
                    <td>{c.clientes}</td>
                    <td>{c.area.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ha</td>
                    <td>{c.areaMedia.toFixed(1)} ha</td>
                    <td>{c.produtosMedio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="dash-section-title">Heatmap: Produto x Cultura</h2></div>
        <div className="card-body" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0, overflow: 'auto' }}>
            <table className="data-table" style={{ minWidth: 600 }}>
              <thead>
                <tr>
                  <th>Cultura</th>
                  {produtosAJINOMOTO.map(p => (
                    <th key={p} style={{ fontSize: 9, whiteSpace: 'nowrap' }}>{p.length > 12 ? p.substring(0, 12) + '…' : p}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cultureData.map((c, i) => (
                  <tr key={i}>
                    <td><strong>{c.cultura}</strong></td>
                    {produtosAJINOMOTO.map(p => {
                      const has = c.produtos.has(p)
                      return (
                        <td key={p} style={{ textAlign: 'center' }}>
                          <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 600,
                            background: has ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)',
                            color: has ? '#16a34a' : '#dc2626' }}>{has ? 'Sim' : 'Não'}</span>
                        </td>
                      )
                    })}
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
