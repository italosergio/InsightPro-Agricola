export function DownloadReportButton({ data, filename, label = 'Baixar Relatório' }: { data: Record<string, unknown>[]; filename: string; label?: string }) {
  if (data.length === 0) return null

  const gerarPDF = async () => {
    const jsPDF = (await import('jspdf')).default
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageW = 190

    pdf.setFillColor(22, 163, 74)
    pdf.rect(0, 0, 210, 22, 'F')
    pdf.setFontSize(12)
    pdf.setTextColor(255, 255, 255)
    pdf.text('InsightPro Agrícola', 10, 14)
    pdf.setFontSize(8)
    pdf.setTextColor(180, 255, 200)
    pdf.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 10, 19)

    const keys = Object.keys(data[0])
    const colW = keys.map(() => Math.floor(pageW / keys.length))
    let y = 30

    pdf.setFillColor(240, 245, 240)
    pdf.rect(10, y - 4, pageW, 6, 'F')
    pdf.setFontSize(7)
    pdf.setTextColor(22, 163, 74)
    keys.forEach((k, i) => pdf.text(k, 10 + colW.slice(0, i).reduce((a: number, w: number) => a + w, 0), y))
    y += 5

    pdf.setFontSize(7)
    data.forEach((row, ri) => {
      if (y + 5 > 280) { pdf.addPage(); y = 20 }
      if (ri % 2 === 1) {
        pdf.setFillColor(248, 250, 248)
        pdf.rect(10, y - 3, pageW, 5, 'F')
      }
      pdf.setTextColor(50, 50, 50)
      keys.forEach((k, j) => {
        pdf.text(String(row[k] ?? '').substring(0, 35), 10 + colW.slice(0, j).reduce((a: number, w: number) => a + w, 0), y)
      })
      y += 5
    })

    pdf.save(filename.replace('.csv', '.pdf'))
  }

  return (
    <button
      onClick={gerarPDF}
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
        marginTop: 4,
      }}
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
      </svg>
      {label}
    </button>
  )
}
