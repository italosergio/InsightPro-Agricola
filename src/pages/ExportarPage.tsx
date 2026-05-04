import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'
import { DownloadReportButton } from '@/lib/downloadUtils'

export function ExportarPage() {
  usePageTitle('Exportar')
  const { exportCSV, exportPDF, rawData } = useData()

  const downloadData = rawData.map(c => ({
    nome: c.nome,
    cidade: c.cidade,
    estado: c.estado,
    cultura: c.cultura_principal,
    area_hectares: c.area_hectares,
    faturamento: c.faturamento_anual,
    potencial: c.potencial_compra,
    status: c.status,
  }))

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--teal" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <p className="page-hero-eyebrow">Exportar</p>
            <h1 className="page-hero-title">Exportar Dados</h1>
            <p className="page-hero-subtitle">Baixe seus dados nos formatos CSV e PDF para compartilhar</p>
            <DownloadReportButton data={downloadData} filename="exportar.csv" />
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">2</span>
              <span className="page-hero-kpi-label">Formatos</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Formatos Disponíveis</h2>
          <p>Escolha o formato de exportação</p>
        </div>
        <div className="card-body">
          <div className="export-format-grid">
            <div className="export-format-card">
              <div className="export-format-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <h3 className="export-format-name">CSV</h3>
              <p className="export-format-desc">Exporte todos os dados da sua carteira de clientes em formato CSV compatível com Excel</p>
              <button className="btn btn--primary" onClick={exportCSV}>
                Exportar CSV
              </button>
            </div>

            <div className="export-format-card">
              <div className="export-format-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              </div>
              <h3 className="export-format-name">PDF</h3>
              <p className="export-format-desc">Gere um relatório em PDF com os dados e gráficos da página atual para compartilhar</p>
              <button className="btn btn--secondary" onClick={() => exportPDF('root')}>
                Exportar PDF
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
