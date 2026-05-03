import { useMemo } from 'react'
import { useData } from '@/store/DataContext'
import { useTheme } from '@/store/ThemeContext'
import { usePageTitle } from '@/hooks/useTheme'
import Highcharts from 'highcharts'
import { LazyChart } from '@/components/LazyChart'

const regionMap: Record<string, string[]> = {
  'Norte':       ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'],
  'Nordeste':    ['AL', 'BA', 'CE', 'MA', 'PB', 'PE', 'PI', 'RN', 'SE'],
  'Centro-Oeste': ['DF', 'GO', 'MT', 'MS'],
  'Sudeste':     ['ES', 'MG', 'RJ', 'SP'],
  'Sul':         ['PR', 'RS', 'SC'],
}

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
      pie: { borderWidth: 3, borderColor: isDark ? '#0d1710' : '#f8fafc' },
    },
    credits: { enabled: false },
  }
}

export function TerritorialPage() {
  const { filteredData, rawData } = useData()
  const { theme } = useTheme()
  usePageTitle('Territorial')

  const data = filteredData.length > 0 ? filteredData : rawData
  const hcTheme = useMemo(() => buildHCTheme(theme), [theme])
  const isDark = theme === 'dark'

  const regionData = useMemo(() => {
    const map: Record<string, { clientes: number; area: number }> = {}
    Object.keys(regionMap).forEach(r => { map[r] = { clientes: 0, area: 0 } })
    data.forEach(c => {
      for (const [region, states] of Object.entries(regionMap)) {
        if (states.includes(c.estado.toUpperCase())) {
          map[region].clientes++
          map[region].area += c.area_hectares
          break
        }
      }
    })
    return Object.entries(map)
      .map(([regiao, info]) => ({
        regiao,
        clientes: info.clientes,
        area: info.area,
        pctClientes: data.length > 0 ? (info.clientes / data.length) * 100 : 0,
        pctArea: data.reduce((s, c) => s + c.area_hectares, 0) > 0
          ? (info.area / data.reduce((s, c) => s + c.area_hectares, 0)) * 100
          : 0,
      }))
      .filter(r => r.clientes > 0)
      .sort((a, b) => b.clientes - a.clientes)
  }, [data])

  const clientChart = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'pie', height: 300 },
    plotOptions: {
      ...hcTheme.plotOptions,
      pie: {
        ...hcTheme.plotOptions?.pie,
        dataLabels: { enabled: true, format: '<b>{point.name}</b>: {y}', style: { fontSize: '11px', fontWeight: '500', textOutline: 'none' }, color: isDark ? '#d6d3d1' : '#57534e' },
      },
    },
    colors: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'],
    series: [{
      type: 'pie', name: 'Clientes',
      data: regionData.map(r => ({ name: r.regiao, y: r.clientes })),
    }],
  }), [regionData, hcTheme, isDark])

  const areaChart = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'bar', height: 300 },
    xAxis: { ...hcTheme.xAxis, categories: regionData.map(r => r.regiao) },
    yAxis: {
      ...hcTheme.yAxis,
      labels: { ...hcTheme.yAxis?.labels, formatter: function () { return `${Highcharts.numberFormat(this.value as number, 0, ',', '.')} ha` } },
    },
    plotOptions: { ...hcTheme.plotOptions, bar: { ...hcTheme.plotOptions?.bar, colorByPoint: true } },
    colors: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'],
    series: [{ type: 'bar', name: 'Área (ha)', data: regionData.map(r => r.area), showInLegend: false }],
  }), [regionData, hcTheme])

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--blue" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <span className="page-hero-eyebrow">Análise Territorial</span>
            <h2 className="page-hero-title">Distribuição por Região</h2>
            <p className="page-hero-subtitle">Visão geográfica da carteira de clientes agregada por região do Brasil</p>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{regionData.length}</span>
              <span className="page-hero-kpi-label">Regiões</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{data.length}</span>
              <span className="page-hero-kpi-label">Clientes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><h2 className="dash-section-title">Clientes por Região</h2></div>
          <div className="card-body">
            <LazyChart options={clientChart} height={300} />
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><h2 className="dash-section-title">Área por Região</h2></div>
          <div className="card-body">
            <LazyChart options={areaChart} height={300} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="dash-section-title">Detalhamento</h2></div>
        <div className="card-body" style={{ padding: 0 }}>
          {regionData.length === 0 ? (
            <div className="empty-state"><h3>Sem dados</h3><p>Importe clientes para ver a análise territorial.</p></div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Região</th>
                    <th>Clientes</th>
                    <th>Área Total</th>
                    <th>% Clientes</th>
                    <th>% Área</th>
                  </tr>
                </thead>
                <tbody>
                  {regionData.map((r, i) => (
                    <tr key={i}>
                      <td><strong>{r.regiao}</strong></td>
                      <td>{r.clientes}</td>
                      <td>{r.area.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ha</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${r.pctClientes}%`, background: isDark ? '#22c55e' : '#16a34a', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 36 }}>{r.pctClientes.toFixed(1)}%</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${r.pctArea}%`, background: isDark ? '#3b82f6' : '#2563eb', borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 36 }}>{r.pctArea.toFixed(1)}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
