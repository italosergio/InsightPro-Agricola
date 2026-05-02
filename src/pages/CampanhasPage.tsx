import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { usePageTitle } from '@/hooks/useTheme'

interface Campanha {
  id: string
  nome: string
  tipo: string
  publico: string
  orcamento: number
  retornoEstimado: number
  inicio: string
  fim: string
  status: string
  canais: string[]
}

const canalLabels: Record<string, string> = {
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  redes_sociais: 'Redes Sociais',
  visita_tecnica: 'Visita Tecnica',
  presencial: 'Presencial',
  telefone: 'Telefone',
}

const tipoLabels: Record<string, string> = {
  comercial: 'Comercial',
  evento: 'Evento',
  lancamento: 'Lancamento',
  retencao: 'Retencao',
  promocao: 'Promocao',
  feira: 'Feira',
  fidelizacao: 'Fidelizacao',
  educacional: 'Educacional',
}

const statusLabels: Record<string, string> = {
  planejada: 'Planejada',
  em_execucao: 'Em Execucao',
  concluida: 'Concluida',
  cancelada: 'Cancelada',
}

export function CampanhasPage() {
  usePageTitle('Campanhas')
  const [campanhas, setCampanhas] = useState<Campanha[]>(() => {
    const saved = localStorage.getItem('insightpro_campanhas')
    return saved ? JSON.parse(saved) : []
  })

  const saveCampanhas = (data: Campanha[]) => {
    setCampanhas(data)
    localStorage.setItem('insightpro_campanhas', JSON.stringify(data))
  }

  const removeCampanha = (id: string) => saveCampanhas(campanhas.filter(c => c.id !== id))

  const formatCurrency = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v)

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'em_execucao': return 'badge--info'
      case 'concluida': return 'badge--success'
      case 'cancelada': return 'badge--error'
      default: return 'badge--neutral'
    }
  }

  const orcamentoTotal = campanhas.reduce((sum, c) => sum + c.orcamento, 0)
  const retornoTotal = campanhas.reduce((sum, c) => sum + c.retornoEstimado, 0)
  const ativas = campanhas.filter(c => c.status === 'em_execucao').length
  const planejadas = campanhas.filter(c => c.status === 'planejada').length

  const [filter, setFilter] = useState('todas')

  const filtered = filter === 'todas' ? campanhas : campanhas.filter(c => c.status === filter)

  return (
    <AppLayout title="Campanhas" subtitle="Gestao de campanhas de marketing e vendas">
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">Total de Campanhas</div>
          <div className="kpi-value">{campanhas.length}</div>
          <div className="kpi-trend positive">{ativas} em execucao</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Investimento Total</div>
          <div className="kpi-value">{formatCurrency(orcamentoTotal)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">Retorno Estimado</div>
          <div className="kpi-value" style={{ color: 'var(--color-success)' }}>{formatCurrency(retornoTotal)}</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label">ROI Medio</div>
          <div className="kpi-value" style={{ color: 'var(--color-info)' }}>
            {campanhas.length > 0 ? Math.round((retornoTotal / orcamentoTotal) * 100) / 100 : 0}x
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <h2>Campanhas</h2>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            {['todas', 'planejada', 'em_execucao', 'concluida'].map(f => (
              <button key={f} className={`btn btn--sm ${filter === f ? 'btn--primary' : 'btn--secondary'}`} onClick={() => setFilter(f)}>
                {f === 'todas' ? 'Todas' : statusLabels[f]}
              </button>
            ))}
          </div>
        </div>
        <div className="card-body">
          {filtered.length === 0 ? (
            <div className="empty-state"><h3>Nenhuma campanha encontrada</h3><p>{filter === 'todas' ? 'Nenhuma campanha cadastrada.' : `Nenhuma campanha com status "${statusLabels[filter]}".`}</p></div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {filtered.map(c => (
                <div key={c.id} className="card" style={{ border: '1px solid var(--border-primary)', boxShadow: 'none' }}>
                  <div style={{ padding: 'var(--space-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
                      <div>
                        <h3 style={{ margin: 0 }}>{c.nome}</h3>
                        <p style={{ color: 'var(--text-secondary)', margin: 'var(--space-1) 0 0' }}>{tipoLabels[c.tipo] || c.tipo} | Publico: {c.publico}</p>
                      </div>
                      <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center' }}>
                        <span className={`badge ${getStatusClass(c.status)}`}>{statusLabels[c.status] || c.status}</span>
                        <button className="btn btn--ghost btn--sm" onClick={() => removeCampanha(c.id)} aria-label="Remover">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        </button>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 'var(--space-3)' }}>
                      <div><span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Periodo</span><br /><strong>{new Date(c.inicio).toLocaleDateString('pt-BR')} - {new Date(c.fim).toLocaleDateString('pt-BR')}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Investimento</span><br /><strong>{formatCurrency(c.orcamento)}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>Retorno Est.</span><br /><strong style={{ color: 'var(--color-success)' }}>{formatCurrency(c.retornoEstimado)}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>ROI</span><br /><strong style={{ color: 'var(--color-info)' }}>{Math.round((c.retornoEstimado / c.orcamento) * 100) / 100}x</strong></div>
                    </div>
                    <div style={{ marginTop: 'var(--space-3)', display: 'flex', gap: 'var(--space-1)', flexWrap: 'wrap' }}>
                      {c.canais.map(canal => (
                        <span key={canal} className="badge badge--neutral" style={{ fontSize: 'var(--text-xs)' }}>{canalLabels[canal] || canal}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
