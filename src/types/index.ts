export interface Cliente {
  id: string
  nome: string
  cpf_cnpj: string
  telefone: string
  email: string
  cidade: string
  estado: string
  cultura_principal: string
  area_hectares: number
  faturamento_anual: number
  potencial_compra: number
  produtos: Record<string, ProdutoInfo>
  ultima_compra: string
  status: 'ativo' | 'inativo' | 'prospect'
}

export interface ProdutoInfo {
  nome: string
  quantidade: number
  valor_total: number
}

export interface UploadColumnMapping {
  nome: string
  cpf_cnpj: string
  telefone: string
  email: string
  cidade: string
  estado: string
  cultura_principal: string
  area_hectares: string
  faturamento_anual: string
  potencial_compra: string
  ultima_compra: string
  produtos: string[]
}

export type AnalysisType = 'abc' | 'swot' | 'gut' | 'pest' | 'penetracao'

export interface ThemeContextType {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export interface AuthContextType {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

export interface DataContextType {
  rawData: Cliente[]
  setRawData: (data: Cliente[]) => void
  addCliente: (cliente: Cliente) => void
  updateCliente: (id: string, updates: Partial<Cliente>) => void
  removeCliente: (id: string) => void
  filteredData: Cliente[]
  activeFilters: Record<string, string>
  applyFilters: (filters: Record<string, string>) => void
  clearFilters: () => void
  importCSV: (csvText: string, mapping?: Partial<UploadColumnMapping>) => void
  exportCSV: () => void
  exportPDF: (elementId: string) => void
}
