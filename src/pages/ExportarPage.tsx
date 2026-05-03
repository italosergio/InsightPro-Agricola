import { AppLayout } from '@/components/layout/AppLayout'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'

export function ExportarPage() {
  usePageTitle('Exportar')
  const { exportCSV } = useData()

  return (
    <AppLayout title="Exportar" subtitle="Exportacao de dados em diferentes formatos">
      <div className="card">
        <div className="card-header">
          <h2>Formatos Disponiveis</h2>
          <p>Escolha o formato de exportacao</p>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <button className="btn btn--primary btn--lg" onClick={exportCSV}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              Exportar CSV
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
