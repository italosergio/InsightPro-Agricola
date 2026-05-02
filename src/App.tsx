import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { ThemeProvider } from '@/store/ThemeContext'
import { DataProvider } from '@/store/DataContext'
import { AuthRoute, PublicRoute } from '@/components/ProtectedRoute'
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
import { HomePage } from '@/pages/HomePage'
import { ScrollToTop } from '@/components/ScrollToTop'

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

              <Route path="/" element={<AuthRoute><DashboardPage /></AuthRoute>} />
              <Route path="/inicio" element={<AuthRoute><HomePage /></AuthRoute>} />
              <Route path="/clientes" element={<AuthRoute><ClientesPage /></AuthRoute>} />
              <Route path="/analise-abc" element={<AuthRoute><AnaliseABCPage /></AuthRoute>} />
              <Route path="/penetracao" element={<AuthRoute><PenetracaoPage /></AuthRoute>} />
              <Route path="/cultura" element={<AuthRoute><CulturaPage /></AuthRoute>} />
              <Route path="/oportunidades" element={<AuthRoute><OportunidadesPage /></AuthRoute>} />
              <Route path="/territorial" element={<AuthRoute><TerritorialPage /></AuthRoute>} />
              <Route path="/gaps" element={<AuthRoute><GapsPage /></AuthRoute>} />
              <Route path="/fidelizacao" element={<AuthRoute><FidelizacaoPage /></AuthRoute>} />
              <Route path="/produtos" element={<AuthRoute><ProdutosPage /></AuthRoute>} />
              <Route path="/swot" element={<AuthRoute><SWOTPage /></AuthRoute>} />
              <Route path="/gut" element={<AuthRoute><GUTPage /></AuthRoute>} />
              <Route path="/pest" element={<AuthRoute><PESTPage /></AuthRoute>} />
              <Route path="/metas" element={<AuthRoute><MetasPage /></AuthRoute>} />
              <Route path="/campanhas" element={<AuthRoute><CampanhasPage /></AuthRoute>} />
              <Route path="/pipeline" element={<AuthRoute><PipelinePage /></AuthRoute>} />
              <Route path="/relatorios" element={<AuthRoute><RelatoriosPage /></AuthRoute>} />
              <Route path="/exportar" element={<AuthRoute><ExportarPage /></AuthRoute>} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
