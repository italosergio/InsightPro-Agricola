import { useMemo, useRef, useEffect } from 'react'
import { useData } from '@/store/DataContext'
import { useTheme } from '@/store/ThemeContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePageTitle } from '@/hooks/useTheme'
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'



const colors = ['#22c55e', '#16a34a', '#15803d', '#10b981', '#059669', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899']

function KpiCard({ label, value, format, trend, trendLabel, icon }: {
  label: string
  value: number
  format: (v: number) => string
  trend?: 'positive' | 'negative'
  trendLabel?: string
  icon: string
}) {
  const animated = useAnimatedNumber(value)
  const displayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (displayRef.current) {
      displayRef.current.style.setProperty('--num', String(animated))
    }
  }, [animated])

  return (
    <div className="kpi-card">
      <div className="kpi-card-top">
        <div className="kpi-label">{label}</div>
        <div className="kpi-icon" dangerouslySetInnerHTML={{ __html: icon }} />
      </div>
      <div className="kpi-value" ref={displayRef}>
        {format(animated)}
      </div>
      {trend && trendLabel && (
        <div className={`kpi-trend ${trend}`}>{trendLabel}</div>
      )}
    </div>
  )
}

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
      series: {
        animation: { duration: 1000, easing: 'easeOutQuart' },
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

export function DashboardPage() {
  const { rawData } = useData()
  const { theme } = useTheme()
  usePageTitle('Dashboard')

  const hcTheme = useMemo(() => buildHCTheme(theme), [theme])

  const totalClientes = rawData.length
  const totalFaturamento = rawData.reduce((sum, c) => sum + c.faturamento_anual, 0)
  const totalPotencial = rawData.reduce((sum, c) => sum + c.potencial_compra, 0)
  const totalArea = rawData.reduce((sum, c) => sum + c.area_hectares, 0)
  const clientesAtivos = rawData.filter(c => c.status === 'ativo').length
  const clientesInativos = rawData.filter(c => c.status === 'inativo').length
  const clientesProspect = rawData.filter(c => c.status === 'prospect').length
  const ticketMedio = totalClientes > 0 ? totalFaturamento / totalClientes : 0

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)

  const formatNumber = (value: number) =>
    new Intl.NumberFormat('pt-BR').format(value)

  const formatCurrencyShort = (value: number) => {
    if (value >= 1e9) return `R$ ${(value / 1e9).toFixed(1).replace('.', ',')} Bi`
    if (value >= 1e6) return `R$ ${(value / 1e6).toFixed(1).replace('.', ',')} Mi`
    return formatCurrency(value)
  }

  const faturamentoPorEstado = useMemo(() => {
    const map: Record<string, number> = {}
    rawData.forEach(c => { map[c.estado] = (map[c.estado] || 0) + c.faturamento_anual })
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 10)
  }, [rawData])

  const clientesPorCultura = useMemo(() => {
    const map: Record<string, number> = {}
    rawData.forEach(c => { if (c.cultura_principal) map[c.cultura_principal] = (map[c.cultura_principal] || 0) + 1 })
    return Object.entries(map).sort(([, a], [, b]) => b - a)
  }, [rawData])

  const topClientes = useMemo(() => {
    return [...rawData].sort((a, b) => b.faturamento_anual - a.faturamento_anual).slice(0, 10)
  }, [rawData])

  const estadoChartOptions = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'bar', height: 320 },
    title: { text: undefined },
    xAxis: {
      ...hcTheme.xAxis,
      categories: faturamentoPorEstado.map(([e]) => e),
      reversed: false,
    },
    yAxis: {
      ...hcTheme.yAxis,
      title: { text: undefined },
      labels: {
        ...hcTheme.yAxis?.labels,
        formatter: function () { return `R$${Highcharts.numberFormat(this.value as number, 0, ',', '.')}` },
      },
    },
    tooltip: {
      ...hcTheme.tooltip,
      pointFormatter: function () {
        return `<b>${Highcharts.numberFormat(this.y as number, 0, ',', '.')}</b>`
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
    colors: ['#15803d', '#16a34a', '#22c55e', '#4ade80', '#86efac', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'],
    series: [{
      type: 'bar',
      name: 'Faturamento',
      data: faturamentoPorEstado.map(([, v]) => v),
      showInLegend: false,
    }],
  }), [faturamentoPorEstado, hcTheme, theme])

  const statusChartOptions = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'pie', height: 300 },
    title: { text: undefined },
    tooltip: {
      ...hcTheme.tooltip,
      pointFormatter: function () {
        return `<b>${Highcharts.numberFormat(this.y as number, 0, ',', '.')}</b> (${this.percentage?.toFixed(1)}%)`
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
    colors: ['#22c55e', '#ef4444', '#3b82f6'],
    series: [{
      type: 'pie',
      name: 'Status',
      data: [
        { name: 'Ativos', y: clientesAtivos },
        { name: 'Inativos', y: clientesInativos },
        { name: 'Prospects', y: clientesProspect },
      ],
    }],
  }), [clientesAtivos, clientesInativos, clientesProspect, hcTheme, theme])

  const culturaChartOptions = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'bar', height: 320 },
    title: { text: undefined },
    xAxis: {
      ...hcTheme.xAxis,
      categories: clientesPorCultura.map(([c]) => c.length > 14 ? c.substring(0, 14) + '…' : c),
      reversed: false,
    },
    yAxis: {
      ...hcTheme.yAxis,
      title: { text: undefined },
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
      bar: {
        ...hcTheme.plotOptions?.bar,
        dataLabels: {
          enabled: true,
          style: { fontSize: '11px', fontWeight: '600', textOutline: 'none' },
          color: theme === 'dark' ? '#d6d3d1' : '#57534e',
        },
      },
    },
    colors: ['#059669', '#10b981', '#22c55e', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899', '#f43f5e', '#f97316'],
    series: [{
      type: 'bar',
      name: 'Clientes',
      data: clientesPorCultura.map(([, v]) => v),
      showInLegend: false,
    }],
  }), [clientesPorCultura, hcTheme, theme])

  if (totalClientes === 0) {
    return (
      <AppLayout title="Dashboard" subtitle="Visão geral da carteira de clientes">
        <div className="card">
          <div className="card-body">
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h3>Nenhum dado cadastrado</h3>
              <p>Importe seus dados via CSV para começar a analisar sua carteira de clientes.</p>
              <a href="/upload" className="btn btn--primary" style={{ marginTop: 'var(--space-4)' }}>Importar Dados</a>
            </div>
          </div>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral da carteira de clientes">
      <div className="kpi-grid">
        <KpiCard
          label="Total de Clientes"
          value={totalClientes}
          format={(v) => formatNumber(Math.round(v))}
          trend="positive"
          trendLabel={`${formatNumber(clientesAtivos)} ativos`}
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
        />
        <KpiCard
          label="Faturamento Total"
          value={totalFaturamento}
          format={(v) => formatCurrencyShort(v)}
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
        />
        <KpiCard
          label="Potencial de Compra"
          value={totalPotencial}
          format={(v) => formatCurrencyShort(v)}
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>'
        />
        <KpiCard
          label="Área Total"
          value={totalArea}
          format={(v) => `${formatNumber(Math.round(v))} ha`}
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22L22 2"/><path d="M18 22l4-4"/><path d="M2 6l4-4"/><path d="M22 10V2h-8"/><path d="M2 14v8h8"/></svg>'
        />
        <KpiCard
          label="Ticket Médio"
          value={ticketMedio}
          format={(v) => formatCurrencyShort(v)}
          trend="positive"
          trendLabel="por cliente"
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
        />
        <KpiCard
          label="Prospects"
          value={clientesProspect}
          format={(v) => formatNumber(Math.round(v))}
          trend={clientesInativos > 0 ? 'negative' : undefined}
          trendLabel={`${clientesInativos} inativos`}
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
        />
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header"><h2>Faturamento por Estado</h2></div>
          <div className="card-body">
            <div className="chart-container">
              <HighchartsReact highcharts={Highcharts} options={estadoChartOptions} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Status dos Clientes</h2></div>
          <div className="card-body">
            <div className="chart-container" style={{ maxHeight: 300 }}>
              <HighchartsReact highcharts={Highcharts} options={statusChartOptions} />
            </div>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header"><h2>Clientes por Cultura</h2></div>
          <div className="card-body">
            <div className="chart-container">
              <HighchartsReact highcharts={Highcharts} options={culturaChartOptions} />
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header"><h2>Top 10 Clientes</h2></div>
          <div className="card-body">
            <div className="table-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Cliente</th>
                    <th>Cidade/UF</th>
                    <th>Cultura</th>
                    <th>Faturamento</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {topClientes.map((c, i) => (
                    <tr key={c.id}>
                      <td>{i + 1}</td>
                      <td><strong>{c.nome}</strong></td>
                      <td>{c.cidade}/{c.estado}</td>
                      <td>{c.cultura_principal}</td>
                      <td>{formatCurrency(c.faturamento_anual)}</td>
                      <td><span className={`badge badge--${c.status === 'ativo' ? 'success' : c.status === 'prospect' ? 'info' : 'error'}`}>{c.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
