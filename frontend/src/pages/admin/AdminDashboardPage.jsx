import { useState, useEffect } from 'react'
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
      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, status: res.data.status } : u))
    } catch (err) {
      console.error('Error toggling ban:', err)
      alert(err.response?.data?.message || 'Failed to update user status.')
    }
  }

  if (user?.role !== 'admin') {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center text-red-500 mt-20">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Manage users and platform settings</p>
        </div>
        
        <Link 
          to="/admin/ml" 
          className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          ML Intelligence Hub
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Platform Users</h2>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading users...</div>
          ) : error ? (
            <div className="p-8 text-center text-red-500">{error}</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">User</th>
                  <th className="p-4 font-medium">Email</th>
                  <th className="p-4 font-medium">Role</th>
                  <th className="p-4 font-medium">Projects</th>
                  <th className="p-4 font-medium">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{u.name}</div>
                          <div className="text-xs text-gray-500">Joined {new Date(u.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-gray-600">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-3 text-sm">
                        <span title="CFD Projects" className="flex items-center gap-1 text-blue-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                          {u.cfd_projects_count || 0}
                        </span>
                        <span title="Academic Projects" className="flex items-center gap-1 text-indigo-600">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                          {u.projects_count || 0}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${u.status === 'banned' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {u.id !== user?.id && (
                        <button
                          onClick={() => handleToggleBan(u.id, u.status)}
                          className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.status === 'banned' ? 'text-green-600 hover:bg-green-50' : 'text-red-600 hover:bg-red-50'}`}
                        >
                          {u.status === 'banned' ? 'Unban User' : 'Ban User'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        
        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              Showing page {meta.current_page} of {meta.last_page}
            </span>
            <div className="flex gap-2">
              <button
                disabled={meta.current_page === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={meta.current_page === meta.last_page}
                onClick={() => setCurrentPage(p => p + 1)}
                className="px-4 py-2 border rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
