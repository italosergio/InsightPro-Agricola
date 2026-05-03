import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
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

export function RelatoriosPage() {
  usePageTitle('Relatorios')
  const { exportPDF } = useData()
  const [relatorioGerando, setRelatorioGerando] = useState<string | null>(null)

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(v)

  const relatorios: Relatorio[] = [
    { id: 'r1', titulo: 'Carteira Completa de Clientes', tipo: 'analitico', descricao: 'Lista completa com todos os clientes, contatos, culturas e valores', icone: 'users', geradoEm: null },
    { id: 'r2', titulo: 'Analise ABC de Faturamento', tipo: 'analitico', descricao: 'Classificacao ABC dos clientes com graficos de faturamento acumulado', icone: 'bar-chart', geradoEm: null },
    { id: 'r3', titulo: 'Penetracao por Estado e Cultura', tipo: 'analitico', descricao: 'Analise geografica da carteira com distribuicao por estado e cultura', icone: 'map', geradoEm: null },
    { id: 'r4', titulo: 'Relatorio de Prospect', tipo: 'comercial', descricao: 'Prospects ativos com potencial de compra, contatos e observacoes', icone: 'target', geradoEm: null },
    { id: 'r5', titulo: 'Metas e Indicadores', tipo: 'gerencial', descricao: 'Acompanhamento de metas, KPIs e progresso das acoes estrategicas', icone: 'trending-up', geradoEm: null },
    { id: 'r6', titulo: 'Pipeline de Vendas', tipo: 'comercial', descricao: 'Oportunidades por estagio do pipeline com valores e probabilidades', icone: 'git-branch', geradoEm: null },
    { id: 'r7', titulo: 'Matriz SWOT', tipo: 'estrategico', descricao: 'Forcas, fraquezas, oportunidades e ameacas da operacao', icone: 'grid', geradoEm: null },
    { id: 'r8', titulo: 'Matriz GUT - Priorizacao', tipo: 'estrategico', descricao: 'Problemas priorizados por gravidade, urgencia e tendencia', icone: 'star', geradoEm: null },
    { id: 'r9', titulo: 'Analise PEST', tipo: 'estrategico', descricao: 'Fatores politicos, economicos, sociais e tecnologicos do ambiente externo', icone: 'globe', geradoEm: null },
    { id: 'r10', titulo: 'Resumo Executivo', tipo: 'gerencial', descricao: 'Visao consolidada de KPIs, graficos e principais insights da carteira', icone: 'file-text', geradoEm: null },
  ]

  const [relatoriosState, setRelatoriosState] = useState<Relatorio[]>(() => {
    const saved = localStorage.getItem('insightpro_relatorios')
    return saved ? JSON.parse(saved) : relatorios
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

  const tipoLabels: Record<string, string> = {
    analitico: 'Analitico',
    comercial: 'Comercial',
    gerencial: 'Gerencial',
    estrategico: 'Estrategico',
  }

  return (
    <AppLayout title="Relatorios" subtitle="Geracao de relatorios personalizados">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total de Relatorios</div>
          <div className="kpi-value">{relatoriosState.length}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Relatorios Gerados</div>
          <div className="kpi-value" style={{ color: 'var(--color-success)' }}>{totalGerados}</div>
          <div className="kpi-trend positive">{totalGerados > 0 ? `${Math.round((totalGerados / relatoriosState.length) * 100)}% do total` : 'Nenhum'}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Pendentes</div>
          <div className="kpi-value" style={{ color: 'var(--color-warning)' }}>{relatoriosState.length - totalGerados}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Ultima Geracao</div>
          <div className="kpi-value" style={{ fontSize: 'var(--text-sm)' }}>
            {relatoriosState.some(r => r.geradoEm)
              ? new Date(Math.max(...relatoriosState.filter(r => r.geradoEm).map(r => new Date(r.geradoEm!).getTime()))).toLocaleString('pt-BR')
              : '---'}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Relatorios Disponiveis</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
            {relatoriosState.map(rel => (
              <div key={rel.id} style={{ border: '1px solid var(--border-primary)', borderRadius: 'var(--radius-md)', padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className={`badge ${rel.tipo === 'gerencial' ? 'badge--info' : rel.tipo === 'comercial' ? 'badge--success' : rel.tipo === 'estrategico' ? 'badge--warning' : 'badge--neutral'}`}>
                    {tipoLabels[rel.tipo] || rel.tipo}
                  </span>
                  {rel.geradoEm && <span className="badge badge--success">Gerado</span>}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 'var(--text-base)' }}>{rel.titulo}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)', margin: 'var(--space-1) 0 0' }}>{rel.descricao}</p>
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
                    {relatorioGerando === rel.id ? 'Gerando...' : rel.geradoEm ? 'Gerar Novamente' : 'Gerar Relatorio'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2>Exportacao Rapida</h2>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
            <button className="btn btn--secondary btn--lg" onClick={() => exportPDF('root')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}>
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
              </svg>
              Exportar Pagina como PDF
            </button>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-tertiary)', alignSelf: 'center' }}>
              Exporte esta pagina ou va em "Exportar" no menu para baixar CSV
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
