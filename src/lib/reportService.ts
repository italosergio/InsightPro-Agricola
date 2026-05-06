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
    console.log('[reportService] Iniciando geração de relatório', data)
    showLoading?.('Gerando gráficos...')
    
    // Converte gráficos para imagens
    const chartImages: string[] = []
    for (let i = 0; i < data.charts.length; i++) {
      console.log(`[reportService] Convertendo gráfico ${i + 1}/${data.charts.length}`)
      const base64 = await chartToBase64(data.charts[i].options)
      chartImages.push(base64)
    }
    console.log('[reportService] Gráficos convertidos:', chartImages.length)

    showLoading?.('Gerando análise com IA...')
    
    // Gera análise de IA se não fornecida (opcional - não bloqueia o relatório)
    let aiAnalysis = data.aiAnalysis
    if (!aiAnalysis) {
      try {
        console.log('[reportService] Chamando IA via serverless function...')
        const aiResult = await generateAIReport({
          reportType: 'custom',
          resumoDados: {
            pageTitle: data.pageTitle,
            summary: data.summary,
          },
        })
        
        // Extrai texto da resposta IA
        const content = aiResult.data
        aiAnalysis = content.raw || content.resumo || content.resumo_executivo || ''
        console.log('[reportService] Análise IA recebida')
      } catch (error) {
        console.warn('[reportService] Erro ao gerar análise IA, continuando sem ela:', error)
        aiAnalysis = '' // Continua sem análise
      }
    }
    
    // Se não tem análise, gera uma básica com os dados
    if (!aiAnalysis) {
      const summaryText = Object.entries(data.summary)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')
      aiAnalysis = `Resumo dos dados:\n\n${summaryText}\n\nNota: Análise detalhada com IA temporariamente indisponível.`
    }

    showLoading?.('Montando relatório...')

    // Monta HTML do relatório
    const html = buildReportHTML(data, chartImages, aiAnalysis)
    console.log('[reportService] HTML montado, tamanho:', html.length)

    // Gera PDF
    const opt = {
      margin: [15, 15, 15, 15],
      filename: `${data.pageTitle.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 3,
        useCORS: true,
        letterRendering: true,
        logging: false,
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
      },
    }

    console.log('[reportService] Gerando PDF...')
    await html2pdf().set(opt as any).from(html).save()
    console.log('[reportService] PDF gerado com sucesso!')
    
    showLoading?.('Concluído!')
  } catch (error) {
    console.error('[reportService] Erro:', error)
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
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: 500; color: #374151;">${key}</td>
        <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: 700; color: #111827; text-align: right;">${value}</td>
      </tr>
    `)
    .join('')

  const chartsHTML = data.charts
    .map((chart, i) => `
      <div style="margin: 30px 0; page-break-inside: avoid;">
        <h3 style="color: #111827; font-size: 18px; font-weight: 700; margin-bottom: 16px; padding-bottom: 8px; border-bottom: 2px solid #16a34a;">${chart.title}</h3>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <img src="${chartImages[i]}" style="width: 100%; height: auto; display: block;" />
        </div>
      </div>
    `)
    .join('')

  // Formata análise IA em parágrafos
  const aiParagraphs = aiAnalysis
    .split('\n')
    .filter(p => p.trim())
    .map(p => `<p style="margin: 12px 0; line-height: 1.7; color: #374151;">${p}</p>`)
    .join('')

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          color: #111827;
          line-height: 1.6;
          padding: 40px;
          background: #ffffff;
        }
        .header {
          background: linear-gradient(135deg, #16a34a 0%, #15803d 100%);
          color: #ffffff;
          padding: 40px;
          border-radius: 12px;
          margin-bottom: 40px;
        }
        .header h1 {
          font-size: 32px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
        }
        .header .subtitle {
          font-size: 16px;
          opacity: 0.95;
          margin-bottom: 16px;
        }
        .header .meta {
          font-size: 13px;
          opacity: 0.85;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 16px;
          margin-top: 16px;
        }
        h2 {
          color: #111827;
          font-size: 24px;
          font-weight: 700;
          margin-top: 40px;
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 3px solid #16a34a;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          overflow: hidden;
        }
        table thead {
          background: #f9fafb;
        }
        table th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        .ai-section {
          background: #f0fdf4;
          padding: 30px;
          border-radius: 12px;
          margin: 30px 0;
          border-left: 6px solid #16a34a;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .ai-section h3 {
          color: #15803d;
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 16px;
        }
        .footer {
          margin-top: 60px;
          padding-top: 30px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        .footer p {
          margin: 6px 0;
        }
        .badge {
          display: inline-block;
          background: #dcfce7;
          color: #15803d;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 12px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="badge">📊 RELATÓRIO EXECUTIVO</div>
        <h1>${data.pageTitle}</h1>
        ${data.pageSubtitle ? `<div class="subtitle">${data.pageSubtitle}</div>` : ''}
        <div class="meta">
          <strong>Gerado em:</strong> ${data.generatedAt}<br>
          <strong>Plataforma:</strong> InsightPro Agrícola
        </div>
      </div>

      <h2>📋 Resumo Executivo</h2>
      <table>
        <tbody>
          ${summaryRows}
        </tbody>
      </table>

      <h2>📈 Análise Visual</h2>
      ${chartsHTML}

      <h2>🤖 Insights com Inteligência Artificial</h2>
      <div class="ai-section">
        ${aiParagraphs}
      </div>

      <div class="footer">
        <p><strong>InsightPro Agrícola</strong> — Plataforma de Análise e Gestão de Clientes</p>
        <p>© ${new Date().getFullYear()} Todos os direitos reservados</p>
        <p style="margin-top: 12px; font-size: 11px; color: #9ca3af;">
          Este relatório foi gerado automaticamente e contém informações confidenciais
        </p>
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
