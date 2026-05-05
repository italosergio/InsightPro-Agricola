// Vercel Serverless Function — Gera relatório com IA via DeepSeek
// A chave da API fica no servidor (variável de ambiente), nunca exposta ao cliente

const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEFAULT_MODEL = 'deepseek-chat';

/**
 * Monta o prompt estruturado para a DeepSeek com base nos dados enviados.
 */
function buildPrompt(data) {
  const {
    reportType = 'completo',
    clientes = [],
    produtos = [],
    metas = [],
    pipeline = {},
    swot = {},
    gut = [],
    pest = {},
    campanhas = [],
  } = data;

  // Sumários estatísticos para enriquecer o prompt
  const totalClientes = clientes.length;
  const ativos = clientes.filter(c => c.status === 'ativo').length;
  const prospects = clientes.filter(c => c.status === 'prospect').length;
  const inativos = clientes.filter(c => c.status === 'inativo').length;
  const faturamentoTotal = clientes.reduce((s, c) => s + (c.faturamento_anual || 0), 0);
  const areaTotal = clientes.reduce((s, c) => s + (c.area_hectares || 0), 0);
  const potencialTotal = clientes.reduce((s, c) => s + (c.potencial_compra || 0), 0);

  // Top culturas
  const cultMap = {};
  clientes.forEach(c => {
    cultMap[c.cultura_principal] = (cultMap[c.cultura_principal] || 0) + 1;
  });
  const topCulturas = Object.entries(cultMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, qtd]) => `${nome} (${qtd} clientes, ${((qtd / totalClientes) * 100).toFixed(0)}%)`);

  // Top estados
  const estadoMap = {};
  clientes.forEach(c => {
    estadoMap[c.estado] = (estadoMap[c.estado] || 0) + 1;
  });
  const topEstados = Object.entries(estadoMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([nome, qtd]) => `${nome} (${qtd} clientes)`);

  // Análise ABC rápida
  const sorted = [...clientes].sort((a, b) => (b.faturamento_anual || 0) - (a.faturamento_anual || 0));
  const totalFat = sorted.reduce((s, c) => s + (c.faturamento_anual || 0), 0);
  let acum = 0;
  const abcCount = { A: 0, B: 0, C: 0 };
  sorted.forEach(c => {
    acum += c.faturamento_anual || 0;
    const pctAcum = totalFat > 0 ? (acum / totalFat) * 100 : 0;
    if (pctAcum <= 80) abcCount.A++;
    else if (pctAcum <= 95) abcCount.B++;
    else abcCount.C++;
  });

  // Penetração de produtos
  const prodCount = {};
  clientes.forEach(c => {
    if (c.produtos) {
      Object.keys(c.produtos).forEach(p => {
        prodCount[p] = (prodCount[p] || 0) + 1;
      });
    }
  });
  const topProdutos = Object.entries(prodCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([nome, qtd]) => `${nome} (${qtd} clientes, ${((qtd / Math.max(1, ativos)) * 100).toFixed(0)}% dos ativos)`);

  let prompt = '';
  let systemPrompt = '';

  if (reportType === 'completo' || reportType === 'ppt') {
    systemPrompt = `Você é um analista de negócios especializado em agronegócio. 
Gere um relatório executivo profissional e persuasivo para apresentação ao cliente.
Use tom consultivo, dados concretos e recomendações acionáveis.
Responda APENAS com um objeto JSON válido, sem markdown, sem formatação extra.`;

    prompt = `Com base nos dados abaixo, gere um relatório executivo em JSON com esta estrutura exata:

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

${produtos.length > 0 ? `- Produtos cadastrados: ${produtos.length}` : ''}
${metas.length > 0 ? `- Metas cadastradas: ${metas.length}` : ''}`;
  } else {
    // Relatório específico (um dos relatórios individuais)
    systemPrompt = `Você é um analista de negócios do agronegócio. 
Gere insights profissionais e objetivos sobre o relatório solicitado.
Responda APENAS com um objeto JSON válido.`;

    prompt = `Com base nos dados abaixo, gere insights em JSON com esta estrutura:
{
  "resumo": "resumo executivo de 2-3 frases",
  "insights": ["insight 1", "insight 2", "insight 3"],
  "recomendacoes": ["recomendação 1", "recomendação 2"]
}

Tipo de relatório: ${reportType}
Dados: ${JSON.stringify(data.resumoDados || data).substring(0, 2000)}`;
  }

  return { systemPrompt, prompt };
}

/**
 * Chama a API da DeepSeek e retorna o texto gerado.
 */
async function callDeepSeek(systemPrompt, userPrompt, apiKey) {
  const model = process.env.DEEPSEEK_MODEL || DEFAULT_MODEL;

  const response = await fetch(DEEPSEEK_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`DeepSeek API error ${response.status}: ${errorBody}`);
  }

  const result = await response.json();
  return result.choices?.[0]?.message?.content || '';
}

export default async function handler(req, res) {
  // Apenas POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // Configuração CORS para o front-end em produção
  const origin = req.headers.origin || '';
  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173',
    'https://insightpro-agricola.vercel.app',
    // Adicione outros domínios se necessário
  ];

  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Valida a API key
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: 'DeepSeek API key not configured. Set DEEPSEEK_API_KEY in Vercel environment variables.',
    });
  }

  try {
    const data = req.body;

    if (!data || !data.reportType) {
      return res.status(400).json({ error: 'Missing required field: reportType' });
    }

    const { systemPrompt, prompt } = buildPrompt(data);
    const content = await callDeepSeek(systemPrompt, prompt, apiKey);

    // Tenta fazer parse do JSON retornado
    let parsed;
    try {
      // A DeepSeek pode retornar o JSON dentro de ```json ... ``` ou puro
      let cleaned = content.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```\n?/, '').replace(/\n?```$/, '');
      }
      parsed = JSON.parse(cleaned);
    } catch {
      // Se não for JSON válido, retorna o texto bruto
      parsed = { raw: content };
    }

    return res.status(200).json({
      success: true,
      data: parsed,
      model,
    });
  } catch (error) {
    console.error('Error generating report:', error);
    return res.status(500).json({
      error: 'Failed to generate report',
      details: error.message,
    });
  }
}
