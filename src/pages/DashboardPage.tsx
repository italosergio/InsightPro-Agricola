import { useMemo, useRef, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '@/store/DataContext'
import { useTheme } from '@/store/ThemeContext'
import { usePageTitle } from '@/hooks/useTheme'
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber'
import Highcharts from 'highcharts'
import { LazyChart } from '@/components/LazyChart'
import { DownloadReportButton } from '@/lib/downloadUtils'
import type { Cliente } from '@/types'

type ClasseABC = 'Todos' | 'A' | 'B' | 'C'

function getClasse(cliente: Cliente, clientes: Cliente[]): ClasseABC {
  const sorted = [...clientes].sort((a, b) => b.faturamento_anual - a.faturamento_anual)
  const total = sorted.reduce((s, c) => s + c.faturamento_anual, 0)
  let acum = 0
  for (const c of sorted) {
    acum += c.faturamento_anual
    if (c.id === cliente.id) {
      const pct = total > 0 ? (acum / total) * 100 : 0
      if (pct <= 80) return 'A'
      if (pct <= 95) return 'B'
      return 'C'
    }
  }
  return 'C'
}

function buildHCTheme(theme: 'light' | 'dark') {
  const isDark = theme === 'dark'
  return {
    chart: { backgroundColor: 'transparent', style: { fontFamily: 'Inter, system-ui, sans-serif' }, animation: { duration: 900, easing: 'easeOutQuart' }, spacing: [8, 8, 8, 8] },
    title: { style: { color: isDark ? '#edfcf2' : '#1c1917', fontSize: '14px', fontWeight: '600' } },
    legend: { itemStyle: { color: isDark ? '#8fad9a' : '#57534e', fontSize: '11px', fontWeight: '500' }, itemHoverStyle: { color: isDark ? '#edfcf2' : '#1c1917' } },
    xAxis: { labels: { style: { color: isDark ? '#5a7a66' : '#78716c', fontSize: '11px' } }, lineColor: isDark ? '#1a2e20' : '#e7e5e4', tickColor: isDark ? '#1a2e20' : '#e7e5e4', gridLineColor: isDark ? '#1a2e20' : '#f5f5f4', title: { style: { color: isDark ? '#5a7a66' : '#78716c' } } },
    yAxis: { labels: { style: { color: isDark ? '#5a7a66' : '#78716c', fontSize: '11px' } }, lineColor: isDark ? '#1a2e20' : '#e7e5e4', tickColor: 'transparent', gridLineColor: isDark ? '#1a2e20' : '#f5f5f4', title: { text: undefined } },
    tooltip: { backgroundColor: isDark ? '#192a1f' : '#ffffff', borderColor: isDark ? '#264033' : '#e7e5e4', borderRadius: 8, style: { color: isDark ? '#edfcf2' : '#1c1917', fontSize: '12px' }, shadow: { offsetX: 0, offsetY: 4, opacity: 0.2, width: 12 } },
    plotOptions: { series: { animation: { duration: 900 } }, bar: { borderRadius: 6, borderWidth: 0 }, column: { borderRadius: 6, borderWidth: 0 }, pie: { borderWidth: 0 } },
    credits: { enabled: false },
  } as Highcharts.Options
}

function KpiCard({ label, value, format, trend, trendLabel, accentColor }: { label: string; value: number; format: (v: number) => string; trend?: 'positive' | 'negative' | 'neutral'; trendLabel?: string; accentColor?: string }) {
  const animated = useAnimatedNumber(value)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => { if (ref.current) ref.current.style.setProperty('--num', String(animated)) }, [animated])
  return (
    <div className="kpi-card dash-kpi-card" style={{ '--kpi-accent': accentColor || 'var(--color-primary)' } as React.CSSProperties}>
      <div className="kpi-card-top"><div className="kpi-label">{label}</div></div>
      <div className="kpi-value" ref={ref}>{format(animated)}</div>
      {trend && trendLabel && <div className={`kpi-trend ${trend}`}>{trendLabel}</div>}
      <div className="dash-kpi-bar" style={{ background: accentColor || 'var(--color-primary)' }} />
    </div>
  )
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return <div className="dash-stat-chip" style={{ '--chip-color': color } as React.CSSProperties}><div className="dash-stat-chip-value">{value}</div><div className="dash-stat-chip-label">{label}</div></div>
}

function SectionHeader({ title, sub, link, linkLabel }: { title: string; sub?: string; link?: string; linkLabel?: string }) {
  return <div className="dash-section-header"><div><h2 className="dash-section-title">{title}</h2>{sub && <p className="dash-section-sub">{sub}</p>}</div>{link && <Link to={link} className="dash-section-link">{linkLabel || 'Ver mais →'}</Link>}</div>
}

export function DashboardPage() {
  const { rawData } = useData()
  const { theme } = useTheme()
  usePageTitle('Dashboard')
  const [abcChartFilter, setAbcChartFilter] = useState<ClasseABC>('Todos')
  const [culturaSort, setCulturaSort] = useState<{ f: string; d: 'asc' | 'desc' }>({ f: 'fat', d: 'desc' })

  const hcTheme = useMemo(() => buildHCTheme(theme), [theme])
  const isDark = theme === 'dark'

  const totalClientes = rawData.length
  const totalFaturamento = useMemo(() => rawData.reduce((s, c) => s + c.faturamento_anual, 0), [rawData])
  const totalPotencial = useMemo(() => rawData.reduce((s, c) => s + c.potencial_compra, 0), [rawData])
  const totalArea = useMemo(() => rawData.reduce((s, c) => s + c.area_hectares, 0), [rawData])
  const clientesAtivos = useMemo(() => rawData.filter(c => c.status === 'ativo').length, [rawData])
  const clientesInativos = useMemo(() => rawData.filter(c => c.status === 'inativo').length, [rawData])
  const clientesProspect = useMemo(() => rawData.filter(c => c.status === 'prospect').length, [rawData])
  const ticketMedio = totalClientes > 0 ? totalFaturamento / totalClientes : 0
  const taxaAtivacao = totalClientes > 0 ? (clientesAtivos / totalClientes) * 100 : 0

  const abcData = useMemo(() => {
    const sorted = [...rawData].sort((a, b) => b.faturamento_anual - a.faturamento_anual)
    let cum = 0; const total = sorted.reduce((s, c) => s + c.faturamento_anual, 0)
    let a = 0, b = 0, c = 0
    sorted.forEach(cl => { cum += cl.faturamento_anual; const pct = total > 0 ? cum / total : 0; if (pct <= 0.8) a++; else if (pct <= 0.95) b++; else c++ })
    return { classA: a, classB: b, classC: c }
  }, [rawData])

  const filteredByAbc = useMemo(() => abcChartFilter === 'Todos' ? rawData : rawData.filter(c => getClasse(c, rawData) === abcChartFilter), [rawData, abcChartFilter])

  const filteredAtivos = useMemo(() => filteredByAbc.filter(c => c.status === 'ativo').length, [filteredByAbc])
  const filteredInativos = useMemo(() => filteredByAbc.filter(c => c.status === 'inativo').length, [filteredByAbc])
  const filteredProspect = useMemo(() => filteredByAbc.filter(c => c.status === 'prospect').length, [filteredByAbc])

  const faturamentoPorEstado = useMemo(() => {
    const map: Record<string, number> = {}
    filteredByAbc.forEach(c => { map[c.estado] = (map[c.estado] || 0) + c.faturamento_anual })
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 10)
  }, [filteredByAbc])

  const faturamentoPorCultura = useMemo(() => {
    const map: Record<string, { fat: number; count: number; area: number }> = {}
    filteredByAbc.forEach(c => { if (!c.cultura_principal) return; if (!map[c.cultura_principal]) map[c.cultura_principal] = { fat: 0, count: 0, area: 0 }; map[c.cultura_principal].fat += c.faturamento_anual; map[c.cultura_principal].count++; map[c.cultura_principal].area += c.area_hectares })
    return Object.entries(map).sort(([, a], [, b]) => b.fat - a.fat).slice(0, 8)
  }, [filteredByAbc])

  const areaPorEstado = useMemo(() => {
    const map: Record<string, number> = {}
    filteredByAbc.forEach(c => { map[c.estado] = (map[c.estado] || 0) + c.area_hectares })
    return Object.entries(map).sort(([, a], [, b]) => b - a).slice(0, 8)
  }, [filteredByAbc])

  const topClientes = useMemo(() => [...rawData].sort((a, b) => b.faturamento_anual - a.faturamento_anual).slice(0, 10), [rawData])

  const sortedCultura = useMemo(() => {
    const arr = faturamentoPorCultura.map(([c, v]) => ({ cultura: c, ...v }))
    arr.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const av = a[culturaSort.f as keyof typeof a] as number
      const bv = b[culturaSort.f as keyof typeof b] as number
      return culturaSort.d === 'asc' ? av - bv : bv - av
    })
    return arr
  }, [faturamentoPorCultura, culturaSort])

  const handleCulturaSort = (field: string) => {
    setCulturaSort(prev => prev.f === field ? { f: field, d: prev.d === 'asc' ? 'desc' : 'asc' } : { f: field, d: 'desc' })
  }

  const fmt = {
    currency: (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v),
    number: (v: number) => new Intl.NumberFormat('pt-BR').format(v),
    short: (v: number) => { if (v >= 1e9) return `R$ ${(v / 1e9).toFixed(1).replace('.', ',')} Bi`; if (v >= 1e6) return `R$ ${(v / 1e6).toFixed(1).replace('.', ',')} Mi`; return fmt.currency(v) },
  }

  const downloadData = useMemo(() => [
    { metrica: 'Total de Clientes', valor: totalClientes }, { metrica: 'Clientes Ativos', valor: clientesAtivos }, { metrica: 'Clientes Inativos', valor: clientesInativos }, { metrica: 'Clientes Prospect', valor: clientesProspect },
    { metrica: 'Faturamento Total', valor: totalFaturamento }, { metrica: 'Potencial de Compra', valor: totalPotencial }, { metrica: 'Área Total (ha)', valor: totalArea }, { metrica: 'Ticket Médio', valor: ticketMedio },
    { metrica: 'Taxa de Ativação (%)', valor: taxaAtivacao }, { metrica: 'Classe A', valor: abcData.classA }, { metrica: 'Classe B', valor: abcData.classB }, { metrica: 'Classe C', valor: abcData.classC },
  ], [totalClientes, clientesAtivos, clientesInativos, clientesProspect, totalFaturamento, totalPotencial, totalArea, ticketMedio, taxaAtivacao, abcData])

  const estadoChartOpts = useMemo<Highcharts.Options>(() => ({
    ...hcTheme, chart: { ...hcTheme.chart, type: 'bar', height: 300 }, title: { text: undefined },
    xAxis: { ...hcTheme.xAxis, categories: faturamentoPorEstado.map(([e]) => e) },
    yAxis: { ...(hcTheme.yAxis as Highcharts.YAxisOptions), labels: { ...(hcTheme.yAxis as Highcharts.YAxisOptions)?.labels, formatter: function () { return `R$${Highcharts.numberFormat(this.value as number / 1e6, 0)}Mi` } } },
    tooltip: { ...hcTheme.tooltip, formatter: function () { return `<b>${this.x}</b><br/>R$ ${Highcharts.numberFormat(this.y as number, 0, ',', '.')}` } },
    plotOptions: { ...hcTheme.plotOptions, bar: { ...hcTheme.plotOptions?.bar, dataLabels: { enabled: false } } },
    colors: ['#16a34a', '#22c55e', '#34d464', '#4ade80', '#86efac', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899'],
    series: [{ type: 'bar', name: 'Faturamento', data: faturamentoPorEstado.map(([, v]) => v), showInLegend: false }],
  }), [faturamentoPorEstado, hcTheme])

  const statusChartOpts = useMemo<Highcharts.Options>(() => ({
    ...hcTheme, chart: { ...hcTheme.chart, type: 'pie', height: 300 }, title: { text: undefined },
    tooltip: { ...hcTheme.tooltip, formatter: function () { return `<b>${(this as any).point?.name}</b>: ${this.y} (${this.percentage?.toFixed(1)}%)` } },
    plotOptions: { pie: { ...hcTheme.plotOptions?.pie, innerSize: '55%', borderWidth: 3, borderColor: isDark ? '#0d1710' : '#f8fafc', dataLabels: { enabled: false } }, series: { animation: { duration: 900 } } },
    legend: { enabled: true, layout: 'horizontal', align: 'center', verticalAlign: 'bottom', itemStyle: { color: isDark ? '#8fad9a' : '#57534e', fontSize: '10px' as any, fontWeight: '500' }, itemDistance: 12, padding: 4 },
    colors: ['#22c55e', '#3b82f6', '#ef4444'],
    series: [{ type: 'pie', name: 'Clientes', data: [{ name: 'Ativos', y: filteredAtivos }, { name: 'Prospects', y: filteredProspect }, { name: 'Inativos', y: filteredInativos }] }],
  }), [filteredAtivos, filteredInativos, filteredProspect, hcTheme, isDark])

  const culturaChartOpts = useMemo<Highcharts.Options>(() => ({
    ...hcTheme, chart: { ...hcTheme.chart, type: 'column', height: 280 }, title: { text: undefined },
    xAxis: { ...hcTheme.xAxis, categories: faturamentoPorCultura.map(([c]) => c.length > 12 ? c.substring(0, 12) + '…' : c) },
    yAxis: { ...(hcTheme.yAxis as Highcharts.YAxisOptions), labels: { ...(hcTheme.yAxis as Highcharts.YAxisOptions)?.labels, formatter: function () { return `${Highcharts.numberFormat(this.value as number / 1e6, 0)}Mi` } } },
    tooltip: { ...hcTheme.tooltip, formatter: function () { return `<b>${this.x}</b><br/>Faturamento: R$ ${Highcharts.numberFormat(this.y as number, 0, ',', '.')}` } },
    plotOptions: { column: { ...hcTheme.plotOptions?.column, borderRadius: 6 }, series: { animation: { duration: 900 } } },
    colors: ['#16a34a', '#22c55e', '#34d464', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#f59e0b'],
    series: [{ type: 'column', name: 'Faturamento', data: faturamentoPorCultura.map(([, v]) => v.fat), showInLegend: false }],
  }), [faturamentoPorCultura, hcTheme])

  const areaEstadoChartOpts = useMemo<Highcharts.Options>(() => ({
    ...hcTheme, chart: { ...hcTheme.chart, type: 'bar', height: 280 }, title: { text: undefined },
    xAxis: { ...hcTheme.xAxis, categories: areaPorEstado.map(([e]) => e) },
    yAxis: { ...(hcTheme.yAxis as Highcharts.YAxisOptions), labels: { ...(hcTheme.yAxis as Highcharts.YAxisOptions)?.labels, formatter: function () { return `${Highcharts.numberFormat(this.value as number / 1000, 0)}k ha` } } },
    tooltip: { ...hcTheme.tooltip, formatter: function () { return `<b>${this.x}</b><br/>${Highcharts.numberFormat(this.y as number, 0, ',', '.')} ha` } },
    plotOptions: { bar: { ...hcTheme.plotOptions?.bar, borderRadius: 6 }, series: { animation: { duration: 900 } } },
    colors: ['#059669', '#10b981', '#34d464', '#4ade80', '#86efac', '#a3e635', '#facc15', '#f97316'],
    series: [{ type: 'bar', name: 'Área (ha)', data: areaPorEstado.map(([, v]) => v), showInLegend: false }],
  }), [areaPorEstado, hcTheme])

  if (totalClientes === 0) {
    return (
      <div className="dash-hero dash-hero--empty">
        <div className="dash-hero-bg" />
        <div className="dash-hero-content" style={{ textAlign: 'center', maxWidth: 520 }}>
          <div className="home-hero-badge" style={{ margin: '0 auto var(--space-4)' }}>Dashboard</div>
          <h1 className="home-hero-title" style={{ textAlign: 'center' }}>Nenhum dado ainda</h1>
          <p className="home-hero-subtitle" style={{ textAlign: 'center' }}>Importe sua carteira de clientes via CSV para visualizar todos os indicadores e gráficos.</p>
        </div>
        <div className="home-hero-decoration"><div className="home-hero-circle home-hero-circle--1" /><div className="home-hero-circle home-hero-circle--2" /></div>
      </div>
    )
  }

  return (
    <>
      <div className="dash-hero">
        <div className="dash-hero-bg" />
        <div className="dash-hero-content">
          <div className="home-hero-badge">Visão Geral da Carteira</div>
          <h1 className="home-hero-title" style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)' }}>
            <span className="home-hero-title-accent">{fmt.number(totalClientes)} clientes</span> na base
          </h1>
          <p className="home-hero-subtitle" style={{ fontSize: 'var(--text-sm)', lineHeight: 1.7 }}>
            Carteira com faturamento total de <strong style={{ color: '#86efac' }}>{fmt.short(totalFaturamento)}</strong> e potencial de compra estimado em <strong style={{ color: '#fbbf24' }}>{fmt.short(totalPotencial)}</strong>.
            Área total de <strong style={{ color: '#86efac' }}>{fmt.number(Math.round(totalArea))} ha</strong>, ticket médio de <strong style={{ color: '#fbbf24' }}>{fmt.short(ticketMedio)}</strong> e taxa de ativação de <strong style={{ color: '#86efac' }}>{taxaAtivacao.toFixed(1)}%</strong>.
          </p>
          <DownloadReportButton data={downloadData} filename="dashboard.csv" />
        </div>
        <div className="home-hero-decoration"><div className="home-hero-circle home-hero-circle--1" /><div className="home-hero-circle home-hero-circle--2" /><div className="home-hero-circle home-hero-circle--3" /></div>
      </div>

      <div className="kpi-grid dash-kpi-compact" style={{ marginBottom: 'var(--space-6)' }}>
        <KpiCard label="Total de Clientes" value={totalClientes} format={v => fmt.number(Math.round(v))} trend="positive" trendLabel={`${clientesAtivos} ativos`} accentColor="#22c55e" />
        <KpiCard label="Faturamento Total" value={totalFaturamento} format={fmt.short} accentColor="#3b82f6" />
        <KpiCard label="Potencial de Compra" value={totalPotencial} format={fmt.short} trend="positive" trendLabel={`Gap: ${fmt.short(totalPotencial)}`} accentColor="#a855f7" />
        <KpiCard label="Área Total" value={totalArea} format={v => `${fmt.number(Math.round(v))} ha`} accentColor="#10b981" />
        <KpiCard label="Ticket Médio" value={ticketMedio} format={fmt.short} trend="positive" trendLabel="por cliente" accentColor="#f59e0b" />
        <KpiCard label="Prospects" value={clientesProspect} format={v => fmt.number(Math.round(v))} trend={clientesInativos > 0 ? 'negative' : 'neutral'} trendLabel={`${clientesInativos} inativos`} accentColor="#ec4899" />
      </div>

      <div className="dash-chips-row">
        <StatChip label={`Classe A (80%)`} value={`${abcData.classA} clientes`} color="#22c55e" />
        <StatChip label={`Classe B (15%)`} value={`${abcData.classB} clientes`} color="#3b82f6" />
        <StatChip label={`Classe C (5%)`} value={`${abcData.classC} clientes`} color="#a855f7" />
        <StatChip label="Taxa de Ativação" value={`${taxaAtivacao.toFixed(1)}%`} color="#f59e0b" />
        <StatChip label="Maior Cliente" value={fmt.short(topClientes[0]?.faturamento_anual || 0)} color="#ec4899" />
        <StatChip label="Culturas Ativas" value={`${faturamentoPorCultura.length} tipos`} color="#10b981" />
      </div>

      <div className="card" style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <div className="card-body" style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>Filtrar gráficos por classe:</span>
          {(['Todos', 'A', 'B', 'C'] as ClasseABC[]).map(cls => (
            <button key={cls} className={`btn btn--sm ${abcChartFilter === cls ? 'btn--primary' : 'btn--secondary'}`} onClick={() => setAbcChartFilter(cls)}>
              {cls === 'Todos' ? 'Todos' : `Classe ${cls}`} {cls !== 'Todos' && `(${cls === 'A' ? abcData.classA : cls === 'B' ? abcData.classB : abcData.classC})`}
            </button>
          ))}
        </div>
      </div>

      <div className="chart-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><SectionHeader title="Faturamento por Estado" sub={abcChartFilter !== 'Todos' ? `Classe ${abcChartFilter} — Top 10` : 'Top 10 estados'} link="/analise-abc" linkLabel="Análise ABC →" /></div>
          <div className="card-body"><LazyChart options={estadoChartOpts} /></div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><SectionHeader title="Distribuição de Status" /></div>
          <div className="card-body">
            <LazyChart options={statusChartOpts} />
            <div className="dash-status-legend">
              <div className="dash-status-item"><span style={{ background: '#22c55e' }} /><span>Ativos</span><strong>{filteredAtivos}</strong></div>
              <div className="dash-status-item"><span style={{ background: '#3b82f6' }} /><span>Prospects</span><strong>{filteredProspect}</strong></div>
              <div className="dash-status-item"><span style={{ background: '#ef4444' }} /><span>Inativos</span><strong>{filteredInativos}</strong></div>
            </div>
          </div>
        </div>
      </div>

      <div className="chart-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><SectionHeader title="Faturamento por Cultura" sub={abcChartFilter !== 'Todos' ? `Classe ${abcChartFilter} — Top 8` : 'Top 8 culturas'} link="/penetracao" linkLabel="Ver penetração →" /></div>
          <div className="card-body"><LazyChart options={culturaChartOpts} /></div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><SectionHeader title="Área por Estado" sub={abcChartFilter !== 'Todos' ? `Classe ${abcChartFilter}` : 'Hectares cadastrados'} /></div>
          <div className="card-body"><LazyChart options={areaEstadoChartOpts} /></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header"><SectionHeader title="Resumo por Cultura" sub="Faturamento, área e clientes por cultura principal" /></div>
        <div className="card-body desktop-only" style={{ padding: 0, width: '100%' }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0, width: '100%' }}>
            <table className="data-table" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th onClick={() => handleCulturaSort('cultura')} style={{ cursor: 'pointer', userSelect: 'none' }}>Cultura {culturaSort.f === 'cultura' ? (culturaSort.d === 'asc' ? '↑' : '↓') : '↕'}</th>
                  <th onClick={() => handleCulturaSort('count')} style={{ cursor: 'pointer', userSelect: 'none' }}>Clientes {culturaSort.f === 'count' ? (culturaSort.d === 'asc' ? '↑' : '↓') : '↕'}</th>
                  <th onClick={() => handleCulturaSort('area')} style={{ cursor: 'pointer', userSelect: 'none' }}>Área Total (ha) {culturaSort.f === 'area' ? (culturaSort.d === 'asc' ? '↑' : '↓') : '↕'}</th>
                  <th onClick={() => handleCulturaSort('fat')} style={{ cursor: 'pointer', userSelect: 'none' }}>Faturamento {culturaSort.f === 'fat' ? (culturaSort.d === 'asc' ? '↑' : '↓') : '↕'}</th>
                  <th>% do Total</th>
                </tr>
              </thead>
              <tbody>
                {sortedCultura.map(cr => (
                  <tr key={cr.cultura}>
                    <td><strong>{cr.cultura}</strong></td>
                    <td>{cr.count}</td>
                    <td>{fmt.number(Math.round(cr.area))}</td>
                    <td>{fmt.short(cr.fat)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ flex: 1, height: 8, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden', minWidth: 40 }}>
                          <div style={{ height: '100%', width: `${totalFaturamento > 0 ? (cr.fat / totalFaturamento) * 100 : 0}%`, background: 'var(--color-primary)', borderRadius: 4 }} />
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)', minWidth: 42, textAlign: 'right', fontWeight: 600 }}>{totalFaturamento > 0 ? ((cr.fat / totalFaturamento) * 100).toFixed(1) : '0'}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mobile-only" style={{ padding: 0 }}>
          {sortedCultura.map(cr => {
            const pct = totalFaturamento > 0 ? ((cr.fat / totalFaturamento) * 100).toFixed(1) : '0'
            return (
              <div key={cr.cultura} className="mobile-cultura-card">
                <div className="mobile-cultura-card-header"><span className="mobile-cultura-card-name">{cr.cultura}</span><span className="mobile-cultura-card-pct">{pct}%</span></div>
                <div className="mobile-cultura-card-stats">
                  <div className="mobile-cultura-card-stat"><span className="mobile-cultura-card-stat-value">{cr.count}</span><span className="mobile-cultura-card-stat-label">Clientes</span></div>
                  <div className="mobile-cultura-card-stat"><span className="mobile-cultura-card-stat-value">{fmt.short(cr.fat)}</span><span className="mobile-cultura-card-stat-label">Faturamento</span></div>
                  <div className="mobile-cultura-card-stat"><span className="mobile-cultura-card-stat-value">{fmt.number(Math.round(cr.area))} ha</span><span className="mobile-cultura-card-stat-label">Área</span></div>
                </div>
                <div className="mobile-cultura-card-bar"><div className="mobile-cultura-card-bar-fill" style={{ width: `${pct}%` }} /></div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-header"><SectionHeader title="Top 10 Clientes" sub="Por faturamento anual" link="/clientes" linkLabel="Ver todos →" /></div>
        <div className="card-body desktop-only" style={{ padding: 0 }}>
          <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
            <table className="data-table">
              <thead><tr><th>#</th><th>Cliente</th><th>Cidade/UF</th><th>Cultura</th><th>Faturamento</th><th>Potencial</th><th>Área</th><th>Status</th></tr></thead>
              <tbody>
                {topClientes.map((c, i) => (
                  <tr key={c.id}>
                    <td><span className={`dash-rank dash-rank--${i < 3 ? ['gold','silver','bronze'][i] : 'default'}`}>{i + 1}</span></td>
                    <td><strong>{c.nome}</strong></td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>{c.cidade}/{c.estado}</td>
                    <td><span className="badge badge--neutral">{c.cultura_principal}</span></td>
                    <td><strong>{fmt.short(c.faturamento_anual)}</strong></td>
                    <td style={{ color: 'var(--text-tertiary)' }}>{fmt.short(c.potencial_compra)}</td>
                    <td style={{ color: 'var(--text-tertiary)', fontSize: 'var(--text-xs)' }}>{fmt.number(c.area_hectares)} ha</td>
                    <td><span className={`badge badge--${c.status === 'ativo' ? 'success' : c.status === 'prospect' ? 'info' : 'error'}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="mobile-only" style={{ padding: 0 }}>
          {topClientes.map((c, i) => {
            const rc = i < 3 ? ['gold','silver','bronze'][i] : 'default'
            return (
              <div key={c.id} className="mobile-client-card">
                <div><span className={`mobile-client-card-rank mobile-client-card-rank--${rc}`}>{i + 1}</span><span className="mobile-client-card-name">{c.nome}</span></div>
                <div className="mobile-client-card-meta">{c.cidade}/{c.estado} · <span className="badge badge--neutral">{c.cultura_principal}</span></div>
                <div className="mobile-client-card-row">
                  <div className="mobile-client-card-stat"><span className="mobile-client-card-stat-value">{fmt.short(c.faturamento_anual)}</span><span className="mobile-client-card-stat-label">Faturamento</span></div>
                  <div className="mobile-client-card-stat"><span className="mobile-client-card-stat-value">{fmt.short(c.potencial_compra)}</span><span className="mobile-client-card-stat-label">Potencial</span></div>
                  <div className="mobile-client-card-stat"><span className="mobile-client-card-stat-value">{fmt.number(c.area_hectares)} ha</span><span className="mobile-client-card-stat-label">Área</span></div>
                </div>
                <div className="mobile-client-card-status"><span className={`badge badge--${c.status === 'ativo' ? 'success' : c.status === 'prospect' ? 'info' : 'error'}`}>{c.status}</span></div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
