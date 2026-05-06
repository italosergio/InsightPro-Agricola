import html2pdf from 'html2pdf.js'
import { generateAIReport } from './aiService'
import { chartToBase64 } from './chartToImage'
import type { Cliente } from '@/types'
import type Highcharts from 'highcharts'

/* ─────────────────────────────────────────
   Types
───────────────────────────────────────── */

export interface ChartData {
  title: string
  options: Highcharts.Options
}

export interface ReportData {
  pageTitle: string
  pageSubtitle?: string
  generatedAt: string
  summary: Record<string, string | number>
  charts: ChartData[]
  aiAnalysis?: string
  /** Clientes reais — passados para a IA calcular métricas a partir da fonte */
  clientes?: Cliente[]
  /** Produtos reais — passados para a IA calcular penetração */
  produtos?: Record<string, unknown>[]
}

/* ─────────────────────────────────────────
   Main entry point
───────────────────────────────────────── */

export async function generatePageReport(
  data: ReportData,
  showLoading?: (message: string) => void
): Promise<void> {
  try {
    showLoading?.('Gerando gráficos...')

    const chartImages: string[] = []
    for (let i = 0; i < data.charts.length; i++) {
      // Gráficos menores para caber nas margens do PDF (700x350 ao invés de 800x400)
      const base64 = await chartToBase64(data.charts[i].options, 700, 350)
      chartImages.push(base64)
    }

    showLoading?.('Gerando análise com IA...')

    let aiAnalysis = data.aiAnalysis
    if (!aiAnalysis) {
      try {
        const aiResult = await generateAIReport({
          reportType: 'custom',
          // Passa os arrays reais para que buildPrompt compute métricas reais.
          // Sem isso, buildPrompt recebe clientes=[] e gera análise zerada.
          clientes: (data.clientes ?? []) as any[],
          produtos: (data.produtos ?? []) as any[],
        })
        const content = aiResult.data
        aiAnalysis = [
          content.resumo_executivo,
          content.analise_abc ? `**Análise ABC**\n${content.analise_abc}` : '',
          content.penetracao_produtos ? `**Penetração de Produtos**\n${content.penetracao_produtos}` : '',
          content.analise_territorial ? `**Análise Territorial**\n${content.analise_territorial}` : '',
          content.oportunidades_crescimento?.length
            ? `**Oportunidades de Crescimento**\n${content.oportunidades_crescimento.map(o => `- ${o}`).join('\n')}`
            : '',
          content.recomendacoes_estrategicas?.length
            ? `**Recomendações Estratégicas**\n${content.recomendacoes_estrategicas.map(r => `- ${r}`).join('\n')}`
            : '',
          content.mensagem_final ?? '',
          content.raw ?? '',
          content.resumo ?? '',
        ].filter(Boolean).join('\n\n')
      } catch {
        aiAnalysis = ''
      }
    }

    if (!aiAnalysis) {
      aiAnalysis = Object.entries(data.summary)
        .map(([k, v]) => `${k}: ${v}`)
        .join('\n')
    }

    showLoading?.('Montando relatório...')

    const html = buildReportHTML(data, chartImages, aiAnalysis)

    const opt = {
      margin: [0, 0, 0, 0], // Sem margens - vamos controlar via CSS
      filename: `${data.pageTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.97 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
        allowTaint: false,
        scrollX: 0,
        scrollY: 0,
      },
      jsPDF: {
        unit: 'mm',
        format: 'a4',
        orientation: 'portrait',
        compress: true,
      },
      pagebreak: {
        mode: ['css', 'legacy'],
        before: '.pb-before',
        avoid: '.pb-avoid',
      },
    }

    const pdfWorker = html2pdf().set(opt as any).from(html)
    
    await pdfWorker.toPdf().get('pdf').then((pdf: any) => {
      const totalPages = pdf.internal.getNumberOfPages()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      for (let i = 2; i <= totalPages; i++) {
        pdf.setPage(i)
        
        // Cabeçalho
        pdf.setFillColor(22, 163, 74)
        pdf.rect(0, 0, 210, 10, 'F')
        pdf.setTextColor(255, 255, 255)
        pdf.setFontSize(7)
        pdf.setFont('helvetica', 'bold')
        pdf.text('InsightPro Agrícola', 10, 6)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`${data.pageTitle}`, 105, 6, { align: 'center' })
        pdf.text(data.generatedAt.split(',')[0], 200, 6, { align: 'right' })
        
        // Rodapé
        const footerY = pageHeight - 10
        pdf.setFillColor(249, 250, 251)
        pdf.rect(0, footerY, 210, 10, 'F')
        pdf.setDrawColor(229, 231, 235)
        pdf.setLineWidth(0.3)
        pdf.line(0, footerY, 210, footerY)
        pdf.setTextColor(107, 114, 128)
        pdf.setFontSize(7)
        pdf.text(`© ${new Date().getFullYear()} InsightPro Agrícola`, 10, footerY + 6)
        pdf.text(`Página ${i} de ${totalPages}`, 200, footerY + 6, { align: 'right' })
      }
    })
    
    await pdfWorker.save()
    
    showLoading?.('Concluído!')
  } catch (error) {
    console.error('[reportService]', error)
    throw error
  }
}

/* ─────────────────────────────────────────
   HTML Builder
   Rules:
   - Zero emojis — they render as boxes in pdf engines
   - Zero CSS variables — avoid dark-mode inheritance
   - Zero flexbox/grid on critical layouts — use tables
   - Every color is an explicit hex — no inheritance risk
   - border-radius never combined with overflow:hidden on tables
   - All backgrounds set explicitly (html2canvas inherits from document)
───────────────────────────────────────── */

function buildReportHTML(
  data: ReportData,
  chartImages: string[],
  aiAnalysis: string
): string {

  /* ── Summary KPI cards ── */
  const kpiEntries = Object.entries(data.summary)
  const colCount = kpiEntries.length <= 3 ? kpiEntries.length
    : kpiEntries.length <= 4 ? 4
    : kpiEntries.length <= 6 ? 3 : 4
  const kpiRows: string[][] = []
  for (let i = 0; i < kpiEntries.length; i += colCount) {
    kpiRows.push(kpiEntries.slice(i, i + colCount).map(([k]) => k))
  }

  const kpiTableRows = chunkArray(kpiEntries, colCount).map(row => {
    const cells = row.map(([label, value]) => `
      <td style="
        padding: 0 8px 0 0;
        vertical-align: top;
        width: ${Math.floor(100 / colCount)}%;
      ">
        <div style="
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          border-top: 4px solid #16a34a;
          border-radius: 8px;
          padding: 20px 18px 18px;
          text-align: center;
        ">
          <div style="
            font-size: 26px;
            font-weight: 800;
            color: #15803d;
            line-height: 1.1;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          ">${value}</div>
          <div style="
            font-size: 11px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.09em;
            line-height: 1.4;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          ">${label}</div>
        </div>
      </td>
    `).join('')
    /* fill empty cells */
    const empty = colCount - row.length
    const padding = Array(empty).fill(`<td style="width:${Math.floor(100/colCount)}%;padding:0 8px 0 0;"></td>`).join('')
    return `<tr>${cells}${padding}</tr>`
  }).join('')

  /* ── Detail table rows ── */
  const detailRows = kpiEntries.map(([label, value], i) => `
    <tr style="background: ${i % 2 === 0 ? '#ffffff' : '#f9fafb'};">
      <td style="
        padding: 10px 16px;
        font-size: 12px;
        font-weight: 500;
        color: #4b5563;
        border-bottom: 1px solid #f3f4f6;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        width: 58%;
      ">${label}</td>
      <td style="
        padding: 10px 16px;
        font-size: 12px;
        font-weight: 700;
        color: #111827;
        border-bottom: 1px solid #f3f4f6;
        text-align: right;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      ">${value}</td>
    </tr>
  `).join('')

  /* ── Charts ── */
  const chartsHTML = data.charts.map((chart, i) => `
    <div class="pb-avoid" style="
      margin-bottom: 28px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      overflow: hidden;
    ">
      <div style="
        padding: 16px 24px 14px;
        border-bottom: 2px solid #e5e7eb;
        background: #f9fafb;
      ">
        <div style="
          font-size: 15px;
          font-weight: 700;
          color: #111827;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        ">${chart.title}</div>
      </div>
      <div style="padding: 20px 24px; background: #ffffff;">
        <img src="${chartImages[i]}" style="
          width: 90%;
          max-width: 700px;
          height: auto;
          display: block;
          margin: 0 auto;
        " />
      </div>
    </div>
  `).join('')

  /* ── AI Analysis content ── */
  const aiHTML = parseAIContent(aiAnalysis)

  /* ── Full HTML ── */
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=794px, initial-scale=1">
  <style>
    /* ── Reset — prevents dark-mode inheritance from document ── */
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #111827 !important;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif !important;
      font-size: 14px !important;
      line-height: 1.5 !important;
      -webkit-text-size-adjust: 100% !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    * {
      box-sizing: border-box;
    }

    /* Page break helpers */
    .pb-before { page-break-before: always; }
    .pb-avoid  { page-break-inside: avoid; }

    @media print {
      html, body { -webkit-print-color-adjust: exact !important; }
    }
  </style>
</head>
<body>
<div id="report-root" style="
  background: #ffffff;
  color: #111827;
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  width: 794px;
  margin: 0 auto;
">

  <!-- ═══════════ COVER ═══════════ -->
  <div class="pb-avoid" style="
    background: #15803d;
    padding: 48px 52px 44px;
  ">
    <!-- Brand row -->
    <div style="
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: rgba(255,255,255,0.65);
      margin-bottom: 28px;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    ">InsightPro Agricola &nbsp;/&nbsp; Relatorio Executivo</div>

    <!-- Title -->
    <div style="
      font-size: 38px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1.1;
      letter-spacing: -0.8px;
      margin-bottom: 10px;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
    ">${data.pageTitle}</div>

    <!-- Subtitle -->
    ${data.pageSubtitle ? `
    <div style="
      font-size: 17px;
      color: rgba(255,255,255,0.8);
      margin-bottom: 36px;
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-weight: 400;
    ">${data.pageSubtitle}</div>` : '<div style="margin-bottom:36px;"></div>'}

    <!-- Meta bar using table for html2canvas compatibility -->
    <table style="
      width: 100%;
      border-top: 1px solid rgba(255,255,255,0.22);
      padding-top: 20px;
      border-collapse: collapse;
    ">
      <tr>
        <td style="padding: 16px 0 0; vertical-align: top; width: 33%;">
          <div style="
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.55);
            margin-bottom: 4px;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          ">Gerado em</div>
          <div style="
            font-size: 13px;
            color: #ffffff;
            font-weight: 600;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          ">${data.generatedAt}</div>
        </td>
        <td style="padding: 16px 0 0; vertical-align: top; width: 33%;">
          <div style="
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.55);
            margin-bottom: 4px;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          ">Plataforma</div>
          <div style="
            font-size: 13px;
            color: #ffffff;
            font-weight: 600;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          ">InsightPro Agricola</div>
        </td>
        <td style="padding: 16px 0 0; vertical-align: top; width: 33%;">
          <div style="
            font-size: 10px;
            font-weight: 600;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: rgba(255,255,255,0.55);
            margin-bottom: 4px;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          ">Tipo</div>
          <div style="
            font-size: 13px;
            color: #ffffff;
            font-weight: 600;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          ">Relatorio PDF Executivo</div>
        </td>
      </tr>
    </table>
  </div>

  <!-- ═══════════ BODY ═══════════ -->
  
  <!-- Primeira página sem padding -->
  <div style="padding: 48px 52px; background: #ffffff;">

    <!-- ── SECTION 1: KPI Cards ── -->
    ${sectionHeader('01', 'Indicadores Principais')}

    <table style="
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      margin-bottom: 36px;
    ">
      ${kpiTableRows}
    </table>
    
    </div> <!-- Fecha primeira página sem padding -->

    <!-- Conteúdo com padding para páginas 2+ (20mm top para não sobrepor cabeçalho de 10mm) -->
    <div class="pb-before" style="padding: 20mm 10mm 15mm 10mm; page-break-before: always;">
    
    <!-- ── SECTION 2: Detailed Summary ── -->
    ${sectionHeader('02', 'Resumo Detalhado')}

    <div class="pb-avoid" style="
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 40px;
      page-break-inside: avoid;
    ">
      <table style="width: 95%; margin: 0 auto; border-collapse: collapse;">
        <thead>
          <tr style="background: #f3f4f6;">
            <th style="
              padding: 10px 16px;
              font-size: 10px;
              font-weight: 700;
              color: #4b5563;
              text-transform: uppercase;
              letter-spacing: 0.09em;
              text-align: left;
              border-bottom: 2px solid #e5e7eb;
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            ">Indicador</th>
            <th style="
              padding: 10px 16px;
              font-size: 10px;
              font-weight: 700;
              color: #4b5563;
              text-transform: uppercase;
              letter-spacing: 0.09em;
              text-align: right;
              border-bottom: 2px solid #e5e7eb;
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            ">Valor</th>
          </tr>
        </thead>
        <tbody>${detailRows}</tbody>
      </table>
    </div>

    <!-- ── SECTION 3: Charts ── -->
    ${data.charts.length > 0 ? `
      ${sectionHeader('03', 'Analise Visual')}
      <div style="margin-bottom: 40px;">
        ${chartsHTML}
      </div>
    ` : ''}

    <!-- ── SECTION 4: AI Insights ── -->
    ${sectionHeader(data.charts.length > 0 ? '04' : '03', 'Insights de Inteligencia Artificial')}

    <div class="pb-avoid" style="
      background: #f0fdf4;
      border-left: 5px solid #16a34a;
      border-radius: 0 8px 8px 0;
      padding: 28px 28px 28px 26px;
      margin-bottom: 48px;
    ">
      <div style="
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #15803d;
        margin-bottom: 16px;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      ">Analise gerada automaticamente com base nos dados da carteira</div>
      ${aiHTML}
    </div>

  </div>

  <!-- ═══════════ FOOTER ═══════════ -->
  <div style="
    background: #f9fafb;
    border-top: 3px solid #e5e7eb;
    padding: 20px 52px;
  ">
    <table style="width: 100%; border-collapse: collapse;">
      <tr>
        <td style="vertical-align: middle; padding: 0;">
          <span style="
            font-size: 13px;
            font-weight: 700;
            color: #111827;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          ">InsightPro&nbsp;</span><span style="
            font-size: 13px;
            font-weight: 700;
            color: #16a34a;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          ">Agricola</span>
          <span style="
            font-size: 11px;
            color: #9ca3af;
            margin-left: 12px;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          ">Plataforma de Analise e Gestao de Clientes</span>
        </td>
        <td style="vertical-align: middle; text-align: right; padding: 0;">
          <div style="
            font-size: 11px;
            color: #9ca3af;
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
          ">Documento confidencial &bull; ${new Date().getFullYear()} Todos os direitos reservados</div>
        </td>
      </tr>
    </table>
    
    </div> <!-- Fecha div de padding -->
  </div>

</div>
</body>
</html>`
}

/* ─────────────────────────────────────────
   Helper: section title with numbered badge
───────────────────────────────────────── */

function sectionHeader(num: string, title: string): string {
  return `
    <div class="pb-avoid" style="
      display: table;
      width: 100%;
      margin-bottom: 24px;
      padding-bottom: 14px;
      border-bottom: 3px solid #16a34a;
    ">
      <div style="display: table-cell; vertical-align: middle; width: 36px;">
        <div style="
          width: 32px;
          height: 32px;
          background: #16a34a;
          border-radius: 50%;
          text-align: center;
          line-height: 32px;
          font-size: 12px;
          font-weight: 700;
          color: #ffffff;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        ">${num}</div>
      </div>
      <div style="
        display: table-cell;
        vertical-align: middle;
        padding-left: 14px;
        font-size: 20px;
        font-weight: 700;
        color: #111827;
        letter-spacing: -0.3px;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      ">${title}</div>
    </div>
  `
}

/* ─────────────────────────────────────────
   Helper: chunk array into rows
───────────────────────────────────────── */

function chunkArray<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
}

/* ─────────────────────────────────────────
   Helper: parse AI markdown-like content to safe HTML
   - **bold** → strong
   - Lines starting with - or • → bullet
   - Blank separator lines → paragraph break
───────────────────────────────────────── */

function parseAIContent(text: string): string {
  const lines = text.split('\n')
  const parts: string[] = []

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    // Heading: **text** alone on a line
    if (/^\*\*[^*]+\*\*$/.test(line)) {
      const content = line.replace(/\*\*/g, '')
      parts.push(`
        <div style="
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          margin: 18px 0 8px;
          font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
        ">${escapeHtml(content)}</div>
      `)
      continue
    }

    // Bullet
    if (/^[-•*]\s/.test(line)) {
      const content = line.replace(/^[-•*]\s/, '').replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      parts.push(`
        <table style="width:100%; margin: 5px 0; border-collapse: collapse;">
          <tr>
            <td style="
              width: 20px;
              vertical-align: top;
              padding: 0;
              font-size: 16px;
              line-height: 1.6;
              color: #16a34a;
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            ">&#x2022;</td>
            <td style="
              vertical-align: top;
              padding: 0 0 0 6px;
              font-size: 13px;
              line-height: 1.7;
              color: #374151;
              font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            ">${content}</td>
          </tr>
        </table>
      `)
      continue
    }

    // Regular paragraph — inline bold support
    const withBold = line.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    parts.push(`
      <p style="
        font-size: 13px;
        line-height: 1.75;
        color: #374151;
        margin: 8px 0;
        font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      ">${withBold}</p>
    `)
  }

  return parts.join('')
}

/* ─────────────────────────────────────────
   Helper: escape HTML special chars (for user data)
───────────────────────────────────────── */

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

/* ─────────────────────────────────────────
   Data preparers for specific pages
───────────────────────────────────────── */

export function prepareDashboardReport(
  clientes: Cliente[]
): Omit<ReportData, 'charts' | 'aiAnalysis'> {
  const ativos    = clientes.filter(c => c.status === 'ativo').length
  const prospects = clientes.filter(c => c.status === 'prospect').length
  const inativos  = clientes.filter(c => c.status === 'inativo').length
  const faturamento = clientes.reduce((s, c) => s + c.faturamento_anual, 0)
  const ticketMedio = clientes.length > 0 ? faturamento / clientes.length : 0

  return {
    pageTitle: 'Dashboard',
    pageSubtitle: 'Visao geral da carteira de clientes',
    generatedAt: new Date().toLocaleString('pt-BR'),
    summary: {
      'Total de Clientes':    clientes.length,
      'Clientes Ativos':      ativos,
      'Prospects':            prospects,
      'Inativos':             inativos,
      'Faturamento Total':    `R$ ${(faturamento / 1_000_000).toFixed(2)}M`,
      'Ticket Medio':         `R$ ${(ticketMedio / 1_000).toFixed(1)}K`,
    },
  }
}

export function prepareABCReport(
  clientes: Cliente[]
): Omit<ReportData, 'charts' | 'aiAnalysis'> {
  const sorted = [...clientes].sort((a, b) => b.faturamento_anual - a.faturamento_anual)
  const total  = sorted.reduce((s, c) => s + c.faturamento_anual, 0)

  let acum = 0
  let cA = 0, cB = 0, cC = 0
  let fA = 0, fB = 0, fC = 0

  sorted.forEach(c => {
    acum += c.faturamento_anual
    const pct = (acum / total) * 100
    if (pct <= 80)      { cA++; fA += c.faturamento_anual }
    else if (pct <= 95) { cB++; fB += c.faturamento_anual }
    else                { cC++; fC += c.faturamento_anual }
  })

  const n = clientes.length || 1

  return {
    pageTitle: 'Analise ABC',
    pageSubtitle: 'Classificacao de clientes por faturamento',
    generatedAt: new Date().toLocaleString('pt-BR'),
    summary: {
      'Classe A — Clientes':      `${cA} (${((cA / n) * 100).toFixed(1)}%)`,
      'Classe A — Faturamento':   `R$ ${(fA / 1_000_000).toFixed(2)}M (${((fA / total) * 100).toFixed(1)}%)`,
      'Classe B — Clientes':      `${cB} (${((cB / n) * 100).toFixed(1)}%)`,
      'Classe B — Faturamento':   `R$ ${(fB / 1_000_000).toFixed(2)}M (${((fB / total) * 100).toFixed(1)}%)`,
      'Classe C — Clientes':      `${cC} (${((cC / n) * 100).toFixed(1)}%)`,
      'Classe C — Faturamento':   `R$ ${(fC / 1_000_000).toFixed(2)}M (${((fC / total) * 100).toFixed(1)}%)`,
    },
  }
}
