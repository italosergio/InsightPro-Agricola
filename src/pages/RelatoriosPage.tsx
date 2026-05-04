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
  { id: 'r2', titulo: 'Análise ABC de Faturamento', tipo: 'analitico', descricao: 'Classificação ABC dos clientes com gráficos de faturamento acumulado', icone: 'bar-chart', geradoEm: null },
  { id: 'r3', titulo: 'Penetração por Estado e Cultura', tipo: 'analitico', descricao: 'Análise geográfica da carteira com distribuição por estado e cultura', icone: 'map', geradoEm: null },
  { id: 'r4', titulo: 'Produtos Cadastrados', tipo: 'analitico', descricao: 'Catálogo completo de produtos com doses, culturas e fornecedores', icone: 'star', geradoEm: null },
  { id: 'r5', titulo: 'Relatório de Prospects', tipo: 'comercial', descricao: 'Prospects ativos com potencial de compra, contatos e observações', icone: 'target', geradoEm: null },
  { id: 'r6', titulo: 'Metas e Indicadores', tipo: 'gerencial', descricao: 'Acompanhamento de metas, KPIs e progresso das ações estratégicas', icone: 'trending-up', geradoEm: null },
  { id: 'r7', titulo: 'Pipeline de Vendas', tipo: 'comercial', descricao: 'Oportunidades por estágio do pipeline com valores e probabilidades', icone: 'git-branch', geradoEm: null },
  { id: 'r8', titulo: 'Matriz SWOT', tipo: 'estrategico', descricao: 'Forças, fraquezas, oportunidades e ameaças da operação', icone: 'grid', geradoEm: null },
  { id: 'r9', titulo: 'Matriz GUT - Priorização', tipo: 'estrategico', descricao: 'Problemas priorizados por gravidade, urgência e tendência', icone: 'star', geradoEm: null },
  { id: 'r10', titulo: 'Análise PEST', tipo: 'estrategico', descricao: 'Fatores políticos, econômicos, sociais e tecnológicos', icone: 'globe', geradoEm: null },
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
  'target': <><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></>,
  'trending-up': <><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></>,
  'git-branch': <><line x1="6" y1="3" x2="6" y2="15" /><circle cx="6" cy="3" r="3" /><circle cx="6" cy="21" r="3" /><circle cx="18" cy="9" r="3" /><path d="M18 9a9 9 0 0 1-9 9" /></>,
  'grid': <><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></>,
  'star': <><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></>,
  'globe': <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>,
  'file-text': <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
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
    let filename = ''

    switch (id) {
      case 'r1': {
        csv = Papa.unparse(rawData)
        filename = 'carteira_clientes.csv'
        break
      }
      case 'r2': {
        const sorted = [...rawData].sort((a, b) => b.faturamento_anual - a.faturamento_anual)
        const total = sorted.reduce((s, c) => s + c.faturamento_anual, 0)
        let acum = 0
        csv = Papa.unparse(sorted.map((c, i) => {
          acum += c.faturamento_anual
          const pctInd = total > 0 ? (c.faturamento_anual / total) * 100 : 0
          const pctAcum = total > 0 ? (acum / total) * 100 : 0
          let classe = 'C'
          if (pctAcum <= 80) classe = 'A'
          else if (pctAcum <= 95) classe = 'B'
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
        Object.entries(mapa).forEach(([estado, cults]) => {
          Object.entries(cults).forEach(([cultura, area]) => rows.push({ estado, cultura, area }))
        })
        csv = Papa.unparse(rows)
        filename = 'penetracao_estado_cultura.csv'
        break
      }
      case 'r4': {
        csv = Papa.unparse(produtos.map(p => ({ nome: p.nome, fornecedor: p.fornecedor, categoria: p.categoria, cultura: p.cultura, custo: p.custo, dose: p.doseRecomendada, intervalo: p.intervalo, modo_acao: p.modoAcao, ingrediente_ativo: p.ingredienteAtivo })))
        filename = 'produtos_cadastrados.csv'
        break
      }
      case 'r5': {
        const prospects = rawData.filter(c => c.status === 'prospect')
        csv = Papa.unparse(prospects.map(c => ({ nome: c.nome, telefone: c.telefone, email: c.email, cidade: c.cidade, estado: c.estado, cultura: c.cultura_principal, potencial_compra: c.potencial_compra, area: c.area_hectares })))
        filename = 'prospects.csv'
        break
      }
      case 'r6': {
        const metas = localDB.get<{ id: string; nome: string; valorMeta: number; valorAtual: number; unidade: string; status: string; responsavel: string; prazo: string }[]>(DB_KEYS.metas) || []
        csv = Papa.unparse(metas.map(m => ({
          nome: m.nome,
          valor_meta: m.valorMeta,
          valor_atual: m.valorAtual,
          unidade: m.unidade,
          progresso: ((m.valorAtual / m.valorMeta) * 100).toFixed(1) + '%',
          status: m.status,
          responsavel: m.responsavel,
          prazo: m.prazo,
        })))
        filename = 'metas_kpis.csv'
        break
      }
      case 'r7': {
        const pipeline = localDB.get<Record<string, { valor: number; probabilidade: number; cliente: string; cultura: string; cidade: string; contato: string; observacao: string }[]>>(DB_KEYS.pipeline) || {}
        const rows: { estagio: string; cliente: string; cultura: string; valor: number; probabilidade: string; contato: string; observacao: string }[] = []
        Object.entries(pipeline).forEach(([estagio, items]) => {
          items.forEach(item => rows.push({ estagio, cliente: item.cliente, cultura: item.cultura, valor: item.valor, probabilidade: item.probabilidade + '%', contato: item.contato, observacao: item.observacao }))
        })
        csv = Papa.unparse(rows)
        filename = 'pipeline_vendas.csv'
        break
      }
      case 'r8': {
        const swot = localDB.get<Record<string, { text: string }[]>>(DB_KEYS.swot)
        if (swot) {
          const rows: { quadrante: string; item: string }[] = []
          Object.entries(swot).forEach(([q, items]) => {
            items.forEach(item => rows.push({ quadrante: q, item: item.text }))
          })
          csv = Papa.unparse(rows)
        }
        filename = 'matriz_swot.csv'
        break
      }
      case 'r9': {
        const gut = localDB.get<{ problema: string; gravidade: number; urgencia: number; tendencia: number; score: number }[]>(DB_KEYS.gut) || []
        csv = Papa.unparse(gut.map(g => ({ problema: g.problema, gravidade: g.gravidade, urgencia: g.urgencia, tendencia: g.tendencia, score: g.score })))
        filename = 'matriz_gut.csv'
        break
      }
      case 'r10': {
        const pest = localDB.get<Record<string, { text: string }[]>>(DB_KEYS.pest)
        if (pest) {
          const rows: { fator: string; item: string }[] = []
          Object.entries(pest).forEach(([f, items]) => {
            items.forEach(item => rows.push({ fator: f, item: item.text }))
          })
          csv = Papa.unparse(rows)
        }
        filename = 'analise_pest.csv'
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
    let y = 20

    const addTitle = (text: string) => {
      pdf.setFontSize(16)
      pdf.setTextColor(22, 163, 74)
      pdf.text(text, 14, y)
      y += 10
      pdf.setDrawColor(22, 163, 74)
      pdf.line(14, y, 196, y)
      y += 6
    }

    const addSubtitle = (text: string) => {
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(text, 14, y)
      y += 8
    }

    const checkPageBreak = (h: number = 10) => {
      if (y + h > 280) {
        pdf.addPage()
        y = 20
      }
    }

    const rel = relatoriosList.find(r => r.id === id)
    addTitle(rel?.titulo || 'Relatório')
    addSubtitle(`Gerado em ${new Date().toLocaleString('pt-BR')}`)
    y += 4

    const produtos = localDB.list<ProdutoCadastro>(DB_KEYS.produtos)

    switch (id) {
      case 'r1': {
        const headers = ['Nome', 'CPF/CNPJ', 'Cidade/UF', 'Cultura', 'Área (ha)', 'Faturamento', 'Status']
        const colW = [50, 35, 30, 25, 20, 25, 11]
        pdf.setFontSize(7)
        pdf.setTextColor(0)
        headers.forEach((h, i) => pdf.text(h, 14 + colW.slice(0, i).reduce((a: number, w: number) => a + w, 0), y))
        y += 4
        rawData.forEach(c => {
          checkPageBreak(5)
          const vals = [c.nome.substring(0, 28), c.cpf_cnpj, `${c.cidade}/${c.estado}`, c.cultura_principal, String(c.area_hectares), c.faturamento_anual.toLocaleString('pt-BR'), c.status]
          vals.forEach((v, i) => pdf.text(v, 14 + colW.slice(0, i).reduce((a: number, w: number) => a + w, 0), y))
          y += 4.5
        })
        break
      }
      case 'r2': {
        const sorted = [...rawData].sort((a, b) => b.faturamento_anual - a.faturamento_anual)
        const total = sorted.reduce((s, c) => s + c.faturamento_anual, 0)
        let acum = 0
        pdf.setFontSize(9)
        pdf.text(`Total clientes: ${sorted.length} | Faturamento total: R$ ${(total / 1e6).toFixed(0)}Mi`, 14, y)
        y += 8
        const colW = [8, 50, 25, 22, 22, 16, 16, 20]
        const headers = ['#', 'Cliente', 'Faturamento', '% Ind.', '% Acum.', 'Classe', 'Estado', 'Cultura']
        pdf.setFontSize(7)
        headers.forEach((h, i) => pdf.text(h, 14 + colW.slice(0, i).reduce((a: number, w: number) => a + w, 0), y))
        y += 4
        sorted.forEach((c, i) => {
          checkPageBreak(5)
          acum += c.faturamento_anual
          const pctInd = total > 0 ? ((c.faturamento_anual / total) * 100).toFixed(1) + '%' : '0%'
          const pctAcum = total > 0 ? ((acum / total) * 100).toFixed(1) + '%' : '0%'
          let cls = 'C'
          if ((acum / total) * 100 <= 80) cls = 'A'
          else if ((acum / total) * 100 <= 95) cls = 'B'
          const vals = [String(i + 1), c.nome.substring(0, 28), c.faturamento_anual.toLocaleString('pt-BR'), pctInd, pctAcum, cls, c.estado, c.cultura_principal]
          vals.forEach((v, j) => pdf.text(v, 14 + colW.slice(0, j).reduce((a: number, w: number) => a + w, 0), y))
          y += 4.5
        })
        break
      }
      case 'r4': {
        const colW = [40, 25, 25, 20, 15, 22, 15, 24]
        const headers = ['Produto', 'Fornecedor', 'Categoria', 'Cultura', 'Custo', 'Dose', 'Intervalo', 'Ing. Ativo']
        pdf.setFontSize(7)
        headers.forEach((h, i) => pdf.text(h, 14 + colW.slice(0, i).reduce((a: number, w: number) => a + w, 0), y))
        y += 4
        produtos.forEach(p => {
          checkPageBreak(5)
          const vals = [p.nome.substring(0, 22), p.fornecedor.substring(0, 14), p.categoria, p.cultura, `R$ ${p.custo}`, p.doseRecomendada, p.intervalo + 'd', p.ingredienteAtivo.substring(0, 13)]
          vals.forEach((v, j) => pdf.text(v, 14 + colW.slice(0, j).reduce((a: number, w: number) => a + w, 0), y))
          y += 4.5
        })
        break
      }
      case 'r5': {
        const prospects = rawData.filter(c => c.status === 'prospect')
        const colW = [44, 30, 42, 25, 18, 18]
        const headers = ['Nome', 'Cidade/UF', 'Email', 'Cultura', 'Potencial', 'Área (ha)']
        pdf.setFontSize(7)
        headers.forEach((h, i) => pdf.text(h, 14 + colW.slice(0, i).reduce((a: number, w: number) => a + w, 0), y))
        y += 4
        prospects.forEach(c => {
          checkPageBreak(5)
          const vals = [c.nome.substring(0, 24), `${c.cidade}/${c.estado}`, c.email.substring(0, 23), c.cultura_principal, `R$${(c.potencial_compra / 1e3).toFixed(0)}k`, String(c.area_hectares)]
          vals.forEach((v, j) => pdf.text(v, 14 + colW.slice(0, j).reduce((a: number, w: number) => a + w, 0), y))
          y += 4.5
        })
        break
      }
      case 'r6': {
        const metas = localDB.get<{ nome: string; valorMeta: number; valorAtual: number; unidade: string; status: string; responsavel: string; prazo: string }[]>(DB_KEYS.metas) || []
        const colW = [50, 22, 22, 18, 22, 17, 28]
        const headers = ['Meta', 'Valor Meta', 'Valor Atual', 'Unidade', 'Progresso', 'Status', 'Responsável']
        pdf.setFontSize(7)
        headers.forEach((h, i) => pdf.text(h, 14 + colW.slice(0, i).reduce((a: number, w: number) => a + w, 0), y))
        y += 4
        metas.forEach(m => {
          checkPageBreak(5)
          const pct = ((m.valorAtual / m.valorMeta) * 100).toFixed(0) + '%'
          const vals = [m.nome.substring(0, 28), String(m.valorMeta), String(m.valorAtual), m.unidade, pct, m.status, m.responsavel]
          vals.forEach((v, j) => pdf.text(v, 14 + colW.slice(0, j).reduce((a: number, w: number) => a + w, 0), y))
          y += 4.5
        })
        break
      }
      case 'r7': {
        const pipeline = localDB.get<Record<string, { valor: number; probabilidade: number; cliente: string; cultura: string; observacao: string }[]>>(DB_KEYS.pipeline) || {}
        const colW = [28, 42, 22, 20, 16, 50]
        const headers = ['Estágio', 'Cliente', 'Cultura', 'Valor', 'Prob.', 'Observação']
        pdf.setFontSize(7)
        headers.forEach((h, i) => pdf.text(h, 14 + colW.slice(0, i).reduce((a: number, w: number) => a + w, 0), y))
        y += 4
        const labels: Record<string, string> = {
          prospeccao: 'Prospecção',
          qualificacao: 'Qualificação',
          proposta: 'Proposta',
          negociacao: 'Negociação',
          fechado_ganho: 'Ganho',
          fechado_perdido: 'Perdido',
        }
        Object.entries(pipeline).forEach(([stage, items]) => {
          items.forEach(item => {
            checkPageBreak(5)
            const vals = [labels[stage] || stage, item.cliente.substring(0, 23), item.cultura, `R$${(item.valor / 1e3).toFixed(0)}k`, item.probabilidade + '%', item.observacao.substring(0, 27)]
            vals.forEach((v, j) => pdf.text(v, 14 + colW.slice(0, j).reduce((a: number, w: number) => a + w, 0), y))
            y += 4.5
          })
        })
        break
      }
      case 'r8':
      case 'r9':
      case 'r10':
      default: {
        pdf.setFontSize(11)
        pdf.setTextColor(60, 60, 60)
        pdf.text('Este relatório está disponível em formato CSV.', 14, y)
        y += 8
        pdf.text('Utilize o botão CSV ao lado para exportar os dados.', 14, y)
        y += 8
        pdf.text('Para visualização completa, acesse a ferramenta correspondente no menu.', 14, y)
        break
      }
    }

    pdf.save(`${(rel?.titulo || 'relatorio').toLowerCase().replace(/\s+/g, '_')}.pdf`)
    marcarGerado(id)
    setTimeout(() => setRelatorioGerando(null), 600)
  }

  const gerarPDFCompleto = async () => {
    setRelatorioGerando('_all_')
    const jsPDF = (await import('jspdf')).default
    const pdf = new jsPDF('p', 'mm', 'a4')
    pdf.setFontSize(18)
    pdf.setTextColor(22, 163, 74)
    pdf.text('InsightPro Agrícola', 14, 20)
    pdf.setFontSize(12)
    pdf.setTextColor(80, 80, 80)
    pdf.text('Relatório Completo da Carteira', 14, 28)
    pdf.setFontSize(9)
    pdf.setTextColor(120, 120, 120)
    pdf.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, 35)
    pdf.setDrawColor(22, 163, 74)
    pdf.line(14, 38, 196, 38)

    let y = 46

    const checkPageBreak = (h: number = 10) => {
      if (y + h > 280) { pdf.addPage(); y = 20 }
    }

    const sectionTitle = (text: string) => {
      checkPageBreak(14)
      pdf.setFontSize(13)
      pdf.setTextColor(22, 163, 74)
      pdf.text(text, 14, y)
      y += 9
    }

    sectionTitle('1. Resumo Executivo')
    pdf.setFontSize(10)
    pdf.setTextColor(60, 60, 60)
    const totalClientes = rawData.length
    const totalFat = rawData.reduce((s, c) => s + c.faturamento_anual, 0)
    const totalArea = rawData.reduce((s, c) => s + c.area_hectares, 0)
    const ativos = rawData.filter(c => c.status === 'ativo').length
    const prospects = rawData.filter(c => c.status === 'prospect').length
    const inativos = rawData.filter(c => c.status === 'inativo').length
    pdf.text(`Total de Clientes: ${totalClientes}`, 14, y); y += 6
    pdf.text(`Clientes Ativos: ${ativos} | Prospects: ${prospects} | Inativos: ${inativos}`, 14, y); y += 6
    pdf.text(`Faturamento Total: R$ ${(totalFat / 1e6).toFixed(0)} Mi`, 14, y); y += 6
    pdf.text(`Área Total: ${totalArea.toLocaleString('pt-BR')} hectares`, 14, y); y += 6
    const produtos = localDB.list<ProdutoCadastro>(DB_KEYS.produtos)
    pdf.text(`Produtos Cadastrados: ${produtos.length}`, 14, y); y += 10

    sectionTitle('2. Carteira de Clientes')
    const colWClientes = [50, 30, 22, 20, 25]
    pdf.setFontSize(7)
    const hClientes = ['Nome', 'Cidade/UF', 'Cultura', 'Área (ha)', 'Faturamento']
    hClientes.forEach((h, i) => pdf.text(h, 14 + colWClientes.slice(0, i).reduce((a: number, w: number) => a + w, 0), y))
    y += 4
    rawData.slice(0, 40).forEach(c => {
      checkPageBreak(5)
      const vals = [c.nome.substring(0, 28), `${c.cidade}/${c.estado}`, c.cultura_principal, String(c.area_hectares), `R$${(c.faturamento_anual / 1e6).toFixed(1)}Mi`]
      vals.forEach((v, j) => pdf.text(v, 14 + colWClientes.slice(0, j).reduce((a: number, w: number) => a + w, 0), y))
      y += 4.5
    })
    if (rawData.length > 40) { pdf.setFontSize(9); pdf.text(`... e mais ${rawData.length - 40} clientes`, 14, y); }
    y += 10

    sectionTitle('3. Produtos Cadastrados')
    const colWProd = [40, 25, 25, 20, 15, 22]
    const hProd = ['Produto', 'Fornecedor', 'Categoria', 'Cultura', 'Custo', 'Dose']
    pdf.setFontSize(7)
    hProd.forEach((h, i) => pdf.text(h, 14 + colWProd.slice(0, i).reduce((a: number, w: number) => a + w, 0), y))
    y += 4
    produtos.forEach(p => {
      checkPageBreak(5)
      const vals = [p.nome.substring(0, 22), p.fornecedor.substring(0, 14), p.categoria, p.cultura, `R$ ${p.custo}`, p.doseRecomendada]
      vals.forEach((v, j) => pdf.text(v, 14 + colWProd.slice(0, j).reduce((a: number, w: number) => a + w, 0), y))
      y += 4.5
    })
    y += 10

    sectionTitle('4. Metas e KPIs')
    const metas = localDB.get<{ nome: string; valorMeta: number; valorAtual: number; unidade: string; status: string }[]>(DB_KEYS.metas) || []
    if (metas.length) {
      pdf.setFontSize(7)
      const colWMetas = [50, 22, 22, 18, 22, 17]
      const hMetas = ['Meta', 'Meta', 'Atual', 'Unid.', 'Progresso', 'Status']
      hMetas.forEach((h, i) => pdf.text(h, 14 + colWMetas.slice(0, i).reduce((a: number, w: number) => a + w, 0), y))
      y += 4
      metas.forEach(m => {
        checkPageBreak(5)
        const pct = ((m.valorAtual / m.valorMeta) * 100).toFixed(0) + '%'
        const vals = [m.nome.substring(0, 28), String(m.valorMeta), String(m.valorAtual), m.unidade, pct, m.status]
        vals.forEach((v, j) => pdf.text(v, 14 + colWMetas.slice(0, j).reduce((a: number, w: number) => a + w, 0), y))
        y += 4.5
      })
    }
    y += 10

    sectionTitle('5. Pipeline de Vendas')
    const pipeline = localDB.get<Record<string, { valor: number; probabilidade: number; cliente: string }[]>>(DB_KEYS.pipeline) || {}
    const labelsPipe: Record<string, string> = { prospeccao: 'Prospecção', qualificacao: 'Qualificação', proposta: 'Proposta', negociacao: 'Negociação', fechado_ganho: 'Ganho', fechado_perdido: 'Perdido' }
    Object.entries(pipeline).forEach(([stage, items]) => {
      const totalVal = items.reduce((s, i) => s + i.valor, 0)
      pdf.setFontSize(9)
      pdf.setTextColor(60, 60, 60)
      pdf.text(`${labelsPipe[stage] || stage}: ${items.length} oportunidades (R$ ${(totalVal / 1e3).toFixed(0)}k)`, 14, y)
      y += 5
    })
    y += 10

    sectionTitle('6. Matriz SWOT')
    const swot = localDB.get<Record<string, { text: string }[]>>(DB_KEYS.swot)
    if (swot) {
      const labelsSwot: Record<string, string> = { strengths: 'Forças', weaknesses: 'Fraquezas', opportunities: 'Oportunidades', threats: 'Ameaças' }
      Object.entries(swot).forEach(([key, items]) => {
        checkPageBreak(6)
        pdf.setFontSize(9)
        pdf.setTextColor(60, 60, 60)
        pdf.text(`${labelsSwot[key] || key}:`, 14, y); y += 5
        pdf.setFontSize(8)
        items.forEach(item => {
          checkPageBreak(5)
          pdf.text(`• ${item.text}`, 18, y); y += 4.5
        })
        y += 2
      })
    }

    pdf.save('insightpro_relatorio_completo.pdf')
    relatoriosList.forEach(r => marcarGerado(r.id))
    setTimeout(() => setRelatorioGerando(null), 600)
  }

  const exportarTodosCSV = () => {
    const produtos = localDB.list<ProdutoCadastro>(DB_KEYS.produtos)
    const metas = localDB.get<{ nome: string; valorMeta: number; valorAtual: number; unidade: string; status: string; responsavel: string; prazo: string }[]>(DB_KEYS.metas) || []
    const pipeline = localDB.get<Record<string, { cliente: string; cultura: string; valor: number; probabilidade: number; contato: string; observacao: string }[]>>(DB_KEYS.pipeline) || {}

    let csv = '=== CLIENTES ===\n'
    csv += Papa.unparse(rawData)
    csv += '\n\n=== PRODUTOS ===\n'
    csv += Papa.unparse(produtos.map(p => ({ nome: p.nome, fornecedor: p.fornecedor, categoria: p.categoria, cultura: p.cultura, custo: p.custo, dose: p.doseRecomendada })))
    csv += '\n\n=== METAS ===\n'
    csv += Papa.unparse(metas.map(m => ({ nome: m.nome, valor_meta: m.valorMeta, valor_atual: m.valorAtual, unidade: m.unidade, progresso: ((m.valorAtual / m.valorMeta) * 100).toFixed(1) + '%', status: m.status, responsavel: m.responsavel, prazo: m.prazo })))
    csv += '\n\n=== PIPELINE ===\n'
    const pipeRows: { estagio: string; cliente: string; cultura: string; valor: number; probabilidade: string; contato: string; observacao: string }[] = []
    Object.entries(pipeline).forEach(([estagio, items]) => {
      items.forEach(item => pipeRows.push({ estagio, cliente: item.cliente, cultura: item.cultura, valor: item.valor, probabilidade: item.probabilidade + '%', contato: item.contato, observacao: item.observacao }))
    })
    csv += Papa.unparse(pipeRows)

    const swot = localDB.get<Record<string, { text: string }[]>>(DB_KEYS.swot)
    if (swot) {
      csv += '\n\n=== SWOT ===\n'
      const sRows: { quadrante: string; item: string }[] = []
      Object.entries(swot).forEach(([q, items]) => items.forEach(item => sRows.push({ quadrante: q, item: item.text })))
      csv += Papa.unparse(sRows)
    }

    const gut = localDB.get<{ problema: string; gravidade: number; urgencia: number; tendencia: number; score: number }[]>(DB_KEYS.gut)
    if (gut?.length) {
      csv += '\n\n=== GUT ===\n'
      csv += Papa.unparse(gut.map(g => ({ problema: g.problema, gravidade: g.gravidade, urgencia: g.urgencia, tendencia: g.tendencia, score: g.score })))
    }

    const pest = localDB.get<Record<string, { text: string }[]>>(DB_KEYS.pest)
    if (pest) {
      csv += '\n\n=== PEST ===\n'
      const pRows: { fator: string; item: string }[] = []
      Object.entries(pest).forEach(([f, items]) => items.forEach(item => pRows.push({ fator: f, item: item.text })))
      csv += Papa.unparse(pRows)
    }

    downloadCSV('insightpro_dados_completos.csv', csv)
  }

  const totalGerados = relatoriosState.filter(r => r.geradoEm).length
  const pendentes = relatoriosState.length - totalGerados
  const ultimaGeracao = relatoriosState.some(r => r.geradoEm)
    ? new Date(Math.max(...relatoriosState.filter(r => r.geradoEm).map(r => new Date(r.geradoEm!).getTime())))
    : null

  const filtered = tipoFilter === 'todos'
    ? relatoriosState
    : relatoriosState.filter(r => r.tipo === tipoFilter)

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
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{relatoriosState.length}</span>
              <span className="page-hero-kpi-label">Disponíveis</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{totalGerados}</span>
              <span className="page-hero-kpi-label">Gerados</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{pendentes}</span>
              <span className="page-hero-kpi-label">Pendentes</span>
            </div>
          </div>
        </div>
      </div>

      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total de Relatórios</div>
          <div className="kpi-value">{relatoriosState.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Relatórios Gerados</div>
          <div className="kpi-value" style={{ color: 'var(--color-success)' }}>{totalGerados}</div>
          <div className="kpi-trend positive">{totalGerados > 0 ? `${Math.round((totalGerados / relatoriosState.length) * 100)}% do total` : 'Nenhum'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pendentes</div>
          <div className="kpi-value" style={{ color: 'var(--color-warning)' }}>{pendentes}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Última Geração</div>
          <div className="kpi-value" style={{ fontSize: 'var(--text-sm)' }}>
            {ultimaGeracao ? ultimaGeracao.toLocaleString('pt-BR') : '---'}
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
          <h2>Relatórios Disponíveis</h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
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
