import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { DataContextType, Cliente } from '@/types'
import { localDB, DB_KEYS } from '@/lib/localDB'
import Papa from 'papaparse'

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: ReactNode }) {
  const [rawData, setRawData] = useState<Cliente[]>(() => {
    return localDB.list<Cliente>(DB_KEYS.data)
  })

  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({})

  useEffect(() => {
    localDB.set(DB_KEYS.data, rawData)
  }, [rawData])

  const addCliente = useCallback((cliente: Cliente) => {
    const updated = localDB.add(DB_KEYS.data, cliente)
    setRawData(updated)
  }, [])

  const updateCliente = useCallback((id: string, updates: Partial<Cliente>) => {
    const updated = localDB.update<Cliente>(DB_KEYS.data, id, updates)
    setRawData(updated)
  }, [])

  const removeCliente = useCallback((id: string) => {
    const updated = localDB.delete<Cliente>(DB_KEYS.data, id)
    setRawData(updated)
  }, [])

  const filteredData = rawData.filter(cliente => {
    return Object.entries(activeFilters).every(([key, value]) => {
      if (!value) return true
      const fieldValue = cliente[key as keyof Cliente]
      if (typeof fieldValue === 'string') {
        return fieldValue.toLowerCase().includes(value.toLowerCase())
      }
      if (typeof fieldValue === 'number') {
        return fieldValue >= Number(value)
      }
      return true
    })
  })

  const applyFilters = (filters: Record<string, string>) => {
    setActiveFilters(filters)
  }

  const clearFilters = () => {
    setActiveFilters({})
  }

  const importCSV = (csvText: string, _mapping?: Partial<import('@/types').UploadColumnMapping>) => {
    const results = Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: h => h.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''),
    })

    const clients: Cliente[] = results.data.map((row, index) => {
      const findValue = (...keys: string[]) => {
        for (const key of keys) {
          const normalizedKey = key.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          if (row[normalizedKey]) return row[normalizedKey]
        }
        return ''
      }

      return {
        id: `client_${Date.now()}_${index}`,
        nome: findValue('nome', 'cliente', 'razao_social', 'name') || 'N/A',
        cpf_cnpj: findValue('cpf_cnpj', 'cpf', 'cnpj', 'documento'),
        telefone: findValue('telefone', 'tel', 'phone', 'celular'),
        email: findValue('email', 'e-mail', 'mail'),
        cidade: findValue('cidade', 'city', 'municipio'),
        estado: findValue('estado', 'uf', 'state'),
        cultura_principal: findValue('cultura_principal', 'cultura', 'crop'),
        area_hectares: parseFloat(findValue('area_hectares', 'area', 'hectares')) || 0,
        faturamento_anual: parseFloat(findValue('faturamento_anual', 'faturamento', 'revenue')) || 0,
        potencial_compra: parseFloat(findValue('potencial_compra', 'potencial', 'potential')) || 0,
        ultima_compra: findValue('ultima_compra', 'ultima_compra', 'last_purchase'),
        status: (findValue('status') as 'ativo' | 'inativo' | 'prospect') || 'ativo',
        produtos: {},
      }
    })

    const current = localDB.list<Cliente>(DB_KEYS.data)
    const updated = [...current, ...clients]
    localDB.set(DB_KEYS.data, updated)
    setRawData(updated)
  }

  const exportCSV = () => {
    const csv = Papa.unparse(filteredData)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `insightpro_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const exportPDF = async (elementId: string) => {
    const element = document.getElementById(elementId)
    if (!element) return
    const html2canvas = (await import('html2canvas')).default
    const jsPDF = (await import('jspdf')).default
    const canvas = await html2canvas(element, { scale: 2 })
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
    pdf.save(`insightpro_report_${new Date().toISOString().split('T')[0]}.pdf`)
  }

  return (
    <DataContext.Provider value={{
      rawData,
      setRawData,
      addCliente,
      updateCliente,
      removeCliente,
      filteredData,
      activeFilters,
      applyFilters,
      clearFilters,
      importCSV,
      exportCSV,
      exportPDF,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}
