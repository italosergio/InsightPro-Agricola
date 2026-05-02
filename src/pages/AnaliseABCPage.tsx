import { useMemo, useRef } from 'react'
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
      animation: { duration: 800 },
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
      series: {
        animation: { duration: 800 },
      },
      bar: {
        borderRadius: 4,
      },
      column: {
        borderRadius: 4,
      },
    },
    credits: { enabled: false },
  }
}

export function AnaliseABCPage() {
  const { filteredData, rawData } = useData()
  const { theme } = useTheme()
  usePageTitle('Analise ABC')

  const data = filteredData.length > 0 ? filteredData : rawData

  const hcTheme = useMemo(() => buildHCTheme(theme), [theme])

  const abcData = useMemo(() => {
    const sorted = [...data].sort((a, b) => b.faturamento_anual - a.faturamento_anual)
    const totalFaturamento = sorted.reduce((sum, c) => sum + c.faturamento_anual, 0)

    let cumulative = 0
    return sorted.map(cliente => {
      cumulative += cliente.faturamento_anual
      const percentage = (cumulative / totalFaturamento) * 100
      const classe = percentage <= 80 ? 'A' : percentage <= 95 ? 'B' : 'C'
      return { ...cliente, classe, percentage }
    })
  }, [data])

  const classCounts = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0 }
    abcData.forEach(c => counts[c.classe as 'A' | 'B' | 'C']++)
    return counts
  }, [abcData])

  const classRevenue = useMemo(() => {
    const revenue = { A: 0, B: 0, C: 0 }
    abcData.forEach(c => revenue[c.classe as 'A' | 'B' | 'C'] += c.faturamento_anual)
    return revenue
  }, [abcData])

  const fmt = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)

  const totalFat = data.reduce((sum, c) => sum + c.faturamento_anual, 0)

  const barChartRef = useRef<HighchartsReact.RefObject>(null)
  const donutChartRef = useRef<HighchartsReact.RefObject>(null)

  const barOpts = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'column', height: 280 },
    title: { text: undefined },
    xAxis: {
      ...hcTheme.xAxis,
      categories: ['Classe A', 'Classe B', 'Classe C'],
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
    },
    colors: ['#22c55e', '#f59e0b', '#ef4444'],
    series: [{
      type: 'column',
      name: 'Faturamento',
      data: [classRevenue.A, classRevenue.B, classRevenue.C],
      showInLegend: false,
    }],
  }), [classRevenue, hcTheme])

  const donutOpts = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'pie', height: 280 },
    title: { text: undefined },
    tooltip: {
      ...hcTheme.tooltip,
      pointFormatter: function () {
        return `<b>${this.y}</b> (${this.percentage?.toFixed(1)}%)`
      },
    },
    plotOptions: {
      ...hcTheme.plotOptions,
      pie: {
        innerSize: '55%',
        borderRadius: 6,
        borderWidth: 2,
        borderColor: theme === 'dark' ? '#1c1917' : '#ffffff',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f}%',
          style: { fontSize: '12px', fontWeight: '500', textOutline: 'none' },
          color: theme === 'dark' ? '#d6d3d1' : '#57534e',
        },
      },
    },
    colors: ['#22c55e', '#f59e0b', '#ef4444'],
    series: [{
      type: 'pie',
      name: 'Clientes',
      data: [
        { name: 'Classe A', y: classCounts.A },
        { name: 'Classe B', y: classCounts.B },
        { name: 'Classe C', y: classCounts.C },
      ],
    }],
  }), [classCounts, hcTheme, theme])

  if (data.length === 0) {
    return (
      <AppLayout title="Analise ABC" subtitle="Classificacao de clientes por faturamento">
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3>Nenhum dado cadastrado</h3>
              <p>Importe seus dados via CSV para comecar a classificar seus clientes.</p>
              <a href="/upload" className="btn btn--primary" style={{ marginTop: 'var(--space-4)' }}>Importar Dados</a>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Analise ABC" subtitle="Classificacao de clientes por faturamento">
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--green" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <div className="page-hero-eyebrow">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10" /><path d="M18 20V4" /><path d="M6 20v-4" /></svg>
              Classificacao ABC
            </div>
            <h1 className="page-hero-title">Analise ABC</h1>
            <p className="page-hero-subtitle">Classificacao de clientes por faturamento anual — Curva ABC (80/15/5)</p>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{classCounts.A}</span>
              <span className="page-hero-kpi-label">Classe A</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{classCounts.B}</span>
              <span className="page-hero-kpi-label">Classe B</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{classCounts.C}</span>
              <span className="page-hero-kpi-label">Classe C</span>
            </div>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card" style={{ borderLeft: '3px solid #22c55e' }}>
          <div className="kpi-label">Classe A — Elite</div>
          <div className="kpi-value">{classCounts.A}</div>
          <div className="kpi-trend positive">{fmt(classRevenue.A)}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            {totalFat > 0 ? ((classRevenue.A / totalFat) * 100).toFixed(1) : 0}% do faturamento
          </div>
        </div>
        <div className="kpi-card" style={{ borderLeft: '3px solid #f59e0b' }}>
          <div className="kpi-label">Classe B — Importantes</div>
          <div className="kpi-value">{classCounts.B}</div>
          <div className="kpi-trend" style={{ color: 'var(--color-warning)', background: 'var(--color-warning-bg)' }}>{fmt(classRevenue.B)}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            {totalFat > 0 ? ((classRevenue.B / totalFat) * 100).toFixed(1) : 0}% do faturamento
          </div>
        </div>
        <div className="kpi-card" style={{ borderLeft: '3px solid #ef4444' }}>
          <div className="kpi-label">Classe C — Demais</div>
          <div className="kpi-value">{classCounts.C}</div>
          <div className="kpi-trend negative">{fmt(classRevenue.C)}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', marginTop: 'var(--space-1)' }}>
            {totalFat > 0 ? ((classRevenue.C / totalFat) * 100).toFixed(1) : 0}% do faturamento
          </div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Total Analisado</div>
          <div className="kpi-value">{data.length}</div>
          <div className="kpi-trend positive">{fmt(totalFat)}</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header">
            <h2>Faturamento por Classe</h2>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <HighchartsReact highcharts={Highcharts} options={barOpts} ref={barChartRef} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Distribuicao de Clientes</h2>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <HighchartsReact highcharts={Highcharts} options={donutOpts} ref={donutChartRef} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Detalhamento</h2>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Cliente</th>
                  <th>Cidade</th>
                  <th>Faturamento</th>
                  <th>% Acumulada</th>
                  <th>Classe</th>
                </tr>
              </thead>
              <tbody>
                {abcData.map((c, i) => (
                  <tr key={c.id}>
                    <td>{i + 1}</td>
                    <td><strong>{c.nome}</strong></td>
                    <td>{c.cidade}/{c.estado}</td>
                    <td>{fmt(c.faturamento_anual)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
                          <div style={{ width: `${Math.min(c.percentage, 100)}%`, height: '100%', background: c.classe === 'A' ? '#22c55e' : c.classe === 'B' ? '#f59e0b' : '#ef4444', borderRadius: 'var(--radius-full)' }} />
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)', minWidth: 48, textAlign: 'right' }}>{c.percentage.toFixed(1)}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge badge--${c.classe === 'A' ? 'success' : c.classe === 'B' ? 'warning' : 'error'}`}>
                        {c.classe}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
