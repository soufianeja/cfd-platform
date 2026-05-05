import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function AdminDashboardPage() {
  const { user } = useAuthStore()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [roleChanging, setRoleChanging] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchUsers(currentPage)
  }, [currentPage])

  const fetchUsers = async (page) => {
    try {
      setLoading(true)
      const res = await api.get(`/admin/users?page=${page}`)
      setUsers(res.data.data)
      setMeta(res.data.meta)
      setError(null)
    } catch (err) {
      console.error('Error fetching users:', err)
      setError('Failed to load users.')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleBan = async (userId, currentStatus) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/ban`)
      setUsers(users.map(u => u.id === userId ? { ...u, status: res.data.status } : u))
    } catch (err) {
      console.error('Error toggling ban:', err)
      alert(err.response?.data?.message || 'Failed to update user status.')
    }
  }

  const handleChangeRole = async (userId, currentRole) => {
    const newRole = currentRole === 'reviewer' ? 'user' : 'reviewer'
    setRoleChanging(userId)
    try {
      await api.patch(`/admin/users/${userId}/role`, { role: newRole })
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u))
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to change role.')
    } finally {
      setRoleChanging(null)
    }
  }

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQ = searchQuery.toLowerCase();
    return users.filter(u => 
      u.name.toLowerCase().includes(lowerQ) || 
      u.email.toLowerCase().includes(lowerQ)
    );
  }, [users, searchQuery])

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center text-red-500 mt-20">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12">
      {/* Header Area */}
      <div className="bg-white border-b border-slate-200/60 pt-10 pb-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Admin Dashboard</h1>
            <p className="text-slate-500 mt-2">Manage users, platform settings, and monitor activity.</p>
          </div>
          
          <Link 
            to="/admin/ml" 
            className="group relative flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-white overflow-hidden transition-all hover:scale-105 shadow-lg shadow-purple-500/25"
          >
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-[length:200%_auto] animate-gradient"></div>
            <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <span className="relative z-10">ML Intelligence Hub</span>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 -mt-6 relative z-20">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden">
          
          {/* Toolbar */}
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              Platform Users
              {!loading && <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">{meta?.total || 0}</span>}
            </h2>
            
            <div className="relative w-full sm:w-72">
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition-all"
              />
              <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div></div>
            ) : error ? (
              <div className="p-12 text-center text-red-500 font-medium">{error}</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">No users found matching your search.</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider font-bold">
                    <th className="p-5">User</th>
                    <th className="p-5">Email</th>
                    <th className="p-5">Role</th>
                    <th className="p-5">Activity</th>
                    <th className="p-5">Status</th>
                    <th className="p-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-all duration-200 group">
                      <td className="p-5">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-100 flex items-center justify-center text-indigo-700 font-black shadow-sm border border-white">
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            {u.status === 'banned' && (
                                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-slate-800 group-hover:text-purple-700 transition-colors">{u.name}</div>
                            <div className="text-xs text-slate-500 font-medium">Joined {new Date(u.created_at).toLocaleDateString()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-5 text-slate-600 font-medium text-sm">{u.email}</td>
                      <td className="p-5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm ${
                            u.role === 'admin' ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/20' : 
                            u.role === 'reviewer' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}>
                          {u.role ? u.role.toUpperCase() : 'USER'}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex gap-4 text-sm font-bold">
                          <span title="CFD Projects" className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                            {u.cfd_projects_count || 0}
                          </span>
                          <span title="Academic Projects" className="flex items-center gap-1 text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            {u.projects_count || 0}
                          </span>
                        </div>
                      </td>
                      <td className="p-5">
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${u.status === 'banned' ? 'text-red-600' : 'text-emerald-600'}`}>
                          <div className={`w-2 h-2 rounded-full ${u.status === 'banned' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                          {u.status ? u.status.toUpperCase() : 'ACTIVE'}
                        </span>
                      </td>
                      <td className="p-5 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          {u.id !== user?.id && u.role !== 'admin' && (
                            <button
                              onClick={() => handleChangeRole(u.id, u.role)}
                              disabled={roleChanging === u.id}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all hover:-translate-y-0.5
                                ${u.role === 'reviewer'
                                  ? 'border-amber-200 text-amber-600 hover:bg-amber-50 hover:shadow-sm'
                                  : 'border-blue-200 text-blue-600 hover:bg-blue-50 hover:shadow-sm'}`}
                            >
                              {roleChanging === u.id ? '...' : u.role === 'reviewer' ? 'Demote' : '+ Reviewer'}
                            </button>
                          )}
                          {u.id !== user?.id && (
                            <button
                              onClick={() => handleToggleBan(u.id, u.status)}
                              className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:-translate-y-0.5
                                ${u.status === 'banned' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-50 text-red-600 hover:bg-red-100'}`}
                            >
                              {u.status === 'banned' ? 'Restore' : 'Ban'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
          
          {/* Pagination */}
          {meta && meta.last_page > 1 && !searchQuery && (
            <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <span className="text-sm font-medium text-slate-500">
                Page <span className="text-slate-800 font-bold">{meta.current_page}</span> of {meta.last_page}
              </span>
              <div className="flex gap-2">
                <button
                  disabled={meta.current_page === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
                >
                  Prev
                </button>
                <button
                  disabled={meta.current_page === meta.last_page}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-sm font-bold text-slate-600 hover:bg-white hover:shadow-sm disabled:opacity-50 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
        }
        .animate-gradient {
            animation: gradient 3s ease infinite;
        }
      `}} />
    </div>
  )
}
