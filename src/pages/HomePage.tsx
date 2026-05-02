import React, { useMemo, useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useData } from '@/store/DataContext'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePageTitle } from '@/hooks/useTheme'
import { useAnimatedNumber } from '@/hooks/useAnimatedNumber'

// ── Types ──────────────────────────────────────────────────────────────────────

interface ToolDef {
  path: string
  label: string
  desc: string
  category: 'principal' | 'analises' | 'estrategia' | 'relatorios'
  icon: React.ReactNode
}

interface MetaItem {
  id: string
  nome: string
  valorMeta: number
  valorAtual: number
  unidade: string
  status: string
}

interface PipelineStage {
  key: string
  label: string
  items: { valor: number; probabilidade: number }[]
}

// ── Tool definitions ───────────────────────────────────────────────────────────

const tools: ToolDef[] = [
  {
    path: '/', label: 'Dashboard', desc: 'Visão geral com KPIs, gráficos de faturamento, status e culturas da carteira.',
    category: 'principal',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>,
  },
  {
    path: '/upload', label: 'Upload de Dados', desc: 'Importe sua carteira de clientes via CSV com mapeamento automático de colunas.',
    category: 'principal',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>,
  },
  {
    path: '/clientes', label: 'Clientes', desc: 'Tabela completa de clientes com filtros avançados por estado, cultura e status.',
    category: 'principal',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  },
  {
    path: '/analise-abc', label: 'Análise ABC', desc: 'Classifique clientes por faturamento: A (20% do volume, 80% do valor), B e C.',
    category: 'analises',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>,
  },
  {
    path: '/penetracao', label: 'Penetração', desc: 'Analise a cobertura geográfica da carteira por estado, região e cultura.',
    category: 'analises',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>,
  },
  {
    path: '/swot', label: 'Análise SWOT', desc: 'Mapeie forças, fraquezas, oportunidades e ameaças do seu negócio.',
    category: 'analises',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="12" y1="3" x2="12" y2="21" /></svg>,
  },
  {
    path: '/gut', label: 'Matriz GUT', desc: 'Priorize problemas por Gravidade, Urgência e Tendência com score automático.',
    category: 'analises',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>,
  },
  {
    path: '/pest', label: 'Análise PEST', desc: 'Avalie fatores Políticos, Econômicos, Sociais e Tecnológicos do macro-ambiente.',
    category: 'analises',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
  },
  {
    path: '/metas', label: 'Metas & KPIs', desc: 'Acompanhe o progresso de metas financeiras, comerciais e operacionais.',
    category: 'estrategia',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>,
  },
  {
    path: '/campanhas', label: 'Campanhas', desc: 'Planeje e acompanhe campanhas comerciais com orçamento e retorno estimado.',
    category: 'estrategia',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3z" /><path d="M16 8a4 4 0 0 0-8 0v5h8V8z" /></svg>,
  },
  {
    path: '/pipeline', label: 'Pipeline', desc: 'Gerencie oportunidades de venda em cada etapa do funil comercial.',
    category: 'estrategia',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>,
  },
  {
    path: '/relatorios', label: 'Relatórios', desc: 'Gere relatórios analíticos, comerciais e estratégicos em PDF.',
    category: 'relatorios',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>,
  },
  {
    path: '/exportar', label: 'Exportar', desc: 'Exporte dados e relatórios nos formatos CSV e PDF para uso externo.',
    category: 'relatorios',
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="12" y1="18" x2="12" y2="12" /><polyline points="9 15 12 12 15 15" /></svg>,
  },
]

const categoryMeta = {
  principal:  { label: 'Principal',   color: '#22c55e', bg: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.35)' },
  analises:   { label: 'Análises',    color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.35)' },
  estrategia: { label: 'Estratégia',  color: '#a855f7', bg: 'rgba(168,85,247,0.12)', border: 'rgba(168,85,247,0.35)' },
  relatorios: { label: 'Relatórios',  color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.35)' },
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function AnimatedKpiChip({ label, value, suffix = '' }: { label: string; value: number; suffix?: string }) {
  const animated = useAnimatedNumber(value)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (ref.current) ref.current.style.setProperty('--num', String(animated))
  }, [animated])
  return (
    <div className="home-kpi-chip" ref={ref}>
      <div className="home-kpi-chip-value">
        {suffix === 'currency'
          ? value >= 1e9
            ? `R$ ${(animated / 1e9).toFixed(1).replace('.', ',')} Bi`
            : value >= 1e6
            ? `R$ ${(animated / 1e6).toFixed(1).replace('.', ',')} Mi`
            : `R$ ${Math.round(animated).toLocaleString('pt-BR')}`
          : suffix === 'ha'
          ? `${Math.round(animated).toLocaleString('pt-BR')} ha`
          : Math.round(animated).toLocaleString('pt-BR')}
      </div>
      <div className="home-kpi-chip-label">{label}</div>
    </div>
  )
}

function ToolCard({ tool }: { tool: ToolDef }) {
  const meta = categoryMeta[tool.category]
  return (
    <Link to={tool.path} className="home-tool-card" style={{ '--card-accent': meta.color, '--card-bg': meta.bg, '--card-border': meta.border } as React.CSSProperties}>
      <div className="home-tool-card-icon" style={{ color: meta.color, background: meta.bg }}>
        {tool.icon}
      </div>
      <div className="home-tool-card-body">
        <div className="home-tool-card-title">{tool.label}</div>
        <div className="home-tool-card-desc">{tool.desc}</div>
      </div>
      <span className="home-tool-card-badge" style={{ color: meta.color, background: meta.bg, border: `1px solid ${meta.border}` }}>
        {meta.label}
      </span>
      <div className="home-tool-card-arrow">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
      </div>
    </Link>
  )
}

function SwotPreview() {
  const [data, setData] = useState<{ strengths: {text:string}[]; weaknesses: {text:string}[]; opportunities: {text:string}[]; threats: {text:string}[] } | null>(null)
  useEffect(() => {
    const raw = localStorage.getItem('insightpro_swot')
    if (raw) setData(JSON.parse(raw))
  }, [])
  if (!data) return null
  const quads = [
    { key: 'strengths',    label: 'Forças',         color: '#22c55e', bg: 'rgba(34,197,94,0.08)',  items: data.strengths },
    { key: 'weaknesses',   label: 'Fraquezas',      color: '#ef4444', bg: 'rgba(239,68,68,0.08)',  items: data.weaknesses },
    { key: 'opportunities',label: 'Oportunidades',  color: '#3b82f6', bg: 'rgba(59,130,246,0.08)', items: data.opportunities },
    { key: 'threats',      label: 'Ameaças',        color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', items: data.threats },
  ]
  return (
    <div className="home-swot-grid">
      {quads.map(q => (
        <div key={q.key} className="home-swot-quad" style={{ '--q-color': q.color, '--q-bg': q.bg } as React.CSSProperties}>
          <div className="home-swot-quad-title" style={{ color: q.color }}>{q.label} <span>({q.items.length})</span></div>
          <ul className="home-swot-list">
            {q.items.slice(0, 3).map((item, i) => <li key={i}>{item.text}</li>)}
            {q.items.length > 3 && <li className="home-swot-more">+{q.items.length - 3} mais...</li>}
          </ul>
        </div>
      ))}
    </div>
  )
}

function GutPreview() {
  const [items, setItems] = useState<{ problema: string; score: number }[]>([])
  useEffect(() => {
    const raw = localStorage.getItem('insightpro_gut')
    if (raw) setItems(JSON.parse(raw).slice(0, 5))
  }, [])
  if (!items.length) return null
  const maxScore = items[0]?.score || 1
  return (
    <div className="home-gut-list">
      {items.map((item, i) => (
        <div key={i} className="home-gut-item">
          <div className="home-gut-item-header">
            <span className="home-gut-rank">#{i + 1}</span>
            <span className="home-gut-problema">{item.problema}</span>
            <span className="home-gut-score">{item.score}</span>
          </div>
          <div className="home-gut-bar-track">
            <div className="home-gut-bar-fill" style={{ width: `${(item.score / maxScore) * 100}%` }} />
          </div>
        </div>
      ))}
    </div>
  )
}

function MetasPreview() {
  const [metas, setMetas] = useState<MetaItem[]>([])
  useEffect(() => {
    const raw = localStorage.getItem('insightpro_metas')
    if (raw) setMetas(JSON.parse(raw).slice(0, 5))
  }, [])
  if (!metas.length) return null
  return (
    <div className="home-metas-list">
      {metas.map(meta => {
        const pct = Math.min((meta.valorAtual / meta.valorMeta) * 100, 100)
        const isAtrasado = meta.status === 'atrasado'
        return (
          <div key={meta.id} className="home-meta-item">
            <div className="home-meta-header">
              <span className="home-meta-nome">{meta.nome}</span>
              <span className="home-meta-pct" style={{ color: isAtrasado ? '#ef4444' : pct >= 80 ? '#22c55e' : '#f59e0b' }}>{pct.toFixed(0)}%</span>
            </div>
            <div className="home-meta-track">
              <div className="home-meta-fill" style={{ width: `${pct}%`, background: isAtrasado ? '#ef4444' : pct >= 80 ? '#22c55e' : '#f59e0b' }} />
            </div>
            <div className="home-meta-footer">
              <span>{meta.unidade === 'R$' ? `R$ ${(meta.valorAtual / 1e6).toFixed(0)}Mi` : `${meta.valorAtual.toLocaleString('pt-BR')} ${meta.unidade}`}</span>
              <span>meta: {meta.unidade === 'R$' ? `R$ ${(meta.valorMeta / 1e6).toFixed(0)}Mi` : `${meta.valorMeta.toLocaleString('pt-BR')} ${meta.unidade}`}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PipelinePreview() {
  const [pipeline, setPipeline] = useState<Record<string, { valor: number; probabilidade: number }[]>>({})
  useEffect(() => {
    const raw = localStorage.getItem('insightpro_pipeline')
    if (raw) setPipeline(JSON.parse(raw))
  }, [])

  const stages: PipelineStage[] = [
    { key: 'prospeccao',    label: 'Prospecção',   items: pipeline.prospeccao    || [] },
    { key: 'qualificacao',  label: 'Qualificação', items: pipeline.qualificacao  || [] },
    { key: 'proposta',      label: 'Proposta',     items: pipeline.proposta      || [] },
    { key: 'negociacao',    label: 'Negociação',   items: pipeline.negociacao    || [] },
    { key: 'fechado_ganho', label: 'Ganho',        items: pipeline.fechado_ganho || [] },
  ]

  const stageColors = ['#78716c', '#3b82f6', '#a855f7', '#f59e0b', '#22c55e']
  const total = stages.reduce((s, st) => s + st.items.reduce((a, i) => a + i.valor, 0), 0)

  return (
    <div className="home-pipeline-preview">
      <div className="home-pipeline-stages">
        {stages.map((stage, i) => {
          const valor = stage.items.reduce((a, item) => a + item.valor, 0)
          const pct = total > 0 ? (valor / total) * 100 : 0
          return (
            <div key={stage.key} className="home-pipeline-stage">
              <div className="home-pipeline-stage-bar-wrap">
                <div className="home-pipeline-stage-bar" style={{ height: `${Math.max(pct * 1.8, 8)}%`, background: stageColors[i] }} />
              </div>
              <div className="home-pipeline-stage-count" style={{ color: stageColors[i] }}>{stage.items.length}</div>
              <div className="home-pipeline-stage-label">{stage.label}</div>
              {valor > 0 && <div className="home-pipeline-stage-value">R$ {(valor / 1e6).toFixed(1).replace('.', ',')}Mi</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function CampanhasPreview() {
  const [campanhas, setCampanhas] = useState<{ nome: string; status: string; retornoEstimado: number; orcamento: number }[]>([])
  useEffect(() => {
    const raw = localStorage.getItem('insightpro_campanhas')
    if (raw) setCampanhas(JSON.parse(raw).slice(0, 4))
  }, [])
  if (!campanhas.length) return null
  const statusLabel: Record<string, { label: string; color: string }> = {
    planejada:    { label: 'Planejada',    color: '#3b82f6' },
    em_execucao:  { label: 'Em Execução',  color: '#f59e0b' },
    concluida:    { label: 'Concluída',    color: '#22c55e' },
    pausada:      { label: 'Pausada',      color: '#78716c' },
  }
  return (
    <div className="home-campanhas-list">
      {campanhas.map((c, i) => {
        const s = statusLabel[c.status] || { label: c.status, color: '#78716c' }
        const roi = c.orcamento > 0 ? ((c.retornoEstimado - c.orcamento) / c.orcamento * 100).toFixed(0) : '0'
        return (
          <div key={i} className="home-campanha-item">
            <div className="home-campanha-dot" style={{ background: s.color }} />
            <div className="home-campanha-body">
              <div className="home-campanha-nome">{c.nome}</div>
              <div className="home-campanha-meta">
                <span style={{ color: s.color }}>{s.label}</span>
                <span>ROI estimado: <strong>{roi}%</strong></span>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Main Page ──────────────────────────────────────────────────────────────────

export function HomePage() {
  usePageTitle('Início')
  const { rawData } = useData()
  const [activeCategory, setActiveCategory] = useState<'all' | 'principal' | 'analises' | 'estrategia' | 'relatorios'>('all')

  const totalClientes = rawData.length
  const totalFaturamento = useMemo(() => rawData.reduce((s, c) => s + c.faturamento_anual, 0), [rawData])
  const totalArea = useMemo(() => rawData.reduce((s, c) => s + c.area_hectares, 0), [rawData])
  const totalProspects = useMemo(() => rawData.filter(c => c.status === 'prospect').length, [rawData])

  const now = new Date()
  const dateLabel = now.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  const filteredTools = activeCategory === 'all' ? tools : tools.filter(t => t.category === activeCategory)

  const categories: { key: typeof activeCategory; label: string }[] = [
    { key: 'all',        label: 'Todas' },
    { key: 'principal',  label: 'Principal' },
    { key: 'analises',   label: 'Análises' },
    { key: 'estrategia', label: 'Estratégia' },
    { key: 'relatorios', label: 'Relatórios' },
  ]

  return (
    <AppLayout title="Início" subtitle="Central de ferramentas da plataforma">

      {/* ── HERO ─────────────────────────────────────────────────────── */}
      <div className="home-hero">
        <div className="home-hero-bg" />
        <div className="home-hero-content">
          <div className="home-hero-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
            InsightPro Agrícola
          </div>
          <h1 className="home-hero-title">Sua plataforma de<br /><span className="home-hero-title-accent">gestão inteligente</span></h1>
          <p className="home-hero-subtitle">13 ferramentas integradas para análise, estratégia e controle completo da sua carteira de clientes no agronegócio.</p>
          <div className="home-hero-date">{dateLabel}</div>
          {totalClientes > 0 && (
            <div className="home-hero-kpis">
              <AnimatedKpiChip label="Clientes" value={totalClientes} />
              <AnimatedKpiChip label="Faturamento" value={totalFaturamento} suffix="currency" />
              <AnimatedKpiChip label="Área Total" value={totalArea} suffix="ha" />
              <AnimatedKpiChip label="Prospects" value={totalProspects} />
            </div>
          )}
          {totalClientes === 0 && (
            <div className="home-hero-cta">
              <Link to="/upload" className="btn btn--primary btn--lg">Importar Dados CSV</Link>
              <Link to="/" className="btn btn--secondary btn--lg">Ver Dashboard</Link>
            </div>
          )}
        </div>
        <div className="home-hero-decoration">
          <div className="home-hero-circle home-hero-circle--1" />
          <div className="home-hero-circle home-hero-circle--2" />
          <div className="home-hero-circle home-hero-circle--3" />
        </div>
      </div>

      {/* ── ACESSO RÁPIDO ────────────────────────────────────────────── */}
      <div className="home-section">
        <h2 className="home-section-title" style={{ marginBottom: 'var(--space-4)' }}>Acesso Rápido</h2>
        <div className="home-quick-grid">
          {tools.map(tool => {
            const meta = categoryMeta[tool.category]
            return (
              <Link key={tool.path} to={tool.path} className="home-quick-item" style={{ '--qi-color': meta.color, '--qi-bg': meta.bg } as React.CSSProperties}>
                <div className="home-quick-icon" style={{ color: meta.color, background: meta.bg }}>{tool.icon}</div>
                <span className="home-quick-label">{tool.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ── FERRAMENTAS ──────────────────────────────────────────────── */}
      <div className="home-section">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">Ferramentas da Plataforma</h2>
            <p className="home-section-sub">Acesse qualquer módulo diretamente</p>
          </div>
          <div className="home-category-tabs">
            {categories.map(c => (
              <button
                key={c.key}
                className={`home-category-tab ${activeCategory === c.key ? 'active' : ''}`}
                onClick={() => setActiveCategory(c.key)}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <div className="home-tools-grid">
          {filteredTools.map(tool => <ToolCard key={tool.path} tool={tool} />)}
        </div>
      </div>

      {/* ── ANÁLISES ESTRATÉGICAS ────────────────────────────────────── */}
      <div className="home-section">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">Análises Estratégicas</h2>
            <p className="home-section-sub">Prévia das ferramentas de inteligência competitiva</p>
          </div>
          <Link to="/swot" className="home-section-link">Ver SWOT completo →</Link>
        </div>
        <div className="home-analytics-grid">
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 'var(--text-base)' }}>Matriz SWOT</h2>
              <Link to="/swot" className="btn btn--ghost btn--sm">Editar</Link>
            </div>
            <div className="card-body" style={{ padding: 'var(--space-4)' }}>
              <SwotPreview />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 'var(--text-base)' }}>Top Prioridades — GUT</h2>
              <Link to="/gut" className="btn btn--ghost btn--sm">Ver Matriz</Link>
            </div>
            <div className="card-body" style={{ padding: 'var(--space-4)' }}>
              <GutPreview />
            </div>
          </div>
        </div>
      </div>

      {/* ── METAS & PIPELINE ─────────────────────────────────────────── */}
      <div className="home-section">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">Metas & Pipeline</h2>
            <p className="home-section-sub">Acompanhamento em tempo real dos indicadores estratégicos</p>
          </div>
        </div>
        <div className="home-mp-grid">
          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 'var(--text-base)' }}>Progresso de Metas</h2>
              <Link to="/metas" className="btn btn--ghost btn--sm">Ver todas</Link>
            </div>
            <div className="card-body" style={{ padding: 'var(--space-4)' }}>
              <MetasPreview />
            </div>
          </div>

          <div className="card" style={{ marginBottom: 0 }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: 'var(--text-base)' }}>Pipeline de Vendas</h2>
              <Link to="/pipeline" className="btn btn--ghost btn--sm">Ver Pipeline</Link>
            </div>
            <div className="card-body" style={{ padding: 'var(--space-4)' }}>
              <PipelinePreview />
            </div>
          </div>
        </div>
      </div>

      {/* ── CAMPANHAS ────────────────────────────────────────────────── */}
      <div className="home-section">
        <div className="home-section-header">
          <div>
            <h2 className="home-section-title">Campanhas Ativas</h2>
            <p className="home-section-sub">Panorama das ações comerciais em andamento</p>
          </div>
          <Link to="/campanhas" className="home-section-link">Gerenciar campanhas →</Link>
        </div>
        <div className="card" style={{ marginBottom: 0 }}>
          <div className="card-body" style={{ padding: 'var(--space-4)' }}>
            <CampanhasPreview />
          </div>
        </div>
      </div>


    </AppLayout>
  )
}
