import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './controllers/AuthContext'
import { ProtectedRoute } from './controllers/ProtectedRoute'
import { Layout } from './views/Layout'

import { AdminLoginView } from './views/AdminLoginView'
import { AdminPanelView } from './views/AdminPanelView'
import { AdminCiclosView } from './views/admin/AdminCiclosView'
import { AdminCursosView } from './views/admin/AdminCursosView'
import { AdminMatriculaView } from './views/admin/AdminMatriculaView'
import { AdminAsistenciaView } from './views/admin/AdminAsistenciaView'
import { AdminExamenesView } from './views/admin/AdminExamenesView'
import { AdminAlumnosView } from './views/admin/AdminAlumnosView'
import { AdminHorarioView } from './views/admin/AdminHorarioView'
import { AdminMaterialesView } from './views/admin/AdminMaterialesView'
import { AdminCarnetsView } from './views/admin/AdminCarnetsView'
import { AdminPagosView } from './views/admin/AdminPagosView'
import { AdminUsuariosView } from './views/admin/AdminUsuariosView'
import AdminPlantillasView from './views/admin/AdminPlantillasView'

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* 🔓 Login público */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/admin" replace />
            : <AdminLoginView />
        }
      />

      {/* 🔐 Rutas protegidas admin */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminPanelView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/ciclos"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminCiclosView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/cursos"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminCursosView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/matricula"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminMatriculaView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/asistencia"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminAsistenciaView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/examenes"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminExamenesView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/plantillas-examen"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminPlantillasView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/alumnos"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminAlumnosView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/horario"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminHorarioView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/materiales"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminMaterialesView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/carnets"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminCarnetsView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/pagos"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminPagosView />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute>
            <Layout>
              <AdminUsuariosView />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* 🌍 Fallback */}
      <Route
        path="*"
        element={
          <Navigate
            to={isAuthenticated ? '/admin' : '/login'}
            replace
          />
        }
      />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}