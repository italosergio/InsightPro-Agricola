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
      setError('Apenas arquivos CSV sao suportados')
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
            aria-label="Area de upload de arquivo CSV"
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
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Coluna</th>
                  <th>Descricao</th>
                  <th>Obrigatorio</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>nome</td><td>Nome do cliente</td><td><span className="badge badge--error">Sim</span></td></tr>
                <tr><td>cpf_cnpj</td><td>CPF ou CNPJ</td><td><span className="badge badge--neutral">Nao</span></td></tr>
                <tr><td>telefone</td><td>Telefone de contato</td><td><span className="badge badge--neutral">Nao</span></td></tr>
                <tr><td>email</td><td>E-mail</td><td><span className="badge badge--neutral">Nao</span></td></tr>
                <tr><td>cidade</td><td>Cidade</td><td><span className="badge badge--neutral">Nao</span></td></tr>
                <tr><td>estado</td><td>Estado (UF)</td><td><span className="badge badge--neutral">Nao</span></td></tr>
                <tr><td>cultura_principal</td><td>Cultura principal</td><td><span className="badge badge--neutral">Nao</span></td></tr>
                <tr><td>area_hectares</td><td>Area em hectares</td><td><span className="badge badge--neutral">Nao</span></td></tr>
                <tr><td>faturamento_anual</td><td>Faturamento anual (R$)</td><td><span className="badge badge--neutral">Nao</span></td></tr>
                <tr><td>potencial_compra</td><td>Potencial de compra (R$)</td><td><span className="badge badge--neutral">Nao</span></td></tr>
                <tr><td>ultima_compra</td><td>Data da ultima compra</td><td><span className="badge badge--neutral">Nao</span></td></tr>
                <tr><td>status</td><td>ativo, inativo ou prospect</td><td><span className="badge badge--neutral">Nao</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
