import { Link, useNavigate, useLocation } from 'react-router-dom'
import useAuthStore from '../store/authStore'
import api from '../api/axios'
import SearchBar from './SearchBar'

export default function Navbar() {
  const { user, token, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = async () => {
    try {
      await api.post('/logout')
    } finally {
      logout()
      navigate('/login')
    }
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 shadow-sm sticky top-0 z-50 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 shrink-0 hover:opacity-80 transition-opacity">
          CFD Platform
        </Link>
        
        {(!user || user.role !== 'admin') && (
            <div className="flex-1 flex justify-center max-w-xl hidden md:flex px-8">
              <SearchBar />
            </div>
        )}
        {(user && user.role === 'admin') && (
            <div className="flex-1"></div>
        )}
        
        <div className="flex items-center gap-5 shrink-0">
          {(!user || user.role !== 'admin') && (
              <div className="hidden lg:flex items-center gap-5">
                <Link to="/" className={`text-sm font-semibold transition-colors ${isActive('/') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>CFD Projects</Link>
                <Link to="/geometries" className={`text-sm font-semibold transition-colors ${isActive('/geometries') ? 'text-blue-600' : 'text-slate-600 hover:text-blue-600'}`}>Geometry Store</Link>
                <Link to="/projects" className={`text-sm font-semibold transition-colors ${isActive('/projects') ? 'text-indigo-600' : 'text-slate-600 hover:text-indigo-600'}`}>Academic Projects</Link>
                <Link to="/predict" className="text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 flex items-center gap-1 group">
                  <svg className="w-4 h-4 text-blue-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Predictor
                </Link>
              </div>
          )}

          {(!user || user.role !== 'admin') && (
              <div className="h-6 w-px bg-slate-200 hidden lg:block"></div>
          )}

          {token ? (
            <div className="flex items-center gap-3">


              {user?.role === 'admin' && (
                <>
                    <Link to="/admin" className="relative group">
                      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg blur opacity-40 group-hover:opacity-70 transition duration-200"></div>
                      <div className="relative flex items-center gap-1 px-3 py-1.5 bg-white rounded-lg border border-purple-100 text-xs font-bold text-purple-700">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        Admin Dashboard
                      </div>
                    </Link>
                    <Link to="/admin/ml" className="relative group ml-1">
                      <div className="relative flex items-center gap-1 px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-200 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                        ML Hub
                      </div>
                    </Link>
                </>
              )}
              
              {user?.role === 'reviewer' && (
                <Link to="/reviewer" className="flex items-center gap-1 px-3 py-1.5 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-sm">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                  </svg>
                  Review
                </Link>
              )}

              {(!user || user.role !== 'admin') && (
                  <Link to="/me" className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full hover:bg-slate-100 transition-colors group">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold group-hover:bg-blue-200 transition-colors">
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      Profile
                    </span>
                  </Link>
              )}

              <Link to="/settings" className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Settings">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </Link>

              <button
                onClick={handleLogout}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Logout"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors px-2">Log in</Link>
              <Link to="/register" className="text-sm font-bold bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}