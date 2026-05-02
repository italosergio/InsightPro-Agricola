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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)

  const handleSort = (field: keyof Cliente) => {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  const SortIcon = ({ field }: { field: keyof Cliente }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? ' ▲' : ' ▼'
  }

  return (
    <AppLayout title="Clientes" subtitle={`${sorted.length} registros encontrados`}>
      <div className="card">
        <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h2>Lista de Clientes</h2>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nome, cidade ou estado..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              style={{ minWidth: 280 }}
            />
            <button className="btn btn--secondary" onClick={exportCSV}>
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
                      <th onClick={() => handleSort('nome')} style={{ cursor: 'pointer' }}>Nome<SortIcon field="nome" /></th>
                      <th onClick={() => handleSort('cidade')} style={{ cursor: 'pointer' }}>Cidade<SortIcon field="cidade" /></th>
                      <th onClick={() => handleSort('estado')} style={{ cursor: 'pointer' }}>UF<SortIcon field="estado" /></th>
                      <th onClick={() => handleSort('cultura_principal')} style={{ cursor: 'pointer' }}>Cultura<SortIcon field="cultura_principal" /></th>
                      <th onClick={() => handleSort('area_hectares')} style={{ cursor: 'pointer' }}>Area (ha)<SortIcon field="area_hectares" /></th>
                      <th onClick={() => handleSort('faturamento_anual')} style={{ cursor: 'pointer' }}>Faturamento<SortIcon field="faturamento_anual" /></th>
                      <th onClick={() => handleSort('potencial_compra')} style={{ cursor: 'pointer' }}>Potencial<SortIcon field="potencial_compra" /></th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map(cliente => (
                      <tr key={cliente.id}>
                        <td>{cliente.nome}</td>
                        <td>{cliente.cidade}</td>
                        <td>{cliente.estado}</td>
                        <td>{cliente.cultura_principal}</td>
                        <td>{cliente.area_hectares.toLocaleString('pt-BR')}</td>
                        <td>{formatCurrency(cliente.faturamento_anual)}</td>
                        <td>{formatCurrency(cliente.potencial_compra)}</td>
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
                <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)', marginTop: 'var(--space-6)' }}>
                  <button
                    className="btn btn--secondary btn--sm"
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 2)
                    .map((p, idx, arr) => (
                      <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        {idx > 0 && arr[idx - 1] !== p - 1 && <span>...</span>}
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
                    Proximo
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
