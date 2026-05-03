import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from '@/store/AuthContext'
import { ThemeProvider } from '@/store/ThemeContext'
import { DataProvider } from '@/store/DataContext'
import { AuthRoute, PublicRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { UploadPage } from '@/pages/UploadPage'
import { ClientesPage } from '@/pages/ClientesPage'
import { AnaliseABCPage } from '@/pages/AnaliseABCPage'
import { PenetracaoPage } from '@/pages/PenetracaoPage'
import { SWOTPage } from '@/pages/SWOTPage'
import { GUTPage } from '@/pages/GUTPage'
import { PESTPage } from '@/pages/PESTPage'
import { MetasPage } from '@/pages/MetasPage'
import { CampanhasPage } from '@/pages/CampanhasPage'
import { PipelinePage } from '@/pages/PipelinePage'
import { RelatoriosPage } from '@/pages/RelatoriosPage'
import { ExportarPage } from '@/pages/ExportarPage'

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <Routes>
              <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

              <Route path="/" element={<AuthRoute><DashboardPage /></AuthRoute>} />
              <Route path="/upload" element={<AuthRoute><UploadPage /></AuthRoute>} />
              <Route path="/clientes" element={<AuthRoute><ClientesPage /></AuthRoute>} />
              <Route path="/analise-abc" element={<AuthRoute><AnaliseABCPage /></AuthRoute>} />
              <Route path="/penetracao" element={<AuthRoute><PenetracaoPage /></AuthRoute>} />
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
