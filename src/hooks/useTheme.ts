import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

export function useTheme() {
  const theme = (localStorage.getItem('theme') || 'light') as 'light' | 'dark'

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }

  return { theme, toggleTheme }
}

export function usePageTitle(title: string) {
  useEffect(() => {
    document.title = `${title} - InsightPro Agricola`
  }, [title])
}
