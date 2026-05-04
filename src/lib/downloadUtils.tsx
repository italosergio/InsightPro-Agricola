import Papa from 'papaparse'

export function downloadCSV(filename: string, data: Record<string, unknown>[]) {
  const csv = Papa.unparse(data)
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

export function DownloadReportButton({ data, filename, label = 'Baixar Relatório' }: { data: Record<string, unknown>[]; filename: string; label?: string }) {
  if (data.length === 0) return null
  return (
    <button
      onClick={() => downloadCSV(filename, data)}
      style={{
        whiteSpace: 'nowrap',
        background: 'none',
        border: 'none',
        color: 'rgba(255,255,255,0.9)',
        padding: 0,
        fontSize: 'var(--text-sm)',
        fontWeight: 600,
        cursor: 'pointer',
        textDecoration: 'underline',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {label}
    </button>
  )
}
