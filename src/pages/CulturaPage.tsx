import { useMemo } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useData } from '@/store/DataContext'
import { useTheme } from '@/store/ThemeContext'
import { usePageTitle } from '@/hooks/useTheme'
import Highcharts from 'highcharts'
import { LazyChart } from '@/components/LazyChart'

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
    legend: {
      itemStyle: { color: isDark ? '#8fad9a' : '#57534e', fontSize: '11px' },
    },
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
  const { filteredData, rawData } = useData()
  const { theme } = useTheme()
  usePageTitle('Cultura')

  const data = filteredData.length > 0 ? filteredData : rawData
  const hcTheme = useMemo(() => buildHCTheme(theme), [theme])

  const cultureData = useMemo(() => {
    const map: Record<string, { clientes: number; area: number; produtos: Set<string> }> = {}
    data.forEach(c => {
      const cultura = c.cultura_principal || 'N/A'
      if (!map[cultura]) map[cultura] = { clientes: 0, area: 0, produtos: new Set() }
      map[cultura].clientes++
      map[cultura].area += c.area_hectares
      Object.values(c.produtos).forEach(p => map[cultura].produtos.add(p.nome))
    })
    return Object.entries(map).map(([cultura, info]) => ({
      cultura,
      clientes: info.clientes,
      area: info.area,
      areaMedia: info.clientes > 0 ? info.area / info.clientes : 0,
      produtosMedio: info.clientes > 0 ? info.produtos.size : 0,
      produtos: info.produtos,
    })).sort((a, b) => b.area - a.area)
  }, [data])

  const allProducts = useMemo(() => {
    const set = new Set<string>()
    cultureData.forEach(c => c.produtos.forEach(p => set.add(p)))
    return Array.from(set)
  }, [cultureData])

  const clientChart = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'column', height: 300 },
    xAxis: { ...hcTheme.xAxis, categories: cultureData.map(c => c.cultura) },
    yAxis: { ...hcTheme.yAxis, allowDecimals: false },
    plotOptions: { ...hcTheme.plotOptions, column: { ...hcTheme.plotOptions?.column, colorByPoint: true } },
    colors: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444', '#10b981', '#ec4899', '#6366f1'],
    series: [{ type: 'column', name: 'Clientes', data: cultureData.map(c => c.clientes), showInLegend: false }],
  }), [cultureData, hcTheme])

  const areaChart = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'bar', height: 300 },
    xAxis: { ...hcTheme.xAxis, categories: cultureData.map(c => c.cultura) },
    yAxis: {
      ...hcTheme.yAxis,
      labels: { ...hcTheme.yAxis?.labels, formatter: function () { return `${Highcharts.numberFormat(this.value as number, 0, ',', '.')} ha` } },
    },
    plotOptions: { ...hcTheme.plotOptions, bar: { ...hcTheme.plotOptions?.bar, colorByPoint: true } },
    colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#22c55e'],
    series: [{ type: 'bar', name: 'Área (ha)', data: cultureData.map(c => c.area), showInLegend: false }],
  }), [cultureData, hcTheme])

  return (
    <AppLayout title="Cultura" subtitle="Análise por cultura agrícola">
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
              <span className="page-hero-kpi-value">{allProducts.length}</span>
              <span className="page-hero-kpi-label">Produtos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><h2 className="dash-section-title">Clientes por Cultura</h2></div>
          <div className="card-body">
            <LazyChart options={clientChart} height={300} />
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><h2 className="dash-section-title">Área por Cultura</h2></div>
          <div className="card-body">
            <LazyChart options={areaChart} height={300} />
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header"><h2 className="dash-section-title">Detalhamento por Cultura</h2></div>
        <div className="card-body" style={{ padding: 0 }}>
          {cultureData.length === 0 ? (
            <div className="empty-state"><h3>Sem dados</h3><p>Importe clientes via CSV para ver a análise por cultura.</p></div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Cultura</th>
                    <th>Clientes</th>
                    <th>Área Total</th>
                    <th>Área Média</th>
                    <th>Produtos Médio</th>
                  </tr>
                </thead>
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
          )}
        </div>
      </div>

      {allProducts.length > 1 && cultureData.length > 1 && (
        <div className="card">
          <div className="card-header"><h2 className="dash-section-title">Heatmap: Produto x Cultura</h2></div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-container" style={{ border: 'none', borderRadius: 0, overflow: 'auto' }}>
              <table className="data-table" style={{ minWidth: 600 }}>
                <thead>
                  <tr>
                    <th>Cultura</th>
                    {allProducts.slice(0, 12).map(p => (
                      <th key={p} style={{ fontSize: 10, whiteSpace: 'nowrap', writingMode: 'horizontal-tb' as any }}>
                        {p.length > 10 ? p.substring(0, 10) + '…' : p}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {cultureData.map((c, i) => (
                    <tr key={i}>
                      <td><strong>{c.cultura}</strong></td>
                      {allProducts.slice(0, 12).map(p => {
                        const has = c.produtos.has(p)
                        return (
                          <td key={p} style={{ textAlign: 'center' }}>
                            <span style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 600,
                              background: has ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.1)',
                              color: has ? '#16a34a' : '#dc2626',
                            }}>
                              {has ? 'Sim' : 'Não'}
                            </span>
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
      )}
    </AppLayout>
  )
}
