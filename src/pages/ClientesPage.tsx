import { useState } from 'react'
import { AppLayout } from '@/components/layout/AppLayout'
import { useData } from '@/store/DataContext'
import { usePageTitle } from '@/hooks/useTheme'
import type { Cliente } from '@/types'

export function ClientesPage() {
  const { filteredData, rawData, exportCSV } = useData()
  usePageTitle('Clientes')
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<keyof Cliente>('nome')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(1)
  const perPage = 15

  const data = filteredData.length > 0 ? filteredData : rawData

  const filtered = data.filter(c =>
    c.nome.toLowerCase().includes(search.toLowerCase()) ||
    c.cidade.toLowerCase().includes(search.toLowerCase()) ||
    c.estado.toLowerCase().includes(search.toLowerCase())
  )

  const ativos = data.filter(c => c.status === 'ativo').length
  const prospects = data.filter(c => c.status === 'prospect').length
  const totalArea = data.reduce((sum, c) => sum + c.area_hectares, 0)

  const sorted = [...filtered].sort((a, b) => {
    const aVal = a[sortField]
    const bVal = b[sortField]
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDir === 'asc' ? aVal - bVal : bVal - aVal
    }
    return 0
  })

  const totalPages = Math.ceil(sorted.length / perPage)
  const paginated = sorted.slice((page - 1) * perPage, page * perPage)

  const fmt = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value)

  const handleSort = (field: keyof Cliente) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }: { field: keyof Cliente }) => {
    if (sortField !== field) return <> ↕</>
    return sortDir === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <AppLayout title="Clientes" subtitle={`${sorted.length} registros encontrados`}>
      <div className="page-hero">
        <div className="page-hero-bg page-hero-bg--green" />
        <div className="page-hero-deco" />
        <div className="page-hero-content">
          <div className="page-hero-text">
            <div className="page-hero-eyebrow">Carteira</div>
            <h1 className="page-hero-title">Clientes</h1>
            <p className="page-hero-subtitle">Gerencie e visualize todos os clientes da sua carteira agrícola</p>
          </div>
          <div className="page-hero-kpis">
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{data.length}</span>
              <span className="page-hero-kpi-label">Total</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{ativos}</span>
              <span className="page-hero-kpi-label">Ativos</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{prospects}</span>
              <span className="page-hero-kpi-label">Prospects</span>
            </div>
            <div className="page-hero-kpi">
              <span className="page-hero-kpi-value">{totalArea.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</span>
              <span className="page-hero-kpi-label">Hectares</span>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h2>Lista de Clientes</h2>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <div className="search-bar-container">
              <input
                type="text"
                className="form-control"
                placeholder="Buscar por nome, cidade ou estado..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                style={{ minWidth: 280 }}
              />
            </div>
            <button className="btn btn--secondary" onClick={exportCSV} style={{ flexShrink: 0 }}>
              Exportar CSV
            </button>
          </div>
        </div>
        <div className="card-body">
          {paginated.length === 0 ? (
            <div className="empty-state">
              <h3>Nenhum cliente encontrado</h3>
              <p>Importe dados via CSV para visualizar seus clientes aqui.</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>Nome<SortIcon field="nome" /></th>
                      <th onClick={() => handleSort('cidade')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>Cidade<SortIcon field="cidade" /></th>
                      <th onClick={() => handleSort('estado')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>UF<SortIcon field="estado" /></th>
                      <th onClick={() => handleSort('cultura_principal')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>Cultura<SortIcon field="cultura_principal" /></th>
                      <th onClick={() => handleSort('area_hectares')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>Area (ha)<SortIcon field="area_hectares" /></th>
                      <th onClick={() => handleSort('faturamento_anual')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>Faturamento<SortIcon field="faturamento_anual" /></th>
                      <th onClick={() => handleSort('potencial_compra')} style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}>Potencial<SortIcon field="potencial_compra" /></th>
                      <th style={{ whiteSpace: 'nowrap' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(cliente => (
                      <tr key={cliente.id}>
                        <td>{cliente.nome}</td>
                        <td>{cliente.cidade}</td>
                        <td>{cliente.estado}</td>
                        <td>{cliente.cultura_principal}</td>
                        <td>{cliente.area_hectares.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}</td>
                        <td>{fmt(cliente.faturamento_anual)}</td>
                        <td>{fmt(cliente.potencial_compra)}</td>
                        <td>
                          <span className={`badge badge--${cliente.status === 'ativo' ? 'success' : cliente.status === 'prospect' ? 'info' : 'neutral'}`}>
                            {cliente.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    className="btn btn--secondary btn--sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    ← Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .map((p, idx, arr) => (
                      <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span>…</span>}
                        <button
                          className={`btn btn--sm ${p === page ? 'btn--primary' : 'btn--secondary'}`}
                          onClick={() => setPage(p)}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                  <button
                    className="btn btn--secondary btn--sm"
                    disabled={page === totalPages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Próximo →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AppLayout>
  )
}
