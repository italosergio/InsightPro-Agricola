import { useState } from 'react'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'
import { localDB, DB_KEYS } from '@/lib/localDB'
import Papa from 'papaparse'

interface Relatorio {
  id: string
  titulo: string
  tipo: string
  descricao: string
  icone: string
  geradoEm: string | null
}

interface ProdutoCadastro {
  id: string
  nome: string
  fornecedor: string
  custo: number
  categoria: string
  cultura: string
  modoAcao: string
  ingredienteAtivo: string
  finalidade: string
  tipoAplicacao: string
  doseRecomendada: string
  intervalo: string
  epocaAplicacao: string
  compatibilidade: string
  restricoes: string
  observacoes: string
}

const relatoriosList: Relatorio[] = [
  { id: 'r1', titulo: 'Carteira Completa de Clientes', tipo: 'analitico', descricao: 'Lista completa com todos os clientes, contatos, culturas e valores', icone: 'users', geradoEm: null },
  { id: 'r2', titulo: 'Análise ABC de Faturamento', tipo: 'analitico', descricao: 'Classificação ABC dos clientes com faturamento acumulado', icone: 'bar-chart', geradoEm: null },
  { id: 'r3', titulo: 'Penetração por Estado e Cultura', tipo: 'analitico', descricao: 'Distribuição geográfica da carteira por estado e cultura', icone: 'map', geradoEm: null },
  { id: 'r4', titulo: 'Produtos Cadastrados', tipo: 'analitico', descricao: 'Catálogo completo de produtos com doses, culturas e fornecedores', icone: 'box', geradoEm: null },
  { id: 'r5', titulo: 'Relatório de Prospects', tipo: 'comercial', descricao: 'Prospects ativos com potencial de compra e contatos', icone: 'target', geradoEm: null },
  { id: 'r6', titulo: 'Metas e Indicadores', tipo: 'gerencial', descricao: 'Acompanhamento de metas, KPIs e progresso estratégico', icone: 'trending-up', geradoEm: null },
  { id: 'r7', titulo: 'Pipeline de Vendas', tipo: 'comercial', descricao: 'Oportunidades por estágio do pipeline com valores e probabilidades', icone: 'git-branch', geradoEm: null },
  { id: 'r8', titulo: 'Matriz SWOT', tipo: 'estrategico', descricao: 'Forças, fraquezas, oportunidades e ameaças da operação', icone: 'grid', geradoEm: null },
  { id: 'r9', titulo: 'Matriz GUT - Priorização', tipo: 'estrategico', descricao: 'Problemas priorizados por gravidade, urgência e tendência', icone: 'star', geradoEm: null },
  { id: 'r10', titulo: 'Análise PEST', tipo: 'estrategico', descricao: 'Fatores políticos, econômicos, sociais e tecnológicos', icone: 'globe', geradoEm: null },
  { id: 'r11', titulo: 'Análise por Cultura', tipo: 'analitico', descricao: 'Distribuição de clientes, área e faturamento por cultura agrícola', icone: 'leaf', geradoEm: null },
  { id: 'r12', titulo: 'Oportunidades por Cliente', tipo: 'comercial', descricao: 'Matriz de oportunidades por penetração e tamanho do cliente', icone: 'zap', geradoEm: null },
  { id: 'r13', titulo: 'Análise Territorial', tipo: 'analitico', descricao: 'Distribuição territorial da carteira por estado e região', icone: 'map-pin', geradoEm: null },
  { id: 'r14', titulo: 'Gaps de Crescimento', tipo: 'comercial', descricao: 'Oportunidades de crescimento por cliente e produto', icone: 'trending-up', geradoEm: null },
  { id: 'r15', titulo: 'Fidelização e Volume', tipo: 'comercial', descricao: 'Análise de volume e fidelidade de produtos por cliente', icone: 'heart', geradoEm: null },
  { id: 'r16', titulo: 'Campanhas de Marketing', tipo: 'gerencial', descricao: 'Resumo das campanhas com orçamento e retorno estimado', icone: 'megaphone', geradoEm: null },
]

const tipoLabels: Record<string, string> = {
  analitico: 'Analítico',
  comercial: 'Comercial',
  gerencial: 'Gerencial',
  estrategico: 'Estratégico',
}

const tipoBadge: Record<string, string> = {
  analitico: 'badge--neutral',
  comercial: 'badge--success',
  gerencial: 'badge--info',
  estrategico: 'badge--warning',
}

const iconPaths: Record<string, React.JSX.Element> = {
  'users': <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  'bar-chart': <><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></>,
  'map': <><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" /><line x1="8" y1="2" x2="8" y2="18" /><line x1="16" y1="6" x2="16" y2="22" /></>,
  'box': <><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></>,
  'target': <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  'trending-up': <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
  'git-branch': <><line x1="6" y1="3" x2="6" y2="15" /><circle cx="6" cy="3" r="3" /><circle cx="6" cy="21" r="3" /><circle cx="18" cy="9" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></>,
  'grid': <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
  'star': <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>,
  'globe': <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
  'leaf': <><path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" /><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" /></>,
  'zap': <><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></>,
  'map-pin': <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
  'heart': <><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></>,
  'megaphone': <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></>,
  'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></>,
}

function ReportIcon({ name }: { name: string }) {
  const paths = iconPaths[name]
  if (!paths) return null
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
      {paths}
    </svg>
  )
}

function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
}

type Row = Record<string, string | number>

function pdfTable(pdf: any, headers: string[], rows: Row[], colW: number[], startY: number, opts?: { rowH?: number; fontSize?: number }): number {
  const fs = opts?.fontSize ?? 7
  const rh = opts?.rowH ?? 5
  let y = startY

  pdf.setFillColor(240, 245, 240)
  pdf.rect(14, y - 4, colW.reduce((a, w) => a + w, 0), 6, 'F')
  pdf.setFontSize(fs)
  pdf.setTextColor(22, 163, 74)
  headers.forEach((h, i) => pdf.text(h, 14 + colW.slice(0, i).reduce((a: number, w: number) => a + w, 0), y))
  y += 5

  pdf.setFontSize(fs)
  rows.forEach((row, ri) => {
    if (y + rh > 280) { pdf.addPage(); y = 20 }
    if (ri % 2 === 1) {
      pdf.setFillColor(248, 250, 248)
      pdf.rect(14, y - 3, colW.reduce((a, w) => a + w, 0), rh, 'F')
    }
    pdf.setTextColor(50, 50, 50)
    Object.values(row).forEach((v, j) => {
      pdf.text(String(v).substring(0, 40), 14 + colW.slice(0, j).reduce((a: number, w: number) => a + w, 0), y)
    })
    y += rh
  })

  return y + 4
}

export function RelatoriosPage() {
  usePageTitle('Relatórios')
  const { rawData } = useData()
  const [relatorioGerando, setRelatorioGerando] = useState<string | null>(null)
  const [tipoFilter, setTipoFilter] = useState('todos')

  const [relatoriosState, setRelatoriosState] = useState<Relatorio[]>(() => {
    const saved = localStorage.getItem('insightpro_relatorios')
    return saved ? JSON.parse(saved) : relatoriosList
  })

  const marcarGerado = (id: string) => {
    const updated = relatoriosState.map(r =>
      r.id === id ? { ...r, geradoEm: new Date().toISOString() } : r
    )
    setRelatoriosState(updated)
    localStorage.setItem('insightpro_relatorios', JSON.stringify(updated))
  }

  const gerarCSV = (id: string) => {
    setRelatorioGerando(id)
    const produtos = localDB.list<ProdutoCadastro>(DB_KEYS.produtos)
    let csv = ''
    let filename = id + '.csv'

    switch (id) {
      case 'r1':
        csv = Papa.unparse(rawData)
        filename = 'carteira_clientes.csv'
        break
      case 'r2': {
        const sorted = [...rawData].sort((a, b) => b.faturamento_anual - a.faturamento_anual)
        const total = sorted.reduce((s, c) => s + c.faturamento_anual, 0)
        let acum = 0
        csv = Papa.unparse(sorted.map((c, i) => {
          acum += c.faturamento_anual
          const pctInd = total > 0 ? (c.faturamento_anual / total) * 100 : 0
          const pctAcum = total > 0 ? (acum / total) * 100 : 0
          let classe = 'C'; if (pctAcum <= 80) classe = 'A'; else if (pctAcum <= 95) classe = 'B'
          return { rank: i + 1, nome: c.nome, faturamento: c.faturamento_anual, pct_individual: pctInd.toFixed(1) + '%', pct_acumulado: pctAcum.toFixed(1) + '%', classe_abc: classe, status: c.status, estado: c.estado, cultura: c.cultura_principal }
        }))
        filename = 'analise_abc.csv'
        break
      }
      case 'r3': {
        const mapa: Record<string, Record<string, number>> = {}
        rawData.forEach(c => {
          if (!mapa[c.estado]) mapa[c.estado] = {}
          if (!mapa[c.estado][c.cultura_principal]) mapa[c.estado][c.cultura_principal] = 0
          mapa[c.estado][c.cultura_principal] += c.area_hectares
        })
        const rows: { estado: string; cultura: string; area: number }[] = []
        Object.entries(mapa).forEach(([est, cults]) => Object.entries(cults).forEach(([c, a]) => rows.push({ estado: est, cultura: c, area: a })))
        csv = Papa.unparse(rows)
        filename = 'penetracao.csv'
        break
      }
      case 'r4':
        csv = Papa.unparse(produtos.map(p => ({ nome: p.nome, fornecedor: p.fornecedor, categoria: p.categoria, cultura: p.cultura, custo: p.custo, dose: p.doseRecomendada, intervalo: p.intervalo, modo_acao: p.modoAcao, ingrediente_ativo: p.ingredienteAtivo })))
        filename = 'produtos.csv'
        break
      case 'r5': {
        const p = rawData.filter(c => c.status === 'prospect')
        csv = Papa.unparse(p.map(c => ({ nome: c.nome, telefone: c.telefone, email: c.email, cidade: c.cidade, estado: c.estado, cultura: c.cultura_principal, potencial_compra: c.potencial_compra, area: c.area_hectares })))
        filename = 'prospects.csv'
        break
      }
      case 'r6': {
        const metas = localDB.get<{ nome: string; valorMeta: number; valorAtual: number; unidade: string; status: string; responsavel: string; prazo: string }[]>(DB_KEYS.metas) || []
        csv = Papa.unparse(metas.map(m => ({ nome: m.nome, valor_meta: m.valorMeta, valor_atual: m.valorAtual, unidade: m.unidade, progresso: ((m.valorAtual / m.valorMeta) * 100).toFixed(1) + '%', status: m.status, responsavel: m.responsavel, prazo: m.prazo })))
        filename = 'metas.csv'
        break
      }
      case 'r7': {
        const pipeline = localDB.get<Record<string, { valor: number; probabilidade: number; cliente: string; cultura: string; cidade: string; contato: string; observacao: string }[]>>(DB_KEYS.pipeline) || {}
        const rows: { estagio: string; cliente: string; cultura: string; valor: number; probabilidade: string; contato: string; observacao: string }[] = []
        Object.entries(pipeline).forEach(([est, items]) => items.forEach(item => rows.push({ estagio: est, cliente: item.cliente, cultura: item.cultura, valor: item.valor, probabilidade: item.probabilidade + '%', contato: item.contato, observacao: item.observacao })))
        csv = Papa.unparse(rows)
        filename = 'pipeline.csv'
        break
      }
      case 'r8': {
        const swot = localDB.get<Record<string, { text: string }[]>>(DB_KEYS.swot)
        if (swot) {
          const rows: { quadrante: string; item: string }[] = []
          Object.entries(swot).forEach(([q, items]) => items.forEach(item => rows.push({ quadrante: q, item: item.text })))
          csv = Papa.unparse(rows)
        }
        filename = 'swot.csv'
        break
      }
      case 'r9': {
        const gut = localDB.get<{ problema: string; gravidade: number; urgencia: number; tendencia: number; score: number }[]>(DB_KEYS.gut) || []
        csv = Papa.unparse(gut)
        filename = 'gut.csv'
        break
      }
      case 'r10': {
        const pest = localDB.get<Record<string, { text: string }[]>>(DB_KEYS.pest)
        if (pest) {
          const rows: { fator: string; item: string }[] = []
          Object.entries(pest).forEach(([f, items]) => items.forEach(item => rows.push({ fator: f, item: item.text })))
          csv = Papa.unparse(rows)
        }
        filename = 'pest.csv'
        break
      }
      case 'r11': {
        const mapa: Record<string, { clientes: number; area: number; fat: number }> = {}
        rawData.forEach(c => {
          if (!mapa[c.cultura_principal]) mapa[c.cultura_principal] = { clientes: 0, area: 0, fat: 0 }
          mapa[c.cultura_principal].clientes++
          mapa[c.cultura_principal].area += c.area_hectares
          mapa[c.cultura_principal].fat += c.faturamento_anual
        })
        csv = Papa.unparse(Object.entries(mapa).map(([c, v]) => ({ cultura: c, clientes: v.clientes, area_ha: v.area, faturamento: v.fat })))
        filename = 'analise_cultura.csv'
        break
      }
      case 'r12': {
        csv = Papa.unparse(rawData.map(c => ({
          nome: c.nome, cidade: c.cidade, estado: c.estado, cultura: c.cultura_principal,
          area: c.area_hectares, faturamento: c.faturamento_anual, potencial: c.potencial_compra,
          produtos_associados: Object.keys(c.produtos).length, status: c.status,
        })))
        filename = 'oportunidades.csv'
        break
      }
      case 'r13': {
        const mapa: Record<string, { clientes: number; area: number; fat: number }> = {}
        rawData.forEach(c => {
          if (!mapa[c.estado]) mapa[c.estado] = { clientes: 0, area: 0, fat: 0 }
          mapa[c.estado].clientes++
          mapa[c.estado].area += c.area_hectares
          mapa[c.estado].fat += c.faturamento_anual
        })
        csv = Papa.unparse(Object.entries(mapa).map(([e, v]) => ({ estado: e, clientes: v.clientes, area_ha: v.area, faturamento: v.fat })))
        filename = 'territorial.csv'
        break
      }
      case 'r14': {
        csv = Papa.unparse(rawData.map(c => {
          const gap = Math.max(0, c.potencial_compra - c.faturamento_anual)
          return { nome: c.nome, cidade: c.cidade, estado: c.estado, cultura: c.cultura_principal, faturamento_atual: c.faturamento_anual, potencial: c.potencial_compra, gap: gap, status: c.status }
        }))
        filename = 'gaps.csv'
        break
      }
      case 'r15': {
        csv = Papa.unparse(rawData.map(c => ({
          nome: c.nome, status: c.status, cultura: c.cultura_principal,
          produtos_qtd: Object.keys(c.produtos).length, faturamento: c.faturamento_anual,
          ultima_compra: c.ultima_compra, potencial: c.potencial_compra,
        })))
        filename = 'fidelizacao.csv'
        break
      }
      case 'r16': {
        const campanhas = localDB.get<{ nome: string; tipo: string; status: string; orcamento: number; retornoEstimado: number; inicio: string; fim: string; publico: string }[]>(DB_KEYS.campanhas) || []
        csv = Papa.unparse(campanhas.map(c => ({
          nome: c.nome, tipo: c.tipo, status: c.status, orcamento: c.orcamento,
          retorno_estimado: c.retornoEstimado, roi: c.orcamento > 0 ? ((c.retornoEstimado - c.orcamento) / c.orcamento * 100).toFixed(0) + '%' : '0%',
          inicio: c.inicio, fim: c.fim, publico: c.publico,
        })))
        filename = 'campanhas.csv'
        break
      }
    }

    downloadCSV(filename, csv)
    marcarGerado(id)
    setTimeout(() => setRelatorioGerando(null), 600)
  }

  const gerarPDF = async (id: string) => {
    setRelatorioGerando(id)
    const jsPDF = (await import('jspdf')).default
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pageW = 190
    let y = 20

    const addHeader = (title: string) => {
      if (y > 30) { pdf.addPage(); y = 20 }
      pdf.setFillColor(22, 163, 74)
      pdf.rect(0, 0, 210, 22, 'F')
      pdf.setFontSize(12)
      pdf.setTextColor(255, 255, 255)
      pdf.text(title, 10, 14)
      pdf.setFontSize(8)
      pdf.setTextColor(180, 255, 200)
      pdf.text(`InsightPro Agrícola  •  ${new Date().toLocaleDateString('pt-BR')}`, 10, 19)
      y = 28
    }

    const addSection = (title: string) => {
      if (y + 30 > 280) { pdf.addPage(); y = 24 }
      pdf.setFillColor(245, 248, 245)
      pdf.rect(10, y - 4, pageW, 7, 'F')
      pdf.setFontSize(10)
      pdf.setTextColor(22, 163, 74)
      pdf.text(title, 13, y)
      y += 8
    }

    const addSummary = (lines: string[]) => {
      pdf.setFontSize(9)
      pdf.setTextColor(60, 60, 60)
      lines.forEach(line => { pdf.text(line, 14, y); y += 5.5 })
      y += 2
    }

    const produtos = localDB.list<ProdutoCadastro>(DB_KEYS.produtos)
    const rel = relatoriosList.find(r => r.id === id)
    addHeader(rel?.titulo || 'Relatório')

    switch (id) {
      case 'r1': {
        addSummary([
          `Total de clientes: ${rawData.length}`,
          `Ativos: ${rawData.filter(c => c.status === 'ativo').length}  |  Prospects: ${rawData.filter(c => c.status === 'prospect').length}  |  Inativos: ${rawData.filter(c => c.status === 'inativo').length}`,
          `Faturamento total: R$ ${(rawData.reduce((s, c) => s + c.faturamento_anual, 0) / 1e6).toFixed(0)} Mi  |  Área total: ${rawData.reduce((s, c) => s + c.area_hectares, 0).toLocaleString('pt-BR')} ha`,
        ])
        y = pdfTable(pdf, ['Nome', 'CPF/CNPJ', 'Cidade/UF', 'Cultura', 'Área (ha)', 'Faturamento', 'Status'], rawData.map(c => ({ nome: c.nome.substring(0, 26), cpf: c.cpf_cnpj, cidade: `${c.cidade}/${c.estado}`, cultura: c.cultura_principal, area: c.area_hectares, fat: c.faturamento_anual, status: c.status })), [44, 32, 28, 22, 16, 24, 14], y)
        break
      }
      case 'r2': {
        const sorted = [...rawData].sort((a, b) => b.faturamento_anual - a.faturamento_anual)
        const total = sorted.reduce((s, c) => s + c.faturamento_anual, 0)
        let acum = 0
        addSummary([`Total clientes: ${sorted.length}  |  Faturamento total: R$ ${(total / 1e6).toFixed(0)} Mi`])
        y = pdfTable(pdf, ['#', 'Cliente', 'Faturamento', '% Ind.', '% Acum.', 'Classe', 'Estado', 'Cultura'], sorted.map((c, i) => {
          acum += c.faturamento_anual
          const pctAcum = total > 0 ? (acum / total) * 100 : 0
          let cls = 'C'; if (pctAcum <= 80) cls = 'A'; else if (pctAcum <= 95) cls = 'B'
          return { rank: i + 1, nome: c.nome.substring(0, 26), fat: c.faturamento_anual, pctInd: total > 0 ? ((c.faturamento_anual / total) * 100).toFixed(1) + '%' : '0%', pctAcum: pctAcum.toFixed(1) + '%', classe: cls, estado: c.estado, cultura: c.cultura_principal }
        }), [8, 44, 24, 20, 20, 14, 14, 22], y)
        break
      }
      case 'r3': {
        const mapa: Record<string, Record<string, number>> = {}
        rawData.forEach(c => { if (!mapa[c.estado]) mapa[c.estado] = {}; if (!mapa[c.estado][c.cultura_principal]) mapa[c.estado][c.cultura_principal] = 0; mapa[c.estado][c.cultura_principal] += c.area_hectares })
        const rows: Row[] = []
        Object.entries(mapa).forEach(([estado, cults]) => Object.entries(cults).forEach(([cultura, area]) => rows.push({ estado, cultura, area })))
        addSummary([`Estados com clientes: ${Object.keys(mapa).length}`, `Área total mapeada: ${rawData.reduce((s, c) => s + c.area_hectares, 0).toLocaleString('pt-BR')} ha`])
        y = pdfTable(pdf, ['Estado', 'Cultura', 'Área (ha)'], rows, [40, 60, 40], y)
        break
      }
      case 'r4':
        addSummary([`Total de produtos: ${produtos.length}`, `Fornecedores: ${[...new Set(produtos.map(p => p.fornecedor))].join(', ')}`])
        y = pdfTable(pdf, ['Produto', 'Fornecedor', 'Categoria', 'Cultura', 'Custo', 'Dose', 'Intervalo'], produtos.map(p => ({ nome: p.nome.substring(0, 22), forn: p.fornecedor.substring(0, 14), cat: p.categoria, cult: p.cultura, custo: `R$ ${p.custo}`, dose: p.doseRecomendada, interv: p.intervalo + ' dias' })), [36, 24, 24, 18, 16, 22, 18], y)
        break
      case 'r5': {
        const prospects = rawData.filter(c => c.status === 'prospect')
        addSummary([`Total de prospects: ${prospects.length}`, `Potencial total: R$ ${(prospects.reduce((s, c) => s + c.potencial_compra, 0) / 1e6).toFixed(0)} Mi`])
        y = pdfTable(pdf, ['Nome', 'Cidade/UF', 'Email', 'Cultura', 'Potencial', 'Área (ha)'], prospects.map(c => ({ nome: c.nome.substring(0, 22), cidade: `${c.cidade}/${c.estado}`, email: c.email.substring(0, 22), cultura: c.cultura_principal, pot: `R$${(c.potencial_compra / 1e3).toFixed(0)}k`, area: c.area_hectares })), [40, 28, 36, 22, 20, 18], y)
        break
      }
      case 'r6': {
        const metas = localDB.get<{ nome: string; valorMeta: number; valorAtual: number; unidade: string; status: string; responsavel: string; prazo: string }[]>(DB_KEYS.metas) || []
        const concluidas = metas.filter(m => m.valorAtual >= m.valorMeta).length
        addSummary([`Total de metas: ${metas.length}  |  Concluídas: ${concluidas}  |  Em andamento: ${metas.filter(m => m.status === 'em_andamento').length}  |  Atrasadas: ${metas.filter(m => m.status === 'atrasado').length}`])
        y = pdfTable(pdf, ['Meta', 'Valor Meta', 'Valor Atual', 'Un.', 'Progresso', 'Status', 'Responsável'], metas.map(m => ({ nome: m.nome.substring(0, 24), meta: m.valorMeta, atual: m.valorAtual, un: m.unidade, pct: ((m.valorAtual / m.valorMeta) * 100).toFixed(0) + '%', status: m.status, resp: m.responsavel })), [42, 20, 20, 12, 20, 18, 26], y)
        break
      }
      case 'r7': {
        const pipeline = localDB.get<Record<string, { valor: number; probabilidade: number; cliente: string; cultura: string; observacao: string }[]>>(DB_KEYS.pipeline) || {}
        const labels: Record<string, string> = { prospeccao: 'Prospecção', qualificacao: 'Qualificação', proposta: 'Proposta', negociacao: 'Negociação', fechado_ganho: 'Ganho', fechado_perdido: 'Perdido' }
        let totalVal = 0; let totalItems = 0
        Object.values(pipeline).forEach(items => { totalItems += items.length; items.forEach(i => totalVal += i.valor) })
        addSummary([`Total de oportunidades: ${totalItems}  |  Valor total em pipeline: R$ ${(totalVal / 1e6).toFixed(1)} Mi`])
        const rows: Row[] = []
        Object.entries(pipeline).forEach(([stage, items]) => items.forEach(item => rows.push({ estagio: labels[stage] || stage, cliente: item.cliente.substring(0, 21), cultura: item.cultura, valor: `R$${(item.valor / 1e3).toFixed(0)}k`, prob: item.probabilidade + '%', obs: item.observacao.substring(0, 26) })))
        y = pdfTable(pdf, ['Estágio', 'Cliente', 'Cultura', 'Valor', 'Prob.', 'Observação'], rows, [26, 38, 20, 18, 14, 46], y)
        break
      }
      case 'r8': {
        const swot = localDB.get<Record<string, { text: string }[]>>(DB_KEYS.swot)
        if (swot) {
          const labels: Record<string, string> = { strengths: 'Forças', weaknesses: 'Fraquezas', opportunities: 'Oportunidades', threats: 'Ameaças' }
          const quadColors: [number, number, number][] = [[22, 163, 74], [220, 38, 38], [37, 99, 235], [217, 119, 6]]
          const bulletColors = ['#16a34a', '#dc2626', '#2563eb', '#d97706']
          let ci = 0
          Object.entries(swot).forEach(([key, items]) => {
            if (y + 10 > 280) { pdf.addPage(); y = 20 }
            const c = quadColors[ci]
            pdf.setFillColor(c[0], c[1], c[2])
            pdf.rect(10, y - 4, pageW, 7, 'F')
            pdf.setFontSize(10)
            pdf.setTextColor(255, 255, 255)
            pdf.text(`${labels[key] || key} (${items.length})`, 13, y)
            y += 7
            pdf.setFontSize(9)
            pdf.setTextColor(60, 60, 60)
            items.forEach(item => {
              if (y > 278) { pdf.addPage(); y = 20 }
              pdf.setDrawColor(bulletColors[ci])
              pdf.circle(15, y - 1, 1.2, 'F')
              pdf.text(item.text, 18, y)
              y += 5.5
            })
            y += 3
            ci++
          })
        }
        break
      }
      case 'r9': {
        const gut = localDB.get<{ problema: string; gravidade: number; urgencia: number; tendencia: number; score: number }[]>(DB_KEYS.gut) || []
        addSummary([`Total de problemas: ${gut.length}`, `Maior score: ${Math.max(...gut.map(g => g.score), 0)}`])
        y = pdfTable(pdf, ['Problema', 'Gravidade', 'Urgência', 'Tendência', 'Score'], gut.map(g => ({ prob: g.problema.substring(0, 48), grav: g.gravidade, urg: g.urgencia, tend: g.tendencia, score: g.score })), [62, 22, 22, 22, 22], y)
        break
      }
      case 'r10': {
        const pest = localDB.get<Record<string, { text: string }[]>>(DB_KEYS.pest)
        if (pest) {
          const labels: Record<string, string> = { political: 'Político', economic: 'Econômico', social: 'Social', technological: 'Tecnológico' }
          Object.entries(pest).forEach(([key, items]) => {
            if (y + 8 > 280) { pdf.addPage(); y = 20 }
            addSection(`${labels[key] || key} (${items.length} fatores)`)
            pdf.setFontSize(9)
            pdf.setTextColor(60, 60, 60)
            items.forEach(item => {
              if (y > 278) { pdf.addPage(); y = 20 }
              pdf.setDrawColor(22, 163, 74)
              pdf.circle(15, y - 1, 1.2, 'F')
              pdf.text(item.text, 18, y)
              y += 5.5
            })
            y += 3
          })
        }
        break
      }
      case 'r11': {
        const mapa: Record<string, { clientes: number; area: number; fat: number }> = {}
        rawData.forEach(c => {
          if (!mapa[c.cultura_principal]) mapa[c.cultura_principal] = { clientes: 0, area: 0, fat: 0 }
          mapa[c.cultura_principal].clientes++; mapa[c.cultura_principal].area += c.area_hectares; mapa[c.cultura_principal].fat += c.faturamento_anual
        })
        addSummary([`Culturas distintas: ${Object.keys(mapa).length}`, `Principal cultura: ${Object.entries(mapa).sort((a, b) => b[1].clientes - a[1].clientes)[0]?.[0] || '-'}`])
        y = pdfTable(pdf, ['Cultura', 'Clientes', 'Área (ha)', 'Faturamento', 'Méd./Cliente'], Object.entries(mapa).sort((a, b) => b[1].clientes - a[1].clientes).map(([c, v]) => ({ cultura: c, clientes: v.clientes, area: v.area.toLocaleString('pt-BR'), fat: `R$ ${(v.fat / 1e6).toFixed(1)} Mi`, med: `R$ ${((v.fat / v.clientes) / 1e6).toFixed(1)} Mi` })), [36, 22, 30, 36, 36], y)
        break
      }
      case 'r12': {
        addSummary([`Total de clientes analisados: ${rawData.length}`, `Clientes com produtos associados: ${rawData.filter(c => Object.keys(c.produtos).length > 0).length}`])
        y = pdfTable(pdf, ['Cliente', 'Cidade/UF', 'Cultura', 'Área', 'Faturamento', 'Potencial', 'Prod.', 'Status'], rawData.map(c => ({ nome: c.nome.substring(0, 18), cidade: `${c.cidade}/${c.estado}`, cultura: c.cultura_principal, area: c.area_hectares, fat: c.faturamento_anual, pot: c.potencial_compra, prods: Object.keys(c.produtos).length, status: c.status })), [32, 24, 18, 14, 22, 22, 12, 14], y)
        break
      }
      case 'r13': {
        const mapa: Record<string, { clientes: number; area: number; fat: number }> = {}
        rawData.forEach(c => {
          if (!mapa[c.estado]) mapa[c.estado] = { clientes: 0, area: 0, fat: 0 }
          mapa[c.estado].clientes++; mapa[c.estado].area += c.area_hectares; mapa[c.estado].fat += c.faturamento_anual
        })
        addSummary([`Estados com cobertura: ${Object.keys(mapa).length}`, `Maior estado: ${Object.entries(mapa).sort((a, b) => b[1].clientes - a[1].clientes)[0]?.[0] || '-'} (${Object.entries(mapa).sort((a, b) => b[1].clientes - a[1].clientes)[0]?.[1].clientes || 0} clientes)`])
        y = pdfTable(pdf, ['Estado', 'Clientes', 'Área (ha)', 'Faturamento', 'Méd./Cliente'], Object.entries(mapa).sort((a, b) => b[1].clientes - a[1].clientes).map(([e, v]) => ({ estado: e, clientes: v.clientes, area: v.area.toLocaleString('pt-BR'), fat: `R$ ${(v.fat / 1e6).toFixed(1)} Mi`, med: `R$ ${((v.fat / v.clientes) / 1e6).toFixed(1)} Mi` })), [22, 22, 36, 40, 40], y)
        break
      }
      case 'r14': {
        const rows = rawData.sort((a, b) => (b.potencial_compra - b.faturamento_anual) - (a.potencial_compra - a.faturamento_anual))
        const totalGap = rows.reduce((s, c) => s + Math.max(0, c.potencial_compra - c.faturamento_anual), 0)
        addSummary([`Gap total de crescimento: R$ ${(totalGap / 1e6).toFixed(1)} Mi`, `Clientes com gap positivo: ${rows.filter(c => c.potencial_compra > c.faturamento_anual).length}`])
        y = pdfTable(pdf, ['Cliente', 'Cult.', 'Faturamento', 'Potencial', 'Gap', 'Status'], rows.map(c => ({ nome: c.nome.substring(0, 22), cult: c.cultura_principal, fat: c.faturamento_anual, pot: c.potencial_compra, gap: Math.max(0, c.potencial_compra - c.faturamento_anual), status: c.status })), [36, 18, 28, 28, 28, 16], y)
        break
      }
      case 'r15': {
        addSummary([`Clientes com produtos: ${rawData.filter(c => Object.keys(c.produtos).length > 0).length}`, `Média de produtos/cliente: ${(rawData.reduce((s, c) => s + Object.keys(c.produtos).length, 0) / Math.max(1, rawData.length)).toFixed(1)}`])
        y = pdfTable(pdf, ['Cliente', 'Cultura', 'Produtos', 'Faturamento', 'Últ. Compra', 'Status'], rawData.sort((a, b) => Object.keys(b.produtos).length - Object.keys(a.produtos).length).map(c => ({ nome: c.nome.substring(0, 22), cultura: c.cultura_principal, prods: Object.keys(c.produtos).length, fat: c.faturamento_anual, ult: c.ultima_compra || '-', status: c.status })), [38, 20, 16, 26, 26, 16], y)
        break
      }
      case 'r16': {
        const campanhas = localDB.get<{ nome: string; tipo: string; status: string; orcamento: number; retornoEstimado: number; inicio: string; fim: string; publico: string }[]>(DB_KEYS.campanhas) || []
        const totalOrc = campanhas.reduce((s, c) => s + c.orcamento, 0)
        const totalRet = campanhas.reduce((s, c) => s + c.retornoEstimado, 0)
        addSummary([`Total de campanhas: ${campanhas.length}`, `Orçamento total: R$ ${(totalOrc / 1e3).toFixed(0)}k  |  Retorno estimado: R$ ${(totalRet / 1e6).toFixed(0)} Mi  |  ROI global: ${totalOrc > 0 ? ((totalRet - totalOrc) / totalOrc * 100).toFixed(0) : 0}%`])
        y = pdfTable(pdf, ['Campanha', 'Tipo', 'Status', 'Orçamento', 'Retorno Est.', 'ROI', 'Início', 'Fim'], campanhas.map(c => ({ nome: c.nome.substring(0, 18), tipo: c.tipo, status: c.status, orc: `R$${(c.orcamento / 1e3).toFixed(0)}k`, ret: `R$${(c.retornoEstimado / 1e3).toFixed(0)}k`, roi: c.orcamento > 0 ? ((c.retornoEstimado - c.orcamento) / c.orcamento * 100).toFixed(0) + '%' : '0%', inicio: c.inicio, fim: c.fim })), [34, 18, 18, 22, 24, 16, 20, 20], y)
        break
      }
    }

    const safeName = (rel?.titulo || 'relatorio').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
    pdf.save(`${safeName}.pdf`)
    marcarGerado(id)
    setTimeout(() => setRelatorioGerando(null), 600)
  }

  const gerarPDFCompleto = async () => {
    setRelatorioGerando('_all_')
    const jsPDF = (await import('jspdf')).default
    const pdf = new jsPDF('p', 'mm', 'a4')
    let y = 20

    const addFullHeader = (title: string) => {
      if (y > 30) { pdf.addPage(); y = 20 }
      pdf.setFillColor(22, 163, 74)
      pdf.rect(0, 0, 210, 24, 'F')
      pdf.setFontSize(14)
      pdf.setTextColor(255, 255, 255)
      pdf.text('InsightPro Agrícola', 10, 14)
      pdf.setFontSize(10)
      pdf.setTextColor(180, 255, 200)
      pdf.text(`${title}  •  ${new Date().toLocaleDateString('pt-BR')}`, 10, 21)
      y = 30
    }

    const addFullSection = (title: string) => {
      if (y + 20 > 280) { pdf.addPage(); y = 20 }
      pdf.setFillColor(245, 248, 245)
      pdf.rect(10, y - 4, 190, 7, 'F')
      pdf.setFontSize(11)
      pdf.setTextColor(22, 163, 74)
      pdf.text(title, 13, y)
      y += 8
    }

    const fullSummary = (lines: string[]) => {
      pdf.setFontSize(9)
      pdf.setTextColor(60, 60, 60)
      lines.forEach(line => { pdf.text(line, 14, y); y += 5.5 })
      y += 2
    }

    const produtos = localDB.list<ProdutoCadastro>(DB_KEYS.produtos)
    addFullHeader('Relatório Completo da Carteira')

    fullSummary([
      `Total de Clientes: ${rawData.length}  |  Ativos: ${rawData.filter(c => c.status === 'ativo').length}  |  Prospects: ${rawData.filter(c => c.status === 'prospect').length}  |  Inativos: ${rawData.filter(c => c.status === 'inativo').length}`,
      `Faturamento Total: R$ ${(rawData.reduce((s, c) => s + c.faturamento_anual, 0) / 1e6).toFixed(0)} Mi  |  Área Total: ${rawData.reduce((s, c) => s + c.area_hectares, 0).toLocaleString('pt-BR')} ha  |  Produtos Cadastrados: ${produtos.length}`,
    ])
    y += 6

    addFullSection('1. Carteira de Clientes')
    y = pdfTable(pdf, ['Nome', 'Cidade/UF', 'Cultura', 'Área (ha)', 'Faturamento'], rawData.map(c => ({ nome: c.nome.substring(0, 28), cidade: `${c.cidade}/${c.estado}`, cultura: c.cultura_principal, area: c.area_hectares, fat: `R$${(c.faturamento_anual / 1e6).toFixed(1)}Mi` })), [44, 30, 20, 22, 28], y, { fontSize: 7, rowH: 4.5 })
    y += 4

    addFullSection('2. Produtos Cadastrados')
    y = pdfTable(pdf, ['Produto', 'Fornecedor', 'Categoria', 'Cultura', 'Custo', 'Dose'], produtos.map(p => ({ nome: p.nome.substring(0, 22), forn: p.fornecedor.substring(0, 14), cat: p.categoria, cult: p.cultura, custo: `R$ ${p.custo}`, dose: p.doseRecomendada })), [36, 24, 24, 18, 16, 22], y, { fontSize: 7, rowH: 4.5 })
    y += 4

    addFullSection('3. Metas e KPIs')
    const metas = localDB.get<{ nome: string; valorMeta: number; valorAtual: number; unidade: string; status: string }[]>(DB_KEYS.metas) || []
    if (metas.length) {
      y = pdfTable(pdf, ['Meta', 'Meta', 'Atual', 'Un.', 'Progresso', 'Status'], metas.map(m => ({ nome: m.nome.substring(0, 24), meta: m.valorMeta, atual: m.valorAtual, un: m.unidade, pct: ((m.valorAtual / m.valorMeta) * 100).toFixed(0) + '%', status: m.status })), [46, 24, 24, 14, 22, 24], y, { fontSize: 7, rowH: 4.5 })
    } else {
      pdf.setFontSize(9); pdf.setTextColor(100, 100, 100); pdf.text('Nenhuma meta cadastrada.', 14, y); y += 6
    }
    y += 4

    addFullSection('4. Pipeline de Vendas')
    const pipeline = localDB.get<Record<string, { valor: number; probabilidade: number; cliente: string }[]>>(DB_KEYS.pipeline) || {}
    const labels: Record<string, string> = { prospeccao: 'Prospecção', qualificacao: 'Qualificação', proposta: 'Proposta', negociacao: 'Negociação', fechado_ganho: 'Ganho', fechado_perdido: 'Perdido' }
    Object.entries(pipeline).forEach(([stage, items]) => {
      if (y > 275) { pdf.addPage(); y = 20 }
      const total = items.reduce((s, i) => s + i.valor, 0)
      pdf.setFontSize(9); pdf.setTextColor(60, 60, 60)
      pdf.text(`${labels[stage] || stage}: ${items.length} oportunidades (R$ ${(total / 1e3).toFixed(0)}k)`, 14, y); y += 5
      items.forEach(item => {
        if (y > 278) { pdf.addPage(); y = 20 }
        pdf.setFontSize(8); pdf.setTextColor(80, 80, 80)
        pdf.text(`  • ${item.cliente.substring(0, 22)} - R$${(item.valor / 1e3).toFixed(0)}k (${item.probabilidade}%)`, 16, y); y += 4
      })
    })
    y += 4

    addFullSection('5. SWOT')
    const swot = localDB.get<Record<string, { text: string }[]>>(DB_KEYS.swot)
    if (swot) {
      const sLabels: Record<string, string> = { strengths: 'Forças', weaknesses: 'Fraquezas', opportunities: 'Oportunidades', threats: 'Ameaças' }
      Object.entries(swot).forEach(([key, items]) => {
        if (y > 275) { pdf.addPage(); y = 20 }
        pdf.setFontSize(9); pdf.setTextColor(60, 60, 60)
        pdf.text(`${sLabels[key] || key} (${items.length}):`, 14, y); y += 5
        items.forEach(item => { if (y > 278) { pdf.addPage(); y = 20 }; pdf.setFontSize(8); pdf.text(`  • ${item.text}`, 16, y); y += 4 })
        y += 2
      })
    }
    y += 4

    addFullSection('6. GUT')
    const gut = localDB.get<{ problema: string; score: number }[]>(DB_KEYS.gut) || []
    if (gut.length) {
      y = pdfTable(pdf, ['Problema', 'Score'], gut.map(g => ({ prob: g.problema.substring(0, 60), score: g.score })), [100, 30], y, { fontSize: 7, rowH: 4.5 })
    }

    pdf.save('insightpro_relatorio_completo.pdf')
    relatoriosList.forEach(r => marcarGerado(r.id))
    setTimeout(() => setRelatorioGerando(null), 600)
  }

  const exportarTodosCSV = () => {
    const produtos = localDB.list<ProdutoCadastro>(DB_KEYS.produtos)
    const metas = localDB.get<{ nome: string; valorMeta: number; valorAtual: number; unidade: string; status: string; responsavel: string; prazo: string }[]>(DB_KEYS.metas) || []
    const pipeline = localDB.get<Record<string, { cliente: string; cultura: string; valor: number; probabilidade: number; contato: string; observacao: string }[]>>(DB_KEYS.pipeline) || {}
    let csv = '=== CLIENTES ===\n' + Papa.unparse(rawData)
    csv += '\n\n=== PRODUTOS ===\n' + Papa.unparse(produtos.map(p => ({ nome: p.nome, fornecedor: p.fornecedor, categoria: p.categoria, cultura: p.cultura, custo: p.custo, dose: p.doseRecomendada })))
    csv += '\n\n=== METAS ===\n' + Papa.unparse(metas.map(m => ({ nome: m.nome, valor_meta: m.valorMeta, valor_atual: m.valorAtual, unidade: m.unidade, progresso: ((m.valorAtual / m.valorMeta) * 100).toFixed(1) + '%', status: m.status, responsavel: m.responsavel, prazo: m.prazo })))
    const pipeRows: { estagio: string; cliente: string; cultura: string; valor: number; probabilidade: string; contato: string; observacao: string }[] = []
    Object.entries(pipeline).forEach(([est, items]) => items.forEach(item => pipeRows.push({ estagio: est, cliente: item.cliente, cultura: item.cultura, valor: item.valor, probabilidade: item.probabilidade + '%', contato: item.contato, observacao: item.observacao })))
    csv += '\n\n=== PIPELINE ===\n' + Papa.unparse(pipeRows)

    const swot = localDB.get<Record<string, { text: string }[]>>(DB_KEYS.swot)
    if (swot) { const sRows: { quadrante: string; item: string }[] = []; Object.entries(swot).forEach(([q, items]) => items.forEach(item => sRows.push({ quadrante: q, item: item.text }))); csv += '\n\n=== SWOT ===\n' + Papa.unparse(sRows) }

    const gut = localDB.get<{ problema: string; gravidade: number; urgencia: number; tendencia: number; score: number }[]>(DB_KEYS.gut)
    if (gut?.length) csv += '\n\n=== GUT ===\n' + Papa.unparse(gut.map(g => ({ problema: g.problema, gravidade: g.gravidade, urgencia: g.urgencia, tendencia: g.tendencia, score: g.score })))

    const pest = localDB.get<Record<string, { text: string }[]>>(DB_KEYS.pest)
    if (pest) { const pRows: { fator: string; item: string }[] = []; Object.entries(pest).forEach(([f, items]) => items.forEach(item => pRows.push({ fator: f, item: item.text }))); csv += '\n\n=== PEST ===\n' + Papa.unparse(pRows) }

    const campanhas = localDB.get<{ nome: string; tipo: string; status: string; orcamento: number; retornoEstimado: number; inicio: string; fim: string }[]>(DB_KEYS.campanhas) || []
    if (campanhas.length) csv += '\n\n=== CAMPANHAS ===\n' + Papa.unparse(campanhas.map(c => ({ nome: c.nome, tipo: c.tipo, status: c.status, orcamento: c.orcamento, retorno_estimado: c.retornoEstimado, inicio: c.inicio, fim: c.fim })))

    downloadCSV('insightpro_dados_completos.csv', csv)
  }

  const filtered = tipoFilter === 'todos' ? relatoriosState : relatoriosState.filter(r => r.tipo === tipoFilter)

  return (
    <>
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--green" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <p className="page-hero-eyebrow">Relatórios</p>
            <h1 className="page-hero-title">Central de Relatórios</h1>
            <p className="page-hero-subtitle">Gere relatórios profissionais com os dados da sua carteira</p>
          </div>
        </div>
      </div>

      <div className="card" style={{ background: 'var(--color-green-50)', borderColor: 'var(--color-green-200)' }}>
        <div className="card-body" style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'center' }}>
          <button className="btn btn--primary btn--lg" onClick={gerarPDFCompleto} disabled={relatorioGerando === '_all_'}>
            {relatorioGerando === '_all_' ? 'Gerando PDF...' : 'Gerar PDF Completo (Todos os Relatórios)'}
          </button>
          <button className="btn btn--secondary btn--lg" onClick={exportarTodosCSV}>
            Exportar Todos os Dados em CSV
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <h2>Relatórios Disponíveis ({relatoriosState.length})</h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap' }}>
            {['todos', 'analitico', 'comercial', 'gerencial', 'estrategico'].map(f => (
              <button key={f} className={`btn btn--sm ${tipoFilter === f ? 'btn--primary' : 'btn--secondary'}`} onClick={() => setTipoFilter(f)}>
                {f === 'todos' ? 'Todos' : tipoLabels[f] || f}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 'var(--space-4)' }}>
            {filtered.map(rel => (
              <div
                key={rel.id}
                style={{
                  border: '1px solid var(--border-primary)',
                  borderLeft: rel.geradoEm ? '3px solid var(--color-success)' : '1px solid var(--border-primary)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--space-4)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-3)',
                  background: 'var(--bg-secondary)',
                  transition: 'box-shadow var(--transition-fast)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-xs)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${tipoBadge[rel.tipo] || 'badge--neutral'}`}>
                    {tipoLabels[rel.tipo] || rel.tipo}
                  </span>
                  {rel.geradoEm && <span className="badge badge--success">Gerado</span>}
                </div>
                <div style={{ display: 'flex', gap: 'var(--space-4)', alignItems: 'flex-start' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-subtle)', color: 'var(--color-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <ReportIcon name={rel.icone} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 'var(--text-base)' }}>{rel.titulo}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>{rel.descricao}</p>
                  </div>
                </div>
                {rel.geradoEm && (
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-tertiary)' }}>
                    Gerado em: {new Date(rel.geradoEm).toLocaleString('pt-BR')}
                  </div>
                )}
                <div style={{ marginTop: 'auto', display: 'flex', gap: 'var(--space-2)' }}>
                  <button
                    className="btn btn--primary btn--sm"
                    onClick={() => gerarPDF(rel.id)}
                    disabled={relatorioGerando === rel.id || relatorioGerando === '_all_'}
                    style={{ flex: 1 }}
                  >
                    {relatorioGerando === rel.id ? 'Gerando...' : 'PDF'}
                  </button>
                  <button
                    className="btn btn--secondary btn--sm"
                    onClick={() => gerarCSV(rel.id)}
                    disabled={relatorioGerando === rel.id || relatorioGerando === '_all_'}
                    style={{ flex: 1 }}
                  >
                    CSV
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
