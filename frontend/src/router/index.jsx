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
    path: '/me',
    element: (
      <ProtectedRoute>
        <Layout><Profile /></Layout>
      </ProtectedRoute>
    ),
  },
  { path: '/login',    element: <Login /> },
  { path: '/register', element: <Register /> },
])

export default router