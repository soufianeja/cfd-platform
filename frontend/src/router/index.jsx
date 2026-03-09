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
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
])

export default router