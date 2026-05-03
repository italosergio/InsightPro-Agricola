import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { ThemeProvider } from '@/store/ThemeContext'
import { DataProvider } from '@/store/DataContext'
import { PageProvider, usePage } from '@/store/PageContext'
import { AuthRoute, PublicRoute } from '@/components/ProtectedRoute'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ClientesPage } from '@/pages/ClientesPage'
import { AnaliseABCPage } from '@/pages/AnaliseABCPage'
import { PenetracaoPage } from '@/pages/PenetracaoPage'
import { CulturaPage } from '@/pages/CulturaPage'
import { OportunidadesPage } from '@/pages/OportunidadesPage'
import { TerritorialPage } from '@/pages/TerritorialPage'
import { GapsPage } from '@/pages/GapsPage'
import { FidelizacaoPage } from '@/pages/FidelizacaoPage'
import { SWOTPage } from '@/pages/SWOTPage'
import { GUTPage } from '@/pages/GUTPage'
import { PESTPage } from '@/pages/PESTPage'
import { MetasPage } from '@/pages/MetasPage'
import { CampanhasPage } from '@/pages/CampanhasPage'
import { PipelinePage } from '@/pages/PipelinePage'
import { RelatoriosPage } from '@/pages/RelatoriosPage'
import { ExportarPage } from '@/pages/ExportarPage'
import { ProdutosPage } from '@/pages/ProdutosPage'
import { ClientesCadastroPage } from '@/pages/ClientesCadastroPage'
import { HomePage } from '@/pages/HomePage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    const main = document.querySelector('.main-content')
    if (main) main.scrollTop = 0
  }, [pathname])
  return null
}

const titleMap: Record<string, { title: string; subtitle: string }> = {
  '/': { title: 'Dashboard', subtitle: 'Visão geral da carteira de clientes' },
  '/inicio': { title: 'Início', subtitle: 'Central de ferramentas da plataforma' },
  '/clientes': { title: 'Clientes', subtitle: '' },
  '/analise-abc': { title: 'Analise ABC', subtitle: 'Classificacao de clientes por faturamento' },
  '/penetracao': { title: 'Penetracao', subtitle: 'Análise de penetração de produtos' },
  '/cultura': { title: 'Cultura', subtitle: 'Análise por cultura agrícola' },
  '/oportunidades': { title: 'Oportunidades', subtitle: 'Matriz de oportunidades por penetração e tamanho do cliente' },
  '/territorial': { title: 'Territorial', subtitle: 'Análise territorial por região' },
  '/gaps': { title: 'Gaps', subtitle: 'Oportunidades de crescimento por cliente' },
  '/fidelizacao': { title: 'Fidelizacao', subtitle: 'Análise de volume e fidelidade de produtos' },
  '/swot': { title: 'Analise SWOT', subtitle: '' },
  '/gut': { title: 'Matriz GUT', subtitle: '' },
  '/pest': { title: 'Analise PEST', subtitle: '' },
  '/metas': { title: 'Metas & KPIs', subtitle: '' },
  '/campanhas': { title: 'Campanhas', subtitle: 'Gestão de campanhas de marketing e vendas' },
  '/pipeline': { title: 'Pipeline', subtitle: '' },
  '/relatorios': { title: 'Relatorios', subtitle: '' },
  '/exportar': { title: 'Exportar', subtitle: '' },
  '/produtos': { title: 'Produtos', subtitle: 'Catálogo de produtos agrícolas' },
  '/cadastro-clientes': { title: 'Cadastro de Clientes', subtitle: 'Gerencie os clientes da carteira' },
}

function PageTitleSync() {
  const { pathname } = useLocation()
  const { setPageInfo } = usePage()
  useEffect(() => {
    const info = titleMap[pathname]
    if (info) {
      setPageInfo(info.title, info.subtitle)
      document.title = `${info.title} - InsightPro Agricola`
    }
  }, [pathname, setPageInfo])
  return null
}

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <PageProvider>
              <PageTitleSync />
              <ScrollToTop />
              <Routes>
                <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                <Route element={<AuthRoute><DashboardLayout /></AuthRoute>}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/inicio" element={<HomePage />} />
                  <Route path="/clientes" element={<ClientesPage />} />
                  <Route path="/analise-abc" element={<AnaliseABCPage />} />
                  <Route path="/penetracao" element={<PenetracaoPage />} />
                  <Route path="/cultura" element={<CulturaPage />} />
                  <Route path="/oportunidades" element={<OportunidadesPage />} />
                  <Route path="/territorial" element={<TerritorialPage />} />
                  <Route path="/gaps" element={<GapsPage />} />
                  <Route path="/fidelizacao" element={<FidelizacaoPage />} />
                  <Route path="/produtos" element={<ProdutosPage />} />
                  <Route path="/cadastro-clientes" element={<ClientesCadastroPage />} />
                  <Route path="/swot" element={<SWOTPage />} />
                  <Route path="/gut" element={<GUTPage />} />
                  <Route path="/pest" element={<PESTPage />} />
                  <Route path="/metas" element={<MetasPage />} />
                  <Route path="/campanhas" element={<CampanhasPage />} />
                  <Route path="/pipeline" element={<PipelinePage />} />
                  <Route path="/relatorios" element={<RelatoriosPage />} />
                  <Route path="/exportar" element={<ExportarPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </PageProvider>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
