import { createBrowserRouter } from 'react-router-dom'
import Layout from '../components/Layout'
import ProtectedRoute from '../components/ProtectedRoute'
import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import CfdProjectList from '../pages/cfd/CfdProjectList'
import CfdProjectDetail from '../pages/cfd/CfdProjectDetail'
import CfdProjectCreate from '../pages/cfd/CfdProjectCreate'
import Profile from '../pages/Profile'
import CfdProjectEdit from '../pages/cfd/CfdProjectEdit'
import ProjectList from '../pages/projects/ProjectList'
import ProjectDetail from '../pages/projects/ProjectDetail'
import ProjectCreate from '../pages/projects/ProjectCreate'
import ProjectEdit from '../pages/projects/ProjectEdit'
import CfdProjectGeometries from '../pages/cfd/CfdProjectGeometries'
import GeometryStore from '../pages/geometries/GeometryStore'
import SimulationList from '../pages/simulations/SimulationList'
import SimulationCreate from '../pages/simulations/SimulationCreate'
import SimulationDetail from '../pages/simulations/SimulationDetail'
import SimulationEdit from '../pages/simulations/SimulationEdit'
import UserProfile from '../pages/users/UserProfile'
import Search from '../pages/Search'
import PredictPage from '../pages/ml/PredictPage'
import MlDashboardPage from '../pages/admin/MlDashboardPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><CfdProjectList /></Layout>,
  },
  {
    path: '/cfd/:slug',
    element: <Layout><CfdProjectDetail /></Layout>,
  },
  {
    path: '/cfd/create',
    element: (
      <ProtectedRoute>
        <Layout><CfdProjectCreate /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/cfd/:slug/edit',
    element: (
      <ProtectedRoute>
        <Layout><CfdProjectEdit /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/cfd/:slug/geometries',
    element: <Layout><CfdProjectGeometries /></Layout>,
  },
  {
    path: '/geometries',
    element: <Layout><GeometryStore /></Layout>,
  },
  {
    path: '/cfd/:slug/geometries/:geometryId/simulations',
    element: <Layout><SimulationList /></Layout>,
  },
  {
    path: '/cfd/:slug/geometries/:geometryId/simulations/create',
    element: (
      <ProtectedRoute>
        <Layout><SimulationCreate /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/cfd/:slug/geometries/:geometryId/simulations/:simulationId',
    element: <Layout><SimulationDetail /></Layout>,
  },
  {
    path: '/cfd/:slug/geometries/:geometryId/simulations/:simulationId/edit',
    element: (
      <ProtectedRoute>
        <Layout><SimulationEdit /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects',
    element: <Layout><ProjectList /></Layout>,
  },
  {
    path: '/projects/:slug',
    element: <Layout><ProjectDetail /></Layout>,
  },
  {
    path: '/projects/create',
    element: (
      <ProtectedRoute>
        <Layout><ProjectCreate /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/projects/:slug/edit',
    element: (
      <ProtectedRoute>
        <Layout><ProjectEdit /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/me',
    element: (
      <ProtectedRoute>
        <Layout><Profile /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/users/:id',
    element: <Layout><UserProfile /></Layout>,
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/search', element: <Layout><Search /></Layout> },
  { path: '/predict', element: <Layout><PredictPage /></Layout> },
  {
    path: '/admin/ml',
    element: (
      <ProtectedRoute>
        <Layout><MlDashboardPage /></Layout>
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <Layout><AdminDashboardPage /></Layout>
      </ProtectedRoute>
    ),
  },
])

export default router