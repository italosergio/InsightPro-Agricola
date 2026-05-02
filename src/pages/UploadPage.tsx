import { useState, useRef, type ChangeEvent } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'

export function UploadPage() {
  const { importCSV, rawData } = useData()
  usePageTitle('Upload de Dados')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [importCount, setImportCount] = useState(0)
  const [error, setError] = useState('')

  const handleFile = (file: File) => {
    setError('')
    if (!file.name.endsWith('.csv')) {
      setError('Apenas arquivos CSV são suportados')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result
      if (typeof text === 'string') {
        const previousCount = rawData.length
        importCSV(text)
        setImportCount(rawData.length - previousCount)
        setError('')
      }
    }
    reader.readAsText(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <AppLayout title="Upload de Dados" subtitle="Importe sua base de clientes via CSV">
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--blue" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <p className="page-hero-eyebrow">Upload</p>
            <h1 className="page-hero-title">Importar Dados</h1>
            <p className="page-hero-subtitle">Faça upload do seu arquivo CSV com os dados dos clientes</p>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{rawData.length}</span>
              <span className="page-hero-kpi-label">Registros</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">.csv</span>
              <span className="page-hero-kpi-label">Formato</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Importar CSV</h2>
          <p>Arraste ou selecione seu arquivo CSV com os dados dos clientes</p>
        </div>
        <div className="card-body">
          <div
            className={`upload-area ${dragActive ? 'dragover' : ''}`}
            onDragOver={e => { e.preventDefault(); setDragActive(true) }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            aria-label="Área de upload de arquivo CSV"
          >
            <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <h3>Arraste seu arquivo CSV aqui</h3>
            <p>ou clique para selecionar</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleChange}
              style={{ display: 'none' }}
            />
          </div>

          {error && <div className="form-error" style={{ marginTop: 'var(--space-4)' }}>{error}</div>}

          {importCount > 0 && (
            <div className="badge badge--success" style={{ marginTop: 'var(--space-4)' }}>
              {importCount} registros importados com sucesso
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Formato Esperado</h2>
          <p>Colunas suportadas no CSV</p>
        </div>
        <div className="card-body">
          <div className="upload-specs-grid">
            <div className="upload-spec-card">
              <div className="upload-spec-name">nome</div>
              <div className="upload-spec-desc">Nome do cliente</div>
              <div className="upload-spec-required">Obrigatório</div>
            </div>
            <div className="upload-spec-card">
              <div className="upload-spec-name">cpf_cnpj</div>
              <div className="upload-spec-desc">CPF ou CNPJ</div>
            </div>
            <div className="upload-spec-card">
              <div className="upload-spec-name">telefone</div>
              <div className="upload-spec-desc">Telefone de contato</div>
            </div>
            <div className="upload-spec-card">
              <div className="upload-spec-name">email</div>
              <div className="upload-spec-desc">E-mail</div>
            </div>
            <div className="upload-spec-card">
              <div className="upload-spec-name">cidade</div>
              <div className="upload-spec-desc">Cidade</div>
            </div>
            <div className="upload-spec-card">
              <div className="upload-spec-name">estado</div>
              <div className="upload-spec-desc">Estado (UF)</div>
            </div>
            <div className="upload-spec-card">
              <div className="upload-spec-name">cultura_principal</div>
              <div className="upload-spec-desc">Cultura principal</div>
            </div>
            <div className="upload-spec-card">
              <div className="upload-spec-name">area_hectares</div>
              <div className="upload-spec-desc">Área em hectares</div>
            </div>
            <div className="upload-spec-card">
              <div className="upload-spec-name">faturamento_anual</div>
              <div className="upload-spec-desc">Faturamento anual (R$)</div>
            </div>
            <div className="upload-spec-card">
              <div className="upload-spec-name">potencial_compra</div>
              <div className="upload-spec-desc">Potencial de compra (R$)</div>
            </div>
            <div className="upload-spec-card">
              <div className="upload-spec-name">ultima_compra</div>
              <div className="upload-spec-desc">Data da última compra</div>
            </div>
            <div className="upload-spec-card">
              <div className="upload-spec-name">status</div>
              <div className="upload-spec-desc">ativo, inativo ou prospect</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
