import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import SearchBar from './SearchBar'

export default function Navbar() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } finally {
      logout()
      navigate('/login')
    }
  }

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-blue-600 shrink-0">CFD Platform</Link>
        <div className="flex-1 flex justify-center max-w-lg hidden md:flex">
          <SearchBar />
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <Link to="/" className="text-sm text-gray-600 hover:text-blue-600">CFD Projects</Link>
          <Link to="/geometries" className="text-sm text-gray-600 hover:text-blue-600">Geometry Store</Link>
          <Link to="/projects" className="text-sm text-gray-600 hover:text-indigo-600">Academic Projects</Link>
          {token ? (
            <>
              <div className="flex gap-2">
                <Link to="/cfd/create" className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">
                  + New CFD
                </Link>
                <Link to="/projects/create" className="text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700">
                  + New Academic
                </Link>
              </div>
              <Link to="/me" className="text-sm text-gray-600 hover:text-blue-600">
                {user?.name ?? 'Profile'}
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:text-red-700"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm text-gray-600 hover:text-blue-600">Login</Link>
              <Link to="/register" className="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}