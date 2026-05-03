import { useMemo } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'
import { Bar } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export function PenetracaoPage() {
  const { filteredData, rawData } = useData()
  usePageTitle('Penetracao')

  const data = filteredData.length > 0 ? filteredData : rawData

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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const stateChartData = {
    labels: penetrationByState.map(([state]) => state),
    datasets: [{
      label: 'Faturamento',
      data: penetrationByState.map(([, d]) => d.faturamento),
      backgroundColor: 'rgba(34, 197, 94, 0.7)',
      borderColor: '#22c55e',
      borderWidth: 1,
    }],
  }

  const cultureChartData = {
    labels: penetrationByCulture.map(([culture]) => culture),
    datasets: [{
      label: 'Clientes',
      data: penetrationByCulture.map(([, count]) => count),
      backgroundColor: 'rgba(59, 130, 246, 0.7)',
      borderColor: '#3b82f6',
      borderWidth: 1,
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    plugins: {
      legend: { display: false },
    },
  }

  return (
    <AppLayout title="Penetracao" subtitle="Analise de penetracao por estado e cultura">
      <div className="chart-grid">
        <div className="card">
          <div className="card-header">
            <h2>Faturamento por Estado (Top 10)</h2>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Bar data={stateChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Clientes por Cultura</h2>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Bar data={cultureChartData} options={{ ...chartOptions, indexAxis: 'x' as const }} />
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Detalhamento por Estado</h2>
        </div>
        <div className="card-body">
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Estado</th>
                  <th>Clientes</th>
                  <th>Area Total (ha)</th>
                  <th>Faturamento Total</th>
                </tr>
              </thead>
              <tbody>
                {penetrationByState.map(([state, d]) => (
                  <tr key={state}>
                    <td>{state}</td>
                    <td>{d.clientes}</td>
                    <td>{d.area.toLocaleString('pt-BR')}</td>
                    <td>{formatCurrency(d.faturamento)}</td>
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
