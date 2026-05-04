import { useMemo, useState } from 'react'
import { useData } from '@/store/DataContext'
import { useTheme } from '@/store/ThemeContext'
import { usePageTitle } from '@/hooks/useTheme'
import { DownloadReportButton } from '@/lib/downloadUtils'
import Highcharts, { color } from 'highcharts'
import { LazyChart } from '@/components/LazyChart'
import type { Cliente } from '@/types'

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

type ClasseABC = 'Todos' | 'A' | 'B' | 'C'

function getClasseABC(cliente: Cliente, clientes: Cliente[]): ClasseABC {
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

export function TerritorialPage() {
  const { filteredData, rawData } = useData()
  const { theme } = useTheme()
  usePageTitle('Territorial')
  const [classeFilter, setClasseFilter] = useState<ClasseABC>('Todos')

  const data = filteredData.length > 0 ? filteredData : rawData

  const filteredByClasse = useMemo(() => {
    if (classeFilter === 'Todos') return data
    return data.filter(c => getClasseABC(c, data) === classeFilter)
  }, [data, classeFilter])

  const regionData = useMemo(() => {
    const map: Record<string, { clientes: number; area: number; fat: number }> = {}
    Object.keys(regionMap).forEach(r => { map[r] = { clientes: 0, area: 0, fat: 0 } })
    filteredByClasse.forEach(c => {
      for (const [region, states] of Object.entries(regionMap)) {
        if (states.includes(c.estado.toUpperCase())) {
          map[region].clientes++
          map[region].area += c.area_hectares
          map[region].fat += c.faturamento_anual
          break
        }
      }
    })
    return Object.entries(map)
      .map(([regiao, info]) => ({
        regiao,
        clientes: info.clientes,
        area: info.area,
        fat: info.fat,
        pctClientes: filteredByClasse.length > 0 ? (info.clientes / filteredByClasse.length) * 100 : 0,
        pctArea: filteredByClasse.reduce((s, c) => s + c.area_hectares, 0) > 0
          ? (info.area / filteredByClasse.reduce((s, c) => s + c.area_hectares, 0)) * 100 : 0,
      }))
      .filter(r => r.clientes > 0)
      .sort((a, b) => b.clientes - a.clientes)
  }, [filteredByClasse])

  const hcTheme = useMemo(() => buildHCTheme(theme), [theme])
  const isDark = theme === 'dark'

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

  const fatChart = useMemo<Highcharts.Options>(() => ({
    ...hcTheme,
    chart: { ...hcTheme.chart, type: 'column', height: 300 },
    xAxis: { ...hcTheme.xAxis, categories: regionData.map(r => r.regiao) },
    yAxis: {
      ...hcTheme.yAxis,
      labels: { ...hcTheme.yAxis?.labels, formatter: function () { return `R$ ${Highcharts.numberFormat(this.value as number / 1e6, 1, ',', '.')}Mi` } },
    },
    plotOptions: { ...hcTheme.plotOptions, column: { ...hcTheme.plotOptions?.column, colorByPoint: true } },
    colors: ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ef4444'],
    series: [{ type: 'column', name: 'Faturamento', data: regionData.map(r => r.fat), showInLegend: false }],
  }), [regionData, hcTheme])

  const downloadData = useMemo(() => {
    return filteredByClasse.map(c => ({ nome: c.nome, cidade: c.cidade, estado: c.estado, cultura: c.cultura_principal, area: c.area_hectares, faturamento: c.faturamento_anual, potencial: c.potencial_compra, classe_abc: getClasseABC(c, data), status: c.status }))
  }, [filteredByClasse, data])

  const classesABC: { key: ClasseABC; label: string; color: string }[] = [
    { key: 'Todos', label: 'Todos', color: '#78716c' },
    { key: 'A', label: 'Classe A', color: '#16a34a' },
    { key: 'B', label: 'Classe B', color: '#2563eb' },
    { key: 'C', label: 'Classe C', color: '#d97706' },
  ]

  const countByClasse = useMemo(() => {
    const counts: Record<ClasseABC, number> = { 'Todos': data.length, 'A': 0, 'B': 0, 'C': 0 }
    data.forEach(c => { const cls = getClasseABC(c, data); counts[cls]++ })
    return counts
  }, [data])

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
            <DownloadReportButton data={downloadData} filename="analise_territorial.csv" label="Baixar dados desta página" />
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{regionData.length}</span>
              <span className="page-hero-kpi-label">Regiões</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{filteredByClasse.length}</span>
              <span className="page-hero-kpi-label">{classeFilter === 'Todos' ? 'Clientes' : `Classe ${classeFilter}`}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card-body" style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', fontWeight: 600 }}>Filtrar por Classe ABC:</span>
          {classesABC.map(cls => (
            <button
              key={cls.key}
              className={`btn btn--sm ${classeFilter === cls.key ? 'btn--primary' : 'btn--secondary'}`}
              onClick={() => setClasseFilter(cls.key)}
            >
              {cls.label} ({countByClasse[cls.key]})
            </button>
          ))}
        </div>
      </div>

      <div className="chart-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><h2 className="dash-section-title">Clientes por Região</h2></div>
          <div className="card-body"><LazyChart options={clientChart} height={300} /></div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><h2 className="dash-section-title">Área por Região (ha)</h2></div>
          <div className="card-body"><LazyChart options={areaChart} height={300} /></div>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-header"><h2 className="dash-section-title">Faturamento por Região</h2></div>
          <div className="card-body"><LazyChart options={fatChart} height={300} /></div>
        </div>
      </div>

      <div className="card">
        <div className="card-header"><h2 className="dash-section-title">Detalhamento — {classeFilter === 'Todos' ? 'Todas as Classes' : `Classe ${classeFilter}`}</h2></div>
        <div className="card-body" style={{ padding: 0 }}>
          {regionData.length === 0 ? (
            <div className="empty-state"><h3>Sem dados</h3><p>{classeFilter !== 'Todos' ? `Nenhum cliente classe ${classeFilter} encontrado.` : 'Importe clientes para ver a análise territorial.'}</p></div>
          ) : (
            <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Região</th>
                    <th>Clientes</th>
                    <th>Área Total</th>
                    <th>Faturamento</th>
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
                      <td>R$ {(r.fat / 1e6).toFixed(1).replace('.', ',')} Mi</td>
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
