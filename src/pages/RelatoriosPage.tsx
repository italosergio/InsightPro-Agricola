import { useState } from 'react'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'

interface Relatorio {
  id: string
  titulo: string
  tipo: string
  descricao: string
  icone: string
  geradoEm: string | null
}

const relatoriosList: Relatorio[] = [
  { id: 'r1', titulo: 'Carteira Completa de Clientes', tipo: 'analitico', descricao: 'Lista completa com todos os clientes, contatos, culturas e valores', icone: 'users', geradoEm: null },
  { id: 'r2', titulo: 'Análise ABC de Faturamento', tipo: 'analitico', descricao: 'Classificação ABC dos clientes com gráficos de faturamento acumulado', icone: 'bar-chart', geradoEm: null },
  { id: 'r3', titulo: 'Penetração por Estado e Cultura', tipo: 'analitico', descricao: 'Análise geográfica da carteira com distribuição por estado e cultura', icone: 'map', geradoEm: null },
  { id: 'r4', titulo: 'Relatório de Prospect', tipo: 'comercial', descricao: 'Prospects ativos com potencial de compra, contatos e observações', icone: 'target', geradoEm: null },
  { id: 'r5', titulo: 'Metas e Indicadores', tipo: 'gerencial', descricao: 'Acompanhamento de metas, KPIs e progresso das ações estratégicas', icone: 'trending-up', geradoEm: null },
  { id: 'r6', titulo: 'Pipeline de Vendas', tipo: 'comercial', descricao: 'Oportunidades por estágio do pipeline com valores e probabilidades', icone: 'git-branch', geradoEm: null },
  { id: 'r7', titulo: 'Matriz SWOT', tipo: 'estrategico', descricao: 'Forças, fraquezas, oportunidades e ameaças da operação', icone: 'grid', geradoEm: null },
  { id: 'r8', titulo: 'Matriz GUT - Priorização', tipo: 'estrategico', descricao: 'Problemas priorizados por gravidade, urgência e tendência', icone: 'star', geradoEm: null },
  { id: 'r9', titulo: 'Análise PEST', tipo: 'estrategico', descricao: 'Fatores políticos, econômicos, sociais e tecnológicos do ambiente externo', icone: 'globe', geradoEm: null },
  { id: 'r10', titulo: 'Resumo Executivo', tipo: 'gerencial', descricao: 'Visão consolidada de KPIs, gráficos e principais insights da carteira', icone: 'file-text', geradoEm: null },
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

export function RelatoriosPage() {
  usePageTitle('Relatórios')
  const { exportPDF } = useData()
  const [relatorioGerando, setRelatorioGerando] = useState<string | null>(null)
  const [tipoFilter, setTipoFilter] = useState('todos')

  const [relatoriosState, setRelatoriosState] = useState<Relatorio[]>(() => {
    const saved = localStorage.getItem('insightpro_relatorios')
    return saved ? JSON.parse(saved) : relatoriosList
  })

  const handleGerar = (id: string) => {
    setRelatorioGerando(id)
    const updated = relatoriosState.map(r =>
      r.id === id ? { ...r, geradoEm: new Date().toISOString() } : r
    )
    setRelatoriosState(updated)
    localStorage.setItem('insightpro_relatorios', JSON.stringify(updated))
    setTimeout(() => setRelatorioGerando(null), 1500)
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
            <p className="page-hero-subtitle">Gere relatórios personalizados com os dados da sua carteira</p>
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
            {ultimaGeracao
              ? ultimaGeracao.toLocaleString('pt-BR')
              : '---'}
          </div>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
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
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--color-primary-subtle)',
                    color: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
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
                <div style={{ marginTop: 'auto' }}>
                  <button
                    className="btn btn--primary btn--full-width"
                    onClick={() => handleGerar(rel.id)}
                    disabled={relatorioGerando === rel.id}
                  >
                    {relatorioGerando === rel.id ? (
                      <>
                        <span className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.6s linear infinite' }} />
                        Gerando...
                      </>
                    ) : rel.geradoEm ? 'Gerar Novamente' : 'Gerar Relatório'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Exportação Rápida</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <button className="btn btn--secondary btn--lg" onClick={() => exportPDF('root')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              Exportar Página como PDF
            </button>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', alignSelf: 'center' }}>
              Exporte esta página ou vá em "Exportar" no menu para baixar CSV
            </div>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </>
  )
}
