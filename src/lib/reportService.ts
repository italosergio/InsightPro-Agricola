import html2pdf from 'html2pdf.js'
import { generateAIReport } from './aiService'
import { chartToBase64 } from './chartToImage'
import type { Cliente } from '@/types'
import type Highcharts from 'highcharts'

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
}

/**
 * Gera relatório PDF com gráficos e análise de IA
 */
export async function generatePageReport(
  data: ReportData,
  showLoading?: (message: string) => void
): Promise<void> {
  try {
    showLoading?.('Gerando gráficos...')
    
    // Converte gráficos para imagens
    const chartImages: string[] = []
    for (const chart of data.charts) {
      const base64 = await chartToBase64(chart.options)
      chartImages.push(base64)
    }

    showLoading?.('Gerando análise com IA...')
    
    // Gera análise de IA se não fornecida
    let aiAnalysis = data.aiAnalysis
    if (!aiAnalysis) {
      const aiResult = await generateAIReport({
        reportType: 'custom',
        resumoDados: {
          pageTitle: data.pageTitle,
          summary: data.summary,
        },
      })
      
      // Extrai texto da resposta IA
      const content = aiResult.data
      aiAnalysis = content.raw || content.resumo || content.resumo_executivo || 'Análise não disponível'
    }

    showLoading?.('Montando relatório...')

    // Monta HTML do relatório
    const html = buildReportHTML(data, chartImages, aiAnalysis)

    // Gera PDF
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `${data.pageTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }

    await html2pdf().set(opt as any).from(html).save()
    
    showLoading?.('Concluído!')
  } catch (error) {
    console.error('Erro ao gerar relatório:', error)
    throw error
  }
}

/**
 * Monta HTML do relatório
 */
function buildReportHTML(
  data: ReportData,
  chartImages: string[],
  aiAnalysis: string
): string {
  const summaryRows = Object.entries(data.summary)
    .map(([key, value]) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e7e5e4;">${key}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e7e5e4; font-weight: 600;">${value}</td>
      </tr>
    `)
    .join('')

  const chartsHTML = data.charts
    .map((chart, i) => `
      <div style="margin: 20px 0; page-break-inside: avoid;">
        <h3 style="color: #1c1917; font-size: 16px; margin-bottom: 10px;">${chart.title}</h3>
        <img src="${chartImages[i]}" style="width: 100%; max-width: 700px; height: auto;" />
      </div>
    `)
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          color: #1c1917;
          line-height: 1.6;
          padding: 20px;
        }
        h1 {
          color: #16a34a;
          font-size: 24px;
          margin-bottom: 5px;
        }
        h2 {
          color: #1c1917;
          font-size: 18px;
          margin-top: 30px;
          margin-bottom: 15px;
          border-bottom: 2px solid #16a34a;
          padding-bottom: 5px;
        }
        .header {
          border-bottom: 3px solid #16a34a;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .meta {
          color: #78716c;
          font-size: 12px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        .ai-section {
          background: #f5f5f4;
          padding: 15px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #16a34a;
        }
        .ai-section p {
          margin: 8px 0;
          white-space: pre-wrap;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>${data.pageTitle}</h1>
        ${data.pageSubtitle ? `<p style="color: #78716c; margin: 5px 0;">${data.pageSubtitle}</p>` : ''}
        <p class="meta">Gerado em: ${data.generatedAt}</p>
        <p class="meta">InsightPro Agrícola</p>
      </div>

      <h2>📊 Resumo</h2>
      <table>
        ${summaryRows}
      </table>

      <h2>📈 Gráficos</h2>
      ${chartsHTML}

      <h2>🤖 Análise com Inteligência Artificial</h2>
      <div class="ai-section">
        ${aiAnalysis.split('\n').map(p => `<p>${p}</p>`).join('')}
      </div>

      <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e7e5e4; text-align: center; color: #78716c; font-size: 11px;">
        <p>Este relatório foi gerado automaticamente pela plataforma InsightPro Agrícola</p>
        <p>© ${new Date().getFullYear()} InsightPro Agrícola. Todos os direitos reservados.</p>
      </div>
    </body>
    </html>
  `
}

/**
 * Helpers para preparar dados de páginas específicas
 */

export function prepareDashboardReport(clientes: Cliente[]): Omit<ReportData, 'charts' | 'aiAnalysis'> {
  const ativos = clientes.filter(c => c.status === 'ativo').length
  const prospects = clientes.filter(c => c.status === 'prospect').length
  const inativos = clientes.filter(c => c.status === 'inativo').length
  const faturamentoTotal = clientes.reduce((sum, c) => sum + c.faturamento_anual, 0)

  return {
    pageTitle: 'Dashboard',
    pageSubtitle: 'Visão geral da carteira de clientes',
    generatedAt: new Date().toLocaleString('pt-BR'),
    summary: {
      'Total de Clientes': clientes.length,
      'Clientes Ativos': ativos,
      'Prospects': prospects,
      'Inativos': inativos,
      'Faturamento Total': `R$ ${(faturamentoTotal / 1_000_000).toFixed(2)}M`,
    },
  }
}

export function prepareABCReport(clientes: Cliente[]): Omit<ReportData, 'charts' | 'aiAnalysis'> {
  const sorted = [...clientes].sort((a, b) => b.faturamento_anual - a.faturamento_anual)
  const total = sorted.reduce((s, c) => s + c.faturamento_anual, 0)
  
  let acum = 0
  let classA = 0, classB = 0, classC = 0
  let fatA = 0, fatB = 0, fatC = 0

  sorted.forEach(c => {
    acum += c.faturamento_anual
    const pct = (acum / total) * 100
    if (pct <= 80) {
      classA++
      fatA += c.faturamento_anual
    } else if (pct <= 95) {
      classB++
      fatB += c.faturamento_anual
    } else {
      classC++
      fatC += c.faturamento_anual
    }
  })

  return {
    pageTitle: 'Análise ABC',
    pageSubtitle: 'Classificação de clientes por faturamento',
    generatedAt: new Date().toLocaleString('pt-BR'),
    summary: {
      'Classe A (Clientes)': `${classA} (${((classA / clientes.length) * 100).toFixed(1)}%)`,
      'Classe A (Faturamento)': `R$ ${(fatA / 1_000_000).toFixed(2)}M (${((fatA / total) * 100).toFixed(1)}%)`,
      'Classe B (Clientes)': `${classB} (${((classB / clientes.length) * 100).toFixed(1)}%)`,
      'Classe B (Faturamento)': `R$ ${(fatB / 1_000_000).toFixed(2)}M (${((fatB / total) * 100).toFixed(1)}%)`,
      'Classe C (Clientes)': `${classC} (${((classC / clientes.length) * 100).toFixed(1)}%)`,
      'Classe C (Faturamento)': `R$ ${(fatC / 1_000_000).toFixed(2)}M (${((fatC / total) * 100).toFixed(1)}%)`,
    },
  }
}
