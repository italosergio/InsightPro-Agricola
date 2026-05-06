/**
 * Serviço de IA — Gera relatórios com DeepSeek.
 *
 * Em **desenvolvimento**: chama a API DeepSeek diretamente do navegador
 *   (usa VITE_DEEPSEEK_API_KEY do .env, exposta pelo Vite).
 *
 * Em **produção** (Vercel): chama a serverless function /api/generate-report
 *   (a chave fica segura no servidor).
 */

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

export interface ReportData {
  reportType: string
  clientes?: any[]
  produtos?: any[]
  metas?: any[]
  pipeline?: Record<string, any[]>
  swot?: Record<string, { text: string }[]>
  gut?: any[]
  pest?: Record<string, { text: string }[]>
  campanhas?: any[]
  resumoDados?: any
}

export interface AIReportResponse {
  success: boolean
  data: AIGeneratedContent
  model?: string
}

export interface AIGeneratedContent {
  resumo_executivo?: string
  kpis_principais?: { destaque: string }
  analise_abc?: string
  penetracao_produtos?: string
  analise_territorial?: string
  oportunidades_crescimento?: string[]
  recomendacoes_estrategicas?: string[]
  mensagem_final?: string
  resumo?: string
  insights?: string[]
  recomendacoes?: string[]
  raw?: string
}

// ── Montagem do prompt ──────────────────────────────────────────────

function buildPrompt(data: ReportData): { systemPrompt: string; userPrompt: string } {
  const { clientes = [], produtos = [] } = data

  const totalClientes = clientes.length
  const ativos = clientes.filter((c: any) => c.status === 'ativo').length
  const prospects = clientes.filter((c: any) => c.status === 'prospect').length
  const inativos = clientes.filter((c: any) => c.status === 'inativo').length
  const faturamentoTotal = clientes.reduce((s: number, c: any) => s + (c.faturamento_anual || 0), 0)
  const areaTotal = clientes.reduce((s: number, c: any) => s + (c.area_hectares || 0), 0)
  const potencialTotal = clientes.reduce((s: number, c: any) => s + (c.potencial_compra || 0), 0)

  // Top culturas
  const cultMap: Record<string, number> = {}
  clientes.forEach((c: any) => { cultMap[c.cultura_principal] = (cultMap[c.cultura_principal] || 0) + 1 })
  const topCulturas = Object.entries(cultMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, qtd]) => `${nome} (${qtd} clientes, ${((qtd / totalClientes) * 100).toFixed(0)}%)`)

  // Top estados
  const estadoMap: Record<string, number> = {}
  clientes.forEach((c: any) => { estadoMap[c.estado] = (estadoMap[c.estado] || 0) + 1 })
  const topEstados = Object.entries(estadoMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, qtd]) => `${nome} (${qtd} clientes)`)

  // ABC
  const sorted = [...clientes].sort((a: any, b: any) => (b.faturamento_anual || 0) - (a.faturamento_anual || 0))
  const totalFat = sorted.reduce((s: number, c: any) => s + (c.faturamento_anual || 0), 0)
  let acum = 0
  const abcCount = { A: 0, B: 0, C: 0 }
  sorted.forEach((c: any) => {
    acum += c.faturamento_anual || 0
    const pctAcum = totalFat > 0 ? (acum / totalFat) * 100 : 0
    if (pctAcum <= 80) abcCount.A++
    else if (pctAcum <= 95) abcCount.B++
    else abcCount.C++
  })

  // Penetração
  const prodCount: Record<string, number> = {}
  clientes.forEach((c: any) => {
    if (c.produtos) Object.keys(c.produtos).forEach((p: string) => { prodCount[p] = (prodCount[p] || 0) + 1 })
  })
  const topProdutos = Object.entries(prodCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([nome, qtd]) => `${nome} (${qtd} clientes, ${((qtd / Math.max(1, ativos)) * 100).toFixed(0)}% dos ativos)`)

  const systemPrompt = `Você é um analista de negócios especializado em agronegócio.
Gere um relatório executivo profissional e persuasivo para apresentação ao cliente.
Use tom consultivo, dados concretos e recomendações acionáveis.
Responda APENAS com um objeto JSON válido, sem markdown, sem formatação extra.`

  const userPrompt = `Com base nos dados abaixo, gere um relatório executivo em JSON com esta estrutura exata:

{
  "resumo_executivo": "parágrafo de 3-4 frases com visão geral",
  "kpis_principais": {
    "destaque": "qual o KPI mais relevante e por quê"
  },
  "analise_abc": "parágrafo analisando a distribuição ABC e o que isso significa",
  "penetracao_produtos": "parágrafo sobre penetração de produtos na base, oportunidades de cross-sell",
  "analise_territorial": "parágrafo sobre distribuição geográfica",
  "oportunidades_crescimento": [
    "oportunidade 1",
    "oportunidade 2",
    "oportunidade 3",
    "oportunidade 4"
  ],
  "recomendacoes_estrategicas": [
    "recomendação 1",
    "recomendação 2",
    "recomendação 3",
    "recomendação 4"
  ],
  "mensagem_final": "frase de encerramento inspiradora e profissional"
}

DADOS DA CARTEIRA:
- Total de clientes: ${totalClientes}
- Ativos: ${ativos} | Prospects: ${prospects} | Inativos: ${inativos}
- Faturamento total: R$ ${(faturamentoTotal / 1e6).toFixed(2)} Mi
- Potencial não explorado: R$ ${(Math.max(0, potencialTotal - faturamentoTotal) / 1e6).toFixed(2)} Mi
- Área total: ${areaTotal.toLocaleString('pt-BR')} ha
- Top culturas: ${topCulturas.join('; ')}
- Top estados: ${topEstados.join('; ')}
- Classe A: ${abcCount.A} clientes | Classe B: ${abcCount.B} | Classe C: ${abcCount.C}
- Top produtos: ${topProdutos.join('; ')}
${produtos.length > 0 ? `- Produtos cadastrados: ${produtos.length}` : ''}`

  return { systemPrompt, userPrompt }
}

function parseContent(content: string): AIGeneratedContent {
  let cleaned = content.trim()
  if (cleaned.startsWith('```json')) cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '')
  else if (cleaned.startsWith('```')) cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '')
  try { return JSON.parse(cleaned) as AIGeneratedContent }
  catch { return { raw: content } }
}

// ── Chamada direta à DeepSeek (desenvolvimento) ────────────────────

async function callDeepSeekDirect(data: ReportData): Promise<AIReportResponse> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined
  if (!apiKey) {
    throw new Error('VITE_DEEPSEEK_API_KEY não configurada no .env')
  }

  const { systemPrompt, userPrompt } = buildPrompt(data)

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`DeepSeek API error ${response.status}: ${errorBody}`)
  }

  const result = await response.json()
  const content = result.choices?.[0]?.message?.content || ''
  return { success: true, data: parseContent(content) }
}

// ── Chamada via serverless function (produção) ─────────────────────

async function callServerlessFunction(data: ReportData): Promise<AIReportResponse> {
  const response = await fetch('/api/generate-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Erro ao gerar relatório: ${response.status} — ${errorBody}`)
  }

  return response.json()
}

// ── API pública ────────────────────────────────────────────────────

/**
 * Gera um relatório executivo com IA.
 *
 * - Em **desenvolvimento**: chama DeepSeek diretamente (usa VITE_DEEPSEEK_API_KEY do .env)
 * - Em **produção**: chama a serverless function /api/generate-report (Vercel)
 */
export async function generateAIReport(data: ReportData): Promise<AIReportResponse> {
  if (import.meta.env.DEV) {
    return callDeepSeekDirect(data)
  }
  return callServerlessFunction(data)
}

/**
 * Prepara os dados da carteira para enviar à IA.
 */
export function prepareReportData(reportType: string, appData: {
  clientes: any[]
  produtos: any[]
  metas?: any[]
  pipeline?: Record<string, any[]>
  swot?: Record<string, { text: string }[]>
  gut?: any[]
  pest?: Record<string, { text: string }[]>
  campanhas?: any[]
}): ReportData {
  return {
    reportType,
    clientes: appData.clientes,
    produtos: appData.produtos,
    metas: appData.metas,
    pipeline: appData.pipeline,
    swot: appData.swot,
    gut: appData.gut,
    pest: appData.pest,
    campanhas: appData.campanhas,
  }
}
