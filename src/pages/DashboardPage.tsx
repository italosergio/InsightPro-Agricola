import { useMemo, useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '@/store/DataContext'
import { useTheme } from '@/store/ThemeContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePageTitle } from '@/hooks/useTheme'
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber'
import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'
import { LazyChart } from '@/components/LazyChart'

// ── HC Theme ────────────────────────────────────────────────────────────────

function buildHCTheme(theme: 'light' | 'dark') {
  const isDark = theme === 'dark'
  return {
    chart: {
      backgroundColor: 'transparent',
      style: { fontFamily: 'Inter, system-ui, sans-serif' },
      animation: { duration: 900, easing: 'easeOutQuart' },
      spacing: [8, 8, 8, 8],
    },
    title: { style: { color: isDark ? '#edfcf2' : '#1c1917', fontSize: '14px', fontWeight: '600' } },
    legend: {
      itemStyle: { color: isDark ? '#8fad9a' : '#57534e', fontSize: '11px', fontWeight: '500' },
      itemHoverStyle: { color: isDark ? '#edfcf2' : '#1c1917' },
    },
    xAxis: {
      labels: { style: { color: isDark ? '#5a7a66' : '#78716c', fontSize: '11px' } },
      lineColor: isDark ? '#1a2e20' : '#e7e5e4',
      tickColor: isDark ? '#1a2e20' : '#e7e5e4',
      gridLineColor: isDark ? '#1a2e20' : '#f5f5f4',
      title: { style: { color: isDark ? '#5a7a66' : '#78716c' } },
    },
    yAxis: {
      labels: { style: { color: isDark ? '#5a7a66' : '#78716c', fontSize: '11px' } },
      lineColor: isDark ? '#1a2e20' : '#e7e5e4',
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
      pie: { borderWidth: 0 },
    },
    credits: { enabled: false },
  }
}

// ── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({ label, value, format, trend, trendLabel, icon, accentColor }: {
  label: string
  value: number
  format: (v: number) => string
  trend?: 'positive' | 'negative' | 'neutral'
  trendLabel?: string
  icon: string
  accentColor?: string
}) {
  const animated = useAnimatedNumber(value)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.style.setProperty('--num', String(animated))
  }, [animated])

  return (
    <div className="kpi-card dash-kpi-card" style={{ '--kpi-accent': accentColor || 'var(--color-primary)' } as React.CSSProperties}>
      <div className="kpi-card-top">
        <div className="kpi-label">{label}</div>
        <div className="dash-kpi-icon" style={{ color: accentColor || 'var(--color-primary)', background: accentColor ? `${accentColor}18` : 'var(--color-primary-subtle)' }}
          dangerouslySetInnerHTML={{ __html: icon }} />
      </div>
      <div className="kpi-value" ref={ref}>{format(animated)}</div>
      {trend && trendLabel && (
        <div className={`kpi-trend ${trend}`}>{trendLabel}</div>
      )}
      <div className="dash-kpi-bar" style={{ background: accentColor || 'var(--color-primary)' }} />
    </div>
  )
}

// ── Stat Chip ────────────────────────────────────────────────────────────────

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="dash-stat-chip" style={{ '--chip-color': color } as React.CSSProperties}>
      <div className="dash-stat-chip-value">{value}</div>
      <div className="dash-stat-chip-label">{label}</div>
    </div>
  )
}

// ── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, sub, link, linkLabel }: { title: string; sub?: string; link?: string; linkLabel?: string }) {
  return (
    <div className="dash-section-header">
      <div>
        <h2 className="dash-section-title">{title}</h2>
        {sub && <p className="dash-section-sub">{sub}</p>}
      </div>
      {link && <Link to={link} className="dash-section-link">{linkLabel || 'Ver mais →'}</Link>}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { rawData } = useData()
  const { theme } = useTheme()
  usePageTitle('Dashboard')

  const hcTheme = useMemo(() => buildHCTheme(theme), [theme])
  const isDark = theme === 'dark'

  // ── Core metrics ──────────────────────────────────────────────────────────
  const totalClientes   = rawData.length
  const totalFaturamento = useMemo(() => rawData.reduce((s, c) => s + c.faturamento_anual, 0), [rawData])
  const totalPotencial  = useMemo(() => rawData.reduce((s, c) => s + c.potencial_compra, 0), [rawData])
  const totalArea       = useMemo(() => rawData.reduce((s, c) => s + c.area_hectares, 0), [rawData])
  const clientesAtivos  = useMemo(() => rawData.filter(c => c.status === 'ativo').length, [rawData])
  const clientesInativos = useMemo(() => rawData.filter(c => c.status === 'inativo').length, [rawData])
  const clientesProspect = useMemo(() => rawData.filter(c => c.status === 'prospect').length, [rawData])
  const ticketMedio     = totalClientes > 0 ? totalFaturamento / totalClientes : 0
  const taxaAtivacao    = totalClientes > 0 ? (clientesAtivos / totalClientes) * 100 : 0
  const gapPotencial = totalPotencial  // potencial ainda não capturado = o próprio potencial de compra

  // ── Computed maps ─────────────────────────────────────────────────────────
  const faturamentoPorEstado = useMemo(() => {
    const map: Record<string, number> = {}
    rawData.forEach(c => { map[c.estado] = (map[c.estado] || 0) + c.faturamento_anual })
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 10)
  }, [rawData])

  const faturamentoPorCultura = useMemo(() => {
    const map: Record<string, { fat: number; count: number; area: number }> = {}
    rawData.forEach(c => {
      if (!c.cultura_principal) return
      if (!map[c.cultura_principal]) map[c.cultura_principal] = { fat: 0, count: 0, area: 0 }
      map[c.cultura_principal].fat += c.faturamento_anual
      map[c.cultura_principal].count += 1
      map[c.cultura_principal].area += c.area_hectares
    })
    return Object.entries(map).sort(([, a], [, b]) => b.fat - a.fat).slice(0, 8)
  }, [rawData])

  const areaPorEstado = useMemo(() => {
    const map: Record<string, number> = {}
    rawData.forEach(c => { map[c.estado] = (map[c.estado] || 0) + c.area_hectares })
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 8)
  }, [rawData])

  const topClientes = useMemo(() =>
    [...rawData].sort((a, b) => b.faturamento_anual - a.faturamento_anual).slice(0, 10)
  , [rawData])

  // ABC classification
  const abcData = useMemo(() => {
    const sorted = [...rawData].sort((a, b) => b.faturamento_anual - a.faturamento_anual)
    let cumulative = 0
    const totalFat = sorted.reduce((s, c) => s + c.faturamento_anual, 0)
    let classA = 0, classB = 0, classC = 0
    sorted.forEach(c => {
      cumulative += c.faturamento_anual
      const pct = totalFat > 0 ? cumulative / totalFat : 0
      if (pct <= 0.8) classA++
      else if (pct <= 0.95) classB++
      else classC++
    })
    return { classA, classB, classC }
  }, [rawData])

  // Format helpers
  const fmt = {
    currency: (v: number) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v),
    number: (v: number) => new Intl.NumberFormat('pt-BR').format(v),
    short: (v: number) => {
      if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(1).replace('.', ',')} Bi`
      if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1).replace('.', ',')} Mi`
      return fmt.currency(v)
    },
  }

  // ── Chart Options ─────────────────────────────────────────────────────────

  const estadoChartOpts = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'bar', height: 300 },
    title: { text: undefined },
    xAxis: { ...hcTheme.xAxis, categories: faturamentoPorEstado.map(([e]) => e) },
    yAxis: {
      ...hcTheme.yAxis,
      labels: { ...hcTheme.yAxis?.labels, formatter: function () { return `R$${Highcharts.numberFormat(this.value as number / 1e6, 0)}Mi` } },
    },
    tooltip: {
      ...hcTheme.tooltip,
      formatter: function () { return `<b>${this.x}</b><br/>R$ ${Highcharts.numberFormat(this.y as number, 0, ',', '.')}` },
    },
    plotOptions: { ...hcTheme.plotOptions, series: { animation: { duration: 800 } }, bar: { ...hcTheme.plotOptions?.bar, dataLabels: { enabled: false } } },
    colors: ['#16a34a','#22c55e','#34d464','#4ade80','#86efac','#3b82f6','#6366f1','#8b5cf6','#a855f7','#ec4899'],
    series: [{ type: 'bar', name: 'Faturamento', data: faturamentoPorEstado.map(([, v]) => v), showInLegend: false }],
  }), [faturamentoPorEstado, hcTheme])

  const statusChartOpts = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'pie', height: 240 },
    title: { text: undefined },
    tooltip: {
      ...hcTheme.tooltip,
      formatter: function () { return `<b>${(this as any).point?.name}</b>: ${this.y} (${this.percentage?.toFixed(1)}%)` },
    },
    plotOptions: {
      ...hcTheme.plotOptions,
      pie: { innerSize: '60%', borderWidth: 3, borderColor: isDark ? '#0d1710' : '#f8fafc', dataLabels: { enabled: false } },
    },
    legend: { ...hcTheme.legend, enabled: true, layout: 'vertical', align: 'right', verticalAlign: 'middle' },
    colors: ['#22c55e', '#3b82f6', '#ef4444'],
    series: [{
      type: 'pie', name: 'Clientes',
      data: [
        { name: 'Ativos',    y: clientesAtivos   },
        { name: 'Prospects', y: clientesProspect },
        { name: 'Inativos',  y: clientesInativos },
      ],
    }],
  }), [clientesAtivos, clientesInativos, clientesProspect, hcTheme, isDark])

  const culturaChartOpts = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'column', height: 280 },
    title: { text: undefined },
    xAxis: {
      ...hcTheme.xAxis,
      categories: faturamentoPorCultura.map(([c]) => c.length > 12 ? c.substring(0, 12) + '…' : c),
    },
    yAxis: {
      ...hcTheme.yAxis,
      labels: { ...hcTheme.yAxis?.labels, formatter: function () { return `${Highcharts.numberFormat(this.value as number / 1e6, 0)}Mi` } },
    },
    tooltip: {
      ...hcTheme.tooltip,
      formatter: function () { return `<b>${this.x}</b><br/>Faturamento: R$ ${Highcharts.numberFormat(this.y as number, 0, ',', '.')}` },
    },
    plotOptions: { ...hcTheme.plotOptions, series: { animation: { duration: 800 } }, column: { ...hcTheme.plotOptions?.column } },
    colors: ['#16a34a','#22c55e','#34d464','#3b82f6','#6366f1','#a855f7','#ec4899','#f59e0b'],
    series: [{ type: 'column', name: 'Faturamento', data: faturamentoPorCultura.map(([, v]) => v.fat), showInLegend: false }],
  }), [faturamentoPorCultura, hcTheme])

  const areaEstadoChartOpts = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'bar', height: 280 },
    title: { text: undefined },
    xAxis: { ...hcTheme.xAxis, categories: areaPorEstado.map(([e]) => e) },
    yAxis: {
      ...hcTheme.yAxis,
      labels: { ...hcTheme.yAxis?.labels, formatter: function () { return `${Highcharts.numberFormat(this.value as number / 1000, 0)}k ha` } },
    },
    tooltip: {
      ...hcTheme.tooltip,
      formatter: function () { return `<b>${this.x}</b><br/>${Highcharts.numberFormat(this.y as number, 0, ',', '.')} ha` },
    },
    plotOptions: { ...hcTheme.plotOptions, series: { animation: { duration: 800 } }, bar: { ...hcTheme.plotOptions?.bar } },
    colors: ['#059669','#10b981','#34d464','#4ade80','#86efac','#a3e635','#facc15','#f97316'],
    series: [{ type: 'bar', name: 'Área (ha)', data: areaPorEstado.map(([, v]) => v), showInLegend: false }],
  }), [areaPorEstado, hcTheme])

  const potencialChartOpts = useMemo<Highcharts.Options>(() => {
    const top6 = faturamentoPorEstado.slice(0, 6)
    const potencialPorEstado = top6.map(([estado]) =>
      rawData.filter(c => c.estado === estado).reduce((s, c) => s + c.potencial_compra, 0)
    )
    const totalPot = potencialPorEstado.reduce((s, v) => s + v, 0)

    return Highcharts.merge(hcTheme, {
      chart: { type: 'bar', height: 260 },
      xAxis: { categories: top6.map(([e]) => e) },
      yAxis: {
        labels: {
          formatter: function (this: Highcharts.AxisLabelsFormatterContextObject) {
            return `R$ ${Highcharts.numberFormat(Number(this.value) / 1e6, 0)}Mi`
          },
        },
      },
      tooltip: {
        formatter: function (this: any) {
          const pct = totalPot > 0 ? ((this.y as number) / totalPot * 100).toFixed(1) : '0'
          return `<b>${this.x}</b><br/>Potencial: R$ ${Highcharts.numberFormat(this.y as number, 0, ',', '.')}<br/>${pct}% do total`
        },
      },
      plotOptions: {
        bar: { borderRadius: 6, borderWidth: 0, colorByPoint: true, dataLabels: { enabled: true, format: 'R$ {point.y:,.0f}', style: { fontSize: '10px', fontWeight: '500', textOutline: 'none' }, color: isDark ? '#d6d3d1' : '#57534e' } },
      },
      colors: ['#22c55e', '#16a34a', '#15803d', '#10b981', '#059669', '#34d464'],
      series: [{ type: 'bar', name: 'Potencial de Compra', data: potencialPorEstado, showInLegend: false }],
    } as Highcharts.Options)
  }, [faturamentoPorEstado, hcTheme, isDark, rawData])

  // ── Empty State ───────────────────────────────────────────────────────────

  if (totalClientes === 0) {
    return (
      <AppLayout title="Dashboard" subtitle="Visão geral da carteira">
        <div className="dash-hero dash-hero--empty">
          <div className="dash-hero-bg" />
          <div className="dash-hero-content" style={{ textAlign: 'center', maxWidth: 520 }}>
            <div className="home-hero-badge" style={{ margin: '0 auto var(--space-4)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </div>
            <h1 className="home-hero-title" style={{ textAlign: 'center' }}>Nenhum dado ainda</h1>
            <p className="home-hero-subtitle" style={{ textAlign: 'center' }}>Importe sua carteira de clientes via CSV para visualizar todos os indicadores e gráficos.</p>
            <div className="home-hero-cta" style={{ justifyContent: 'center' }}>
              <Link to="/upload" className="btn btn--primary btn--lg">Importar Dados CSV</Link>
            </div>
          </div>
          <div className="home-hero-decoration">
            <div className="home-hero-circle home-hero-circle--1" />
            <div className="home-hero-circle home-hero-circle--2" />
          </div>
        </div>
      </AppLayout>
    )
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <AppLayout title="Dashboard" subtitle="Visão geral da carteira de clientes">

      {/* ── HERO BANNER ──────────────────────────────────────────────── */}
      <div className="dash-hero">
        <div className="dash-hero-bg" />
        <div className="dash-hero-content">
          <div className="home-hero-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 14, height: 14 }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Visão Geral da Carteira
          </div>
          <h1 className="home-hero-title" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>
            <span className="home-hero-title-accent">{fmt.number(totalClientes)} clientes</span> ativos na base
          </h1>
          <p className="home-hero-subtitle" style={{ fontSize: 'var(--text-sm)' }}>
            Carteira com faturamento total de <strong style={{ color: '#86efac' }}>{fmt.short(totalFaturamento)}</strong> e potencial de compra estimado em <strong style={{ color: '#fbbf24' }}>{fmt.short(totalPotencial)}</strong>
          </p>
          <div className="home-hero-kpis">
            <DashHeroKpi label="Clientes" value={totalClientes} />
            <DashHeroKpi label="Faturamento" value={totalFaturamento} mode="currency" />
            <DashHeroKpi label="Potencial" value={totalPotencial} mode="currency" />
            <DashHeroKpi label="Área Total" value={totalArea} mode="ha" />
            <DashHeroKpi label="Ticket Médio" value={ticketMedio} mode="currency" />
            <DashHeroKpi label="Taxa Ativação" value={taxaAtivacao} mode="pct" />
          </div>
        </div>
        <div className="home-hero-decoration">
          <div className="home-hero-circle home-hero-circle--1" />
          <div className="home-hero-circle home-hero-circle--2" />
          <div className="home-hero-circle home-hero-circle--3" />
        </div>
      </div>

      {/* ── KPI GRID ─────────────────────────────────────────────────── */}
      <div className="kpi-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <KpiCard label="Total de Clientes" value={totalClientes}
          format={v => fmt.number(Math.round(v))} trend="positive" trendLabel={`${clientesAtivos} ativos`}
          accentColor="#22c55e"
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>'
        />
        <KpiCard label="Faturamento Total" value={totalFaturamento}
          format={fmt.short} accentColor="#3b82f6"
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
        />
        <KpiCard label="Potencial de Compra" value={totalPotencial}
          format={fmt.short} trend="positive" trendLabel={`Gap: ${fmt.short(gapPotencial)}`}
          accentColor="#a855f7"
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>'
        />
        <KpiCard label="Área Total" value={totalArea}
          format={v => `${fmt.number(Math.round(v))} ha`} accentColor="#10b981"
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 22L22 2"/><path d="M18 22l4-4"/><path d="M2 6l4-4"/><path d="M22 10V2h-8"/><path d="M2 14v8h8"/></svg>'
        />
        <KpiCard label="Ticket Médio" value={ticketMedio}
          format={fmt.short} trend="positive" trendLabel="por cliente"
          accentColor="#f59e0b"
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>'
        />
        <KpiCard label="Prospects" value={clientesProspect}
          format={v => fmt.number(Math.round(v))}
          trend={clientesInativos > 0 ? 'negative' : 'neutral'}
          trendLabel={`${clientesInativos} inativos`}
          accentColor="#ec4899"
          icon='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>'
        />
      </div>

      {/* ── STAT CHIPS ROW ───────────────────────────────────────────── */}
      <div className="dash-chips-row">
        <StatChip label="Classe A (80% fat.)" value={`${abcData.classA} clientes`} color="#22c55e" />
        <StatChip label="Classe B (15% fat.)" value={`${abcData.classB} clientes`} color="#3b82f6" />
        <StatChip label="Classe C (5% fat.)" value={`${abcData.classC} clientes`} color="#a855f7" />
        <StatChip label="Taxa de Ativação" value={`${taxaAtivacao.toFixed(1)}%`} color="#f59e0b" />
        <StatChip label="Maior Cliente" value={fmt.short(topClientes[0]?.faturamento_anual || 0)} color="#ec4899" />
        <StatChip label="Culturas Ativas" value={`${faturamentoPorCultura.length} tipos`} color="#10b981" />
      </div>

      {/* ── ROW 1: ESTADO + STATUS ───────────────────────────────────── */}
      <div className="chart-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><SectionHeader title="Faturamento por Estado" sub="Top 10 estados" link="/analise-abc" linkLabel="Análise ABC →" /></div>
          <div className="card-body">
            <LazyChart options={estadoChartOpts} />
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><SectionHeader title="Distribuição de Status" /></div>
          <div className="card-body">
            <LazyChart options={statusChartOpts} />
            <div className="dash-status-legend">
              <div className="dash-status-item"><span style={{ background: '#22c55e' }} /><span>Ativos</span><strong>{clientesAtivos}</strong></div>
              <div className="dash-status-item"><span style={{ background: '#3b82f6' }} /><span>Prospects</span><strong>{clientesProspect}</strong></div>
              <div className="dash-status-item"><span style={{ background: '#ef4444' }} /><span>Inativos</span><strong>{clientesInativos}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* ── ROW 2: CULTURA + ÁREA ────────────────────────────────────── */}
      <div className="chart-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><SectionHeader title="Faturamento por Cultura" sub="Top 8 culturas" link="/penetracao" linkLabel="Ver penetração →" /></div>
          <div className="card-body">
            <LazyChart options={culturaChartOpts} />
          </div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><SectionHeader title="Área por Estado" sub="Hectares cadastrados" /></div>
          <div className="card-body">
            <LazyChart options={areaEstadoChartOpts} />
          </div>
        </div>
      </div>

      {/* ── ROW 3: FAT vs POTENCIAL ──────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <SectionHeader title="Potencial de Compra por Estado" sub="Estimativa de compras de insumos por estado — top 6" link="/penetracao" />
        </div>
        <div className="card-body">
          <LazyChart options={potencialChartOpts} />
        </div>
      </div>

      {/* ── CULTURA TABLE ────────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <SectionHeader title="Resumo por Cultura" sub="Faturamento, área e clientes por cultura principal" />
        </div>

        {/* Desktop table */}
        <div className="card-body desktop-only" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Cultura</th>
                  <th>Clientes</th>
                  <th>Área Total (ha)</th>
                  <th>Faturamento</th>
                  <th>% do Total</th>
                </tr>
              </thead>
              <tbody>
                {faturamentoPorCultura.map(([cultura, v]) => (
                  <tr key={cultura}>
                    <td><strong>{cultura}</strong></td>
                    <td>{v.count}</td>
                    <td>{fmt.number(Math.round(v.area))}</td>
                    <td>{fmt.short(v.fat)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 6, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${totalFaturamento > 0 ? (v.fat / totalFaturamento) * 100 : 0}%`, background: 'var(--color-primary)', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', minWidth: 34 }}>
                          {totalFaturamento > 0 ? ((v.fat / totalFaturamento) * 100).toFixed(1) : '0'}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="mobile-only" style={{ padding: 0 }}>
          {faturamentoPorCultura.map(([cultura, v]) => {
            const pct = totalFaturamento > 0 ? ((v.fat / totalFaturamento) * 100).toFixed(1) : '0'
            return (
              <div key={cultura} className="mobile-cultura-card">
                <div className="mobile-cultura-card-header">
                  <span className="mobile-cultura-card-name">{cultura}</span>
                  <span className="mobile-cultura-card-pct">{pct}%</span>
                </div>
                <div className="mobile-cultura-card-stats">
                  <div className="mobile-cultura-card-stat">
                    <span className="mobile-cultura-card-stat-value">{v.count}</span>
                    <span className="mobile-cultura-card-stat-label">Clientes</span>
                  </div>
                  <div className="mobile-cultura-card-stat">
                    <span className="mobile-cultura-card-stat-value">{fmt.short(v.fat)}</span>
                    <span className="mobile-cultura-card-stat-label">Faturamento</span>
                  </div>
                  <div className="mobile-cultura-card-stat">
                    <span className="mobile-cultura-card-stat-value">{fmt.number(Math.round(v.area))} ha</span>
                    <span className="mobile-cultura-card-stat-label">Área</span>
                  </div>
                </div>
                <div className="mobile-cultura-card-bar">
                  <div className="mobile-cultura-card-bar-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* ── TOP 10 CLIENTES ──────────────────────────────────────────── */}
      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header">
          <SectionHeader title="Top 10 Clientes" sub="Por faturamento anual" link="/clientes" linkLabel="Ver todos →" />
        </div>

        {/* Desktop table */}
        <div className="card-body desktop-only" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead>
                <tr><th>#</th><th>Cliente</th><th>Cidade/UF</th><th>Cultura</th><th>Faturamento</th><th>Potencial</th><th>Área</th><th>Status</th></tr>
              </thead>
              <tbody>
                {topClientes.map((c, i) => (
                  <tr key={c.id}>
                    <td>
                      <span className={`dash-rank dash-rank--${i < 3 ? ['gold','silver','bronze'][i] : 'default'}`}>{i + 1}</span>
                    </td>
                    <td><strong>{c.nome}</strong></td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>{c.cidade}/{c.estado}</td>
                    <td><span className="badge badge--neutral">{c.cultura_principal}</span></td>
                    <td><strong>{fmt.short(c.faturamento_anual)}</strong></td>
                    <td style={{ color: 'var(--text-tertiary)' }}>{fmt.short(c.potencial_compra)}</td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>{fmt.number(c.area_hectares)} ha</td>
                    <td>
                      <span className={`badge badge--${c.status === 'ativo' ? 'success' : c.status === 'prospect' ? 'info' : 'error'}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile cards */}
        <div className="mobile-only" style={{ padding: 0 }}>
          {topClientes.map((c, i) => {
            const rankClass = i < 3 ? ['gold','silver','bronze'][i] : 'default'
            return (
              <div key={c.id} className="mobile-client-card">
                <div>
                  <span className={`mobile-client-card-rank mobile-client-card-rank--${rankClass}`}>{i + 1}</span>
                  <span className="mobile-client-card-name">{c.nome}</span>
                </div>
                <div className="mobile-client-card-meta">{c.cidade}/{c.estado} · <span className="badge badge--neutral">{c.cultura_principal}</span></div>
                <div className="mobile-client-card-row">
                  <div className="mobile-client-card-stat">
                    <span className="mobile-client-card-stat-value">{fmt.short(c.faturamento_anual)}</span>
                    <span className="mobile-client-card-stat-label">Faturamento</span>
                  </div>
                  <div className="mobile-client-card-stat">
                    <span className="mobile-client-card-stat-value">{fmt.short(c.potencial_compra)}</span>
                    <span className="mobile-client-card-stat-label">Potencial</span>
                  </div>
                  <div className="mobile-client-card-stat">
                    <span className="mobile-client-card-stat-value">{fmt.number(c.area_hectares)} ha</span>
                    <span className="mobile-client-card-stat-label">Área</span>
                  </div>
                </div>
                <div className="mobile-client-card-status">
                  <span className={`badge badge--${c.status === 'ativo' ? 'success' : c.status === 'prospect' ? 'info' : 'error'}`}>
                    {c.status}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>

    </AppLayout>
  )
}

// ── Hero animated KPI chip ───────────────────────────────────────────────────

function DashHeroKpi({ label, value, mode }: { label: string; value: number; mode?: 'currency' | 'ha' | 'pct' }) {
  const animated = useAnimatedNumber(value)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.style.setProperty('--num', String(animated))
  }, [animated])

  const display = () => {
    if (mode === 'currency') {
      if (value >= 1e9) return `R$ ${(animated / 1e9).toFixed(1).replace('.', ',')} Bi`
      if (value >= 1e6) return `R$ ${(animated / 1e6).toFixed(1).replace('.', ',')} Mi`
      return `R$ ${Math.round(animated).toLocaleString('pt-BR')}`
    }
    if (mode === 'ha') return `${Math.round(animated).toLocaleString('pt-BR')} ha`
    if (mode === 'pct') return `${animated.toFixed(1)}%`
    return Math.round(animated).toLocaleString('pt-BR')
  }

  return (
    <div className="home-kpi-chip" ref={ref}>
      <div className="home-kpi-chip-value">{display()}</div>
      <div className="home-kpi-chip-label">{label}</div>
    </div>
  )
}

