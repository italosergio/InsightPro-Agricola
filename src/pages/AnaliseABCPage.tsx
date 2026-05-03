import { useMemo } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'
import { Bar, Pie } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement)

export function AnaliseABCPage() {
  const { filteredData, rawData } = useData()
  usePageTitle('Analise ABC')

  const data = filteredData.length > 0 ? filteredData : rawData

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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const barData = {
    labels: ['Classe A', 'Classe B', 'Classe C'],
    datasets: [
      {
        label: 'Faturamento',
        data: [classRevenue.A, classRevenue.B, classRevenue.C],
        backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(251, 191, 36, 0.8)', 'rgba(239, 68, 68, 0.8)'],
        borderColor: ['#22c55e', '#fbbf24', '#ef4444'],
        borderWidth: 1,
      },
    ],
  }

  const pieData = {
    labels: ['Classe A', 'Classe B', 'Classe C'],
    datasets: [{
      data: [classCounts.A, classCounts.B, classCounts.C],
      backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(251, 191, 36, 0.8)', 'rgba(239, 68, 68, 0.8)'],
    }],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true, position: 'bottom' as const },
    },
  }

  return (
    <AppLayout title="Analise ABC" subtitle="Classificacao de clientes por faturamento">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Classe A (80%)</div>
          <div className="kpi-value">{classCounts.A}</div>
          <div className="kpi-trend positive">{formatCurrency(classRevenue.A)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Classe B (15%)</div>
          <div className="kpi-value">{classCounts.B}</div>
          <div className="kpi-trend" style={{ color: 'var(--color-warning)', background: 'var(--color-warning-bg)' }}>{formatCurrency(classRevenue.B)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Classe C (5%)</div>
          <div className="kpi-value">{classCounts.C}</div>
          <div className="kpi-trend negative">{formatCurrency(classRevenue.C)}</div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="card">
          <div className="card-header">
            <h2>Faturamento por Classe</h2>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Bar data={barData} options={chartOptions} />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Distribuicao de Clientes</h2>
          </div>
          <div className="card-body">
            <div className="chart-container">
              <Pie data={pieData} options={chartOptions} />
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
                  <th>Cliente</th>
                  <th>Cidade</th>
                  <th>Faturamento</th>
                  <th>% Acumulada</th>
                  <th>Classe</th>
                </tr>
              </thead>
              <tbody>
                {abcData.map(c => (
                  <tr key={c.id}>
                    <td>{c.nome}</td>
                    <td>{c.cidade}/{c.estado}</td>
                    <td>{formatCurrency(c.faturamento_anual)}</td>
                    <td>{c.percentage.toFixed(1)}%</td>
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
