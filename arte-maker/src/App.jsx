import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
} from 'react-router-dom'
import NotFoundPage from './pages/NotFoundPage'
import AdminTeachersPage from './pages/AdminTeachersPage'
import Header from './components/Header'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import PageTransition from './components/PageTransition'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './components/AdminLayout'

import Home from './pages/Home'
import GalleryPage from './pages/GalleryPage'
import EventsPage from './pages/EventsPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'

import AdminLoginPage from './pages/AdminLoginPage'
import AdminDashboard from './pages/AdminDashboard'

import AdminArtworksPage from './pages/AdminArtworksPage'
import AdminEventsPage from './pages/AdminEventsPage'
import AdminProjectsPage from './pages/AdminProjectsPage'


function AppContent() {
  const location = useLocation()

  const isAdmin =
    location.pathname.startsWith('/admin')

  return (
    <>

      <ScrollToTop />


      {!isAdmin && <Header />}


      {isAdmin ? (

        <Routes>

          <Route
            path="/admin/login"
            element={<AdminLoginPage />}
          />


          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout />
              </ProtectedRoute>
            }
          >

            <Route
              index
              element={<AdminDashboard />}
            />

            <Route
              path="obras"
              element={<AdminArtworksPage />}
            />

            <Route
              path="eventos"
              element={<AdminEventsPage />}
            />

            <Route
              path="projetos"
              element={<AdminProjectsPage />}
            />
            <Route
  path="professoras"
  element={<AdminTeachersPage />}
/>

            <Route
  path="*"
  element={
    <Navigate
      to="/admin"
      replace
    />
  }
/>

            

          </Route>

        </Routes>

      ) : (

        <PageTransition>

          <Routes>

            <Route
              path="/"
              element={<Home />}
            />

            <Route
              path="/galeria"
              element={<GalleryPage />}
            />

            <Route
              path="/eventos"
              element={<EventsPage />}
            />

            <Route
              path="/projetos"
              element={<ProjectsPage />}
            />

            <Route
              path="/projetos/:slug"
              element={<ProjectDetailPage />}
            />

            <Route
  path="*"
  element={<NotFoundPage />}
/>

          </Routes>

        </PageTransition>

      )}


      {!isAdmin && <Footer />}

    </>
  )
}


function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

export default App