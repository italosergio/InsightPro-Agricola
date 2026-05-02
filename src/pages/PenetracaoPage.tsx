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
      animation: { duration: 900, easing: 'easeOutQuart' },
      spacing: [8, 8, 8, 8],
    },
    title: { text: undefined },
    legend: {
      itemStyle: { color: isDark ? '#8fad9a' : '#57534e', fontSize: '11px', fontWeight: '500' },
      itemHoverStyle: { color: isDark ? '#edfcf2' : '#1c1917' },
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
      shadow: { offsetX: 0, offsetY: 4, opacity: 0.2, width: 12 },
    },
    plotOptions: {
      series: { animation: { duration: 900 } },
      bar: { borderRadius: 6, borderWidth: 0 },
      column: { borderRadius: 6, borderWidth: 0 },
    },
    credits: { enabled: false },
  }
}

export function PenetracaoPage() {
  const { filteredData, rawData } = useData()
  const { theme } = useTheme()
  usePageTitle('Penetração')

  const data = filteredData.length > 0 ? filteredData : rawData
  const hcTheme = useMemo(() => buildHCTheme(theme), [theme])
  const isDark = theme === 'dark'

  const penetrationByState = useMemo(() => {
    const map: Record<string, { clientes: number; area: number; faturamento: number }> = {}
    data.forEach(c => {
      if (!map[c.estado]) map[c.estado] = { clientes: 0, area: 0, faturamento: 0 }
      map[c.estado].clientes++
      map[c.estado].area += c.area_hectares
      map[c.estado].faturamento += c.faturamento_anual
    })
    return Object.entries(map).sort(([, a], [, b]) => b.faturamento - a.faturamento).slice(0, 10)
  }, [data])

  const penetrationByCulture = useMemo(() => {
    const map: Record<string, number> = {}
    data.forEach(c => { if (c.cultura_principal) map[c.cultura_principal] = (map[c.cultura_principal] || 0) + 1 })
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 10)
  }, [data])

  const totalFat = data.reduce((s, c) => s + c.faturamento_anual, 0)
  const totalArea = data.reduce((s, c) => s + c.area_hectares, 0)
  const stateCount = new Set(data.map(c => c.estado)).size
  const cultureCount = new Set(data.filter(c => c.cultura_principal).map(c => c.cultura_principal)).size

  const fmt = (v: number) => {
    if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(1).replace('.', ',')} Bi`
    if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1).replace('.', ',')} Mi`
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)
  }

  const stateOpts = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'bar', height: 320 },
    xAxis: { ...hcTheme.xAxis, categories: penetrationByState.map(([s]) => s) },
    yAxis: {
      ...hcTheme.yAxis,
      labels: { ...hcTheme.yAxis?.labels, formatter: function () { return `R$${Highcharts.numberFormat(this.value as number / 1e6, 0)}Mi` } },
    },
    tooltip: {
      ...hcTheme.tooltip,
      formatter: function () { return `<b>${this.x}</b><br/>R$ ${Highcharts.numberFormat(this.y as number, 0, ',', '.')}` },
    },
    plotOptions: {
      ...hcTheme.plotOptions,
      bar: { ...hcTheme.plotOptions?.bar, colorByPoint: true },
    },
    colors: ['#16a34a', '#22c55e', '#34d464', '#4ade80', '#86efac', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'],
    series: [{ type: 'bar', name: 'Faturamento', data: penetrationByState.map(([, d]) => d.faturamento), showInLegend: false }],
  }), [penetrationByState, hcTheme])

  const cultureOpts = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'column', height: 320 },
    xAxis: {
      ...hcTheme.xAxis,
      categories: penetrationByCulture.map(([c]) => c.length > 12 ? c.substring(0, 12) + '…' : c),
    },
    yAxis: { ...hcTheme.yAxis, allowDecimals: false },
    tooltip: {
      ...hcTheme.tooltip,
      formatter: function () { return `<b>${this.x}</b><br/>${this.y} cliente${this.y !== 1 ? 's' : ''}` },
    },
    plotOptions: {
      ...hcTheme.plotOptions,
      column: { ...hcTheme.plotOptions?.column, colorByPoint: true },
    },
    colors: ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#22c55e', '#ef4444', '#f97316'],
    series: [{ type: 'column', name: 'Clientes', data: penetrationByCulture.map(([, v]) => v), showInLegend: false }],
  }), [penetrationByCulture, hcTheme])

  return (
    <AppLayout title="Penetração" subtitle="Análise de penetração por estado e cultura">
      {/* Hero */}
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--teal" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <span className="page-hero-eyebrow">Mapa de Mercado</span>
            <h2 className="page-hero-title">Análise de Penetração</h2>
            <p className="page-hero-subtitle">Entenda a presença da sua carteira por região e cultura agrícola.</p>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi"><span className="page-hero-kpi-value">{data.length}</span><span className="page-hero-kpi-label">Clientes</span></div>
            <div className="page-hero-kpi"><span className="page-hero-kpi-value">{stateCount}</span><span className="page-hero-kpi-label">Estados</span></div>
            <div className="page-hero-kpi"><span className="page-hero-kpi-value">{cultureCount}</span><span className="page-hero-kpi-label">Culturas</span></div>
            <div className="page-hero-kpi"><span className="page-hero-kpi-value">{(totalArea / 1000).toFixed(0)}k</span><span className="page-hero-kpi-label">Hectares</span></div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="kpi-card"><div className="kpi-label">Estados Cobertos</div><div className="kpi-value">{stateCount}</div><div className="kpi-trend positive">de 27 estados</div></div>
        <div className="kpi-card"><div className="kpi-label">Culturas Mapeadas</div><div className="kpi-value">{cultureCount}</div></div>
        <div className="kpi-card"><div className="kpi-label">Área Total</div><div className="kpi-value" style={{ fontSize: 'var(--text-xl)' }}>{totalArea.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} ha</div></div>
        <div className="kpi-card"><div className="kpi-label">Faturamento Total</div><div className="kpi-value" style={{ fontSize: 'var(--text-xl)' }}>{fmt(totalFat)}</div></div>
      </div>

      {/* Charts */}
      <div className="chart-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h2 className="dash-section-title">Faturamento por Estado</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: 0 }}>Top 10 estados</p>
          </div>
          <div className="card-body">
            {data.length === 0
              ? <div className="empty-state"><p>Importe dados para visualizar.</p></div>
              : <LazyChart options={stateOpts} height={320} />}
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header">
            <h2 className="dash-section-title">Clientes por Cultura</h2>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', margin: 0 }}>Top 10 culturas</p>
          </div>
          <div className="card-body">
            {data.length === 0
              ? <div className="empty-state"><p>Importe dados para visualizar.</p></div>
              : <LazyChart options={cultureOpts} height={320} />}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="card">
        <div className="card-header">
          <h2 className="dash-section-title">Detalhamento por Estado</h2>
        </div>
        <div className="card-body" style={{ padding: 0 }}>
          {penetrationByState.length === 0 ? (
            <div className="empty-state"><h3>Sem dados</h3><p>Importe clientes via CSV para ver a análise por estado.</p></div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th><th>Estado</th><th>Clientes</th><th>Área Total (ha)</th><th>Faturamento Total</th><th>Participação no Faturamento</th>
                  </tr>
                </thead>
                <tbody>
                  {penetrationByState.map(([state, d], idx) => {
                    const pct = totalFat > 0 ? (d.faturamento / totalFat) * 100 : 0
                    return (
                      <tr key={state}>
                        <td style={{ color: 'var(--text-tertiary)' }}>{idx + 1}</td>
                        <td><strong>{state}</strong></td>
                        <td>{d.clientes}</td>
                        <td>{d.area.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                        <td>{fmt(d.faturamento)}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', minWidth: 120 }}>
                            <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 3, overflow: 'hidden' }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: isDark ? '#22c55e' : '#16a34a', borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', minWidth: 36, textAlign: 'right' }}>{pct.toFixed(1)}%</span>
                          </div>
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
