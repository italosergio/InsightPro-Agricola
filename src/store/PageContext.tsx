import { createContext, useContext, useState, type ReactNode } from 'react'

interface PageContextType {
  title: string
  subtitle: string
  setPageInfo: (title: string, subtitle: string) => void
}

const PageContext = createContext<PageContextType>({
  title: 'Dashboard',
  subtitle: '',
  setPageInfo: () => {},
})

export function PageProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState('Dashboard')
  const [subtitle, setSubtitle] = useState('')

  const setPageInfo = (t: string, s: string) => {
    setTitle(t)
    setSubtitle(s)
  }

  return (
    <PageContext.Provider value={{ title, subtitle, setPageInfo }}>
      {children}
    </PageContext.Provider>
  )
}

export function usePage() {
  return useContext(PageContext)
}
