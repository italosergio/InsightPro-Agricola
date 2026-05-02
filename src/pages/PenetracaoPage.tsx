import { useMemo } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useData } from '@/store/DataContext'
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

export function PenetracaoPage() {
  const { filteredData, rawData } = useData()
  const { theme } = useTheme()
  usePageTitle('Penetração')

  const data = filteredData.length > 0 ? filteredData : rawData

  const hcTheme = useMemo(() => buildHCTheme(theme), [theme])

  const penetrationByState = useMemo(() => {
    const stateMap: Record<string, { clientes: number; area: number; faturamento: number }> = {}
    data.forEach(c => {
      if (!stateMap[c.estado]) {
        stateMap[c.estado] = { clientes: 0, area: 0, faturamento: 0 }
      }
      stateMap[c.estado].clientes++
      stateMap[c.estado].area += c.area_hectares
      stateMap[c.estado].faturamento += c.faturamento_anual
    })
    return Object.entries(stateMap)
      .sort(([, a], [, b]) => b.faturamento - a.faturamento)
      .slice(0, 10)
  }, [data])

  const penetrationByCulture = useMemo(() => {
    const cultureMap: Record<string, number> = {}
    data.forEach(c => {
      if (c.cultura_principal) {
        cultureMap[c.cultura_principal] = (cultureMap[c.cultura_principal] || 0) + 1
      }
    })
    return Object.entries(cultureMap).sort(([, a], [, b]) => b - a)
  }, [data])

  const totalClientes = data.length
  const totalEstados = new Set(data.map(c => c.estado)).size
  const totalCulturas = new Set(data.filter(c => c.cultura_principal).map(c => c.cultura_principal)).size
  const totalArea = data.reduce((sum, c) => sum + c.area_hectares, 0)
  const totalFaturamento = data.reduce((sum, c) => sum + c.faturamento_anual, 0)
  const areaMil = totalArea / 1000
  const totalFaturamentoGeral = penetrationByState.reduce((sum, [, d]) => sum + d.faturamento, 0)

  const fmt = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)

  const stateChartOptions = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'bar', height: 320 },
    title: { text: undefined },
    xAxis: {
      ...hcTheme.xAxis,
      categories: penetrationByState.map(([state]) => state),
      reversed: false,
    },
    yAxis: {
      ...hcTheme.yAxis,
      title: { text: undefined },
      labels: {
        ...hcTheme.yAxis?.labels,
        formatter: function () {
          const val = this.value as number
          if (val >= 1e6) return `R$ ${(val / 1e6).toFixed(1).replace('.', ',')}M`
          return `R$ ${Highcharts.numberFormat(val, 0, ',', '.')}`
        },
      },
    },
    tooltip: {
      ...hcTheme.tooltip,
      pointFormatter: function () {
        return `<b>R$ ${Highcharts.numberFormat(this.y as number, 0, ',', '.')}</b>`
      },
    },
    plotOptions: {
      ...hcTheme.plotOptions,
      series: {
        ...hcTheme.plotOptions?.series,
        colorByPoint: true,
      },
      bar: {
        ...hcTheme.plotOptions?.bar,
        dataLabels: {
          enabled: true,
          format: 'R$ {point.y:,.0f}',
          style: { fontSize: '10px', fontWeight: '500', textOutline: 'none' },
          color: theme === 'dark' ? '#d6d3d1' : '#57534e',
        },
      },
    },
    colors: ['#22c55e', '#16a34a', '#15803d', '#10b981', '#059669', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'],
    series: [{
      type: 'bar',
      name: 'Faturamento',
      data: penetrationByState.map(([, d]) => d.faturamento),
      showInLegend: false,
    }],
  }), [penetrationByState, hcTheme, theme])

  const cultureChartOptions = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'column', height: 320 },
    title: { text: undefined },
    xAxis: {
      ...hcTheme.xAxis,
      categories: penetrationByCulture.map(([c]) => c.length > 14 ? c.substring(0, 14) + '…' : c),
    },
    yAxis: {
      ...hcTheme.yAxis,
      title: { text: 'Qtd. Clientes', style: { ...hcTheme.yAxis?.title?.style } },
      allowDecimals: false,
    },
    tooltip: {
      ...hcTheme.tooltip,
      pointFormatter: function () {
        return `<b>${this.y}</b> cliente${this.y !== 1 ? 's' : ''}`
      },
    },
    plotOptions: {
      ...hcTheme.plotOptions,
      series: {
        ...hcTheme.plotOptions?.series,
        colorByPoint: true,
      },
      column: {
        ...hcTheme.plotOptions?.column,
        dataLabels: {
          enabled: true,
          style: { fontSize: '11px', fontWeight: '600', textOutline: 'none' },
          color: theme === 'dark' ? '#d6d3d1' : '#57534e',
        },
      },
    },
    colors: Array(penetrationByCulture.length).fill('#3b82f6'),
    series: [{
      type: 'column',
      name: 'Clientes',
      data: penetrationByCulture.map(([, v]) => v),
      showInLegend: false,
    }],
  }), [penetrationByCulture, hcTheme, theme])

  const isEmpty = data.length === 0

  return (
    <AppLayout title="Penetração" subtitle="Análise de penetração por estado e cultura">
      {isEmpty ? (
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3>Nenhum dado disponível</h3>
              <p>Importe seus dados para visualizar a análise de penetração.</p>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="dash-hero" style={{ minHeight: 260 }}>
            <div
              className="dash-hero-bg"
              style={{
                background: 'linear-gradient(135deg, #0f766e 0%, #115e59 40%, #0d9488 75%, #14b8a6 100%)',
              }}
            />
            <div className="dash-hero-content">
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-1) var(--space-3)', background: 'rgba(255,255,255,0.15)', borderRadius: 'var(--radius-full)', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 600 }}>
                Penetração de Mercado
              </div>
              <h1 style={{ color: '#fff', fontSize: 'var(--text-3xl)', fontWeight: 700, marginTop: 'var(--space-3)', letterSpacing: '-0.02em' }}>
                Análise de Penetração
              </h1>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-3)', marginTop: 'var(--space-5)' }}>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-5)', color: '#fff', minWidth: 100 }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{totalClientes}</div>
                  <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8, marginTop: 2 }}>Clientes</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-5)', color: '#fff', minWidth: 100 }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{totalEstados}</div>
                  <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8, marginTop: 2 }}>Estados</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-5)', color: '#fff', minWidth: 100 }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{totalCulturas}</div>
                  <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8, marginTop: 2 }}>Culturas</div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-3) var(--space-5)', color: '#fff', minWidth: 100 }}>
                  <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 700 }}>{areaMil.toFixed(1).replace('.', ',')}k</div>
                  <div style={{ fontSize: 'var(--text-xs)', opacity: 0.8, marginTop: 2 }}>Hectares</div>
                </div>
              </div>
            </div>
          </div>

          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-label">Estados Cobertos</div>
              <div className="kpi-value">{totalEstados}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Culturas Mapeadas</div>
              <div className="kpi-value">{totalCulturas}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Área Total</div>
              <div className="kpi-value" style={{ fontSize: 'var(--text-xl)' }}>{totalArea.toLocaleString('pt-BR')} ha</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-label">Faturamento Total</div>
              <div className="kpi-value" style={{ fontSize: 'var(--text-xl)' }}>{fmt(totalFaturamento)}</div>
            </div>
          </div>

          <div className="chart-grid">
            <div className="card">
              <div className="card-header"><h2>Faturamento por Estado (Top 10)</h2></div>
              <div className="card-body">
                <div className="chart-container">
                  <HighchartsReact highcharts={Highcharts} options={stateChartOptions} />
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-header"><h2>Clientes por Cultura</h2></div>
              <div className="card-body">
                <div className="chart-container">
                  <HighchartsReact highcharts={Highcharts} options={cultureChartOptions} />
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2>Detalhamento por Estado</h2>
            </div>
            <div className="card-body">
              {penetrationByState.length === 0 ? (
                <div className="empty-state"><h3>Nenhum estado encontrado</h3><p>Importe dados para ver o detalhamento por estado.</p></div>
              ) : (
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Estado</th>
                        <th>Clientes</th>
                        <th>Área Total (ha)</th>
                        <th>Faturamento Total</th>
                        <th>Part. Fat. (%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {penetrationByState.map(([state, d], i) => {
                        const part = totalFaturamentoGeral > 0 ? (d.faturamento / totalFaturamentoGeral) * 100 : 0
                        return (
                          <tr key={state}>
                            <td>{i + 1}</td>
                            <td><strong>{state}</strong></td>
                            <td>{d.clientes}</td>
                            <td>{new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(d.area)}</td>
                            <td>{fmt(d.faturamento)}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                                <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                                  <div style={{ width: `${part}%`, height: '100%', background: '#22c55e', borderRadius: 4 }} />
                                </div>
                                <span style={{ fontSize: 'var(--text-xs)', minWidth: 42, textAlign: 'right' }}>{part.toFixed(1)}%</span>
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
        </>
      )}
    </AppLayout>
  )
}
