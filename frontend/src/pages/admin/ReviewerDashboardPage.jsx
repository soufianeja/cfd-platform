import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

const STORAGE_URL = import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'

const statusConfig = {
  pending:  { label: 'Pending',  color: 'bg-amber-100 text-amber-700',  dot: 'bg-amber-400' },
  approved: { label: 'Approved', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-400' },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700',      dot: 'bg-red-400' },
}

export default function ReviewerDashboardPage() {
  const { user } = useAuthStore()
  const [simulations, setSimulations] = useState([])
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0 })
  const [statusFilter, setStatusFilter] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [meta, setMeta] = useState(null)
  const [page, setPage] = useState(1)

  // Reject modal
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectFeedback, setRejectFeedback] = useState('')
  const [submitting, setSubmitting] = useState(null) // id of item being acted on

  const fetchSimulations = useCallback(async (status, p) => {
    try {
      setLoading(true)
      setError(null)
      const res = await api.get(`/reviewer/simulations?status=${status}&page=${p}`)
      setSimulations(res.data.data)
      setMeta(res.data.meta)
      setCounts(res.data.counts)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load simulations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSimulations(statusFilter, page)
  }, [statusFilter, page, fetchSimulations])

  const handleFilterChange = (s) => {
    setStatusFilter(s)
    setPage(1)
  }

  const handleApprove = async (sim) => {
    if (submitting) return
    setSubmitting(sim.id)
    try {
      const res = await api.post(`/reviewer/simulations/${sim.id}/approve`)
      const { dataset_size, retraining_triggered } = res.data
      // Optimistic removal from list
      setSimulations(prev => prev.filter(s => s.id !== sim.id))
      setCounts(prev => ({ ...prev, pending: prev.pending - 1, approved: prev.approved + 1 }))
      if (retraining_triggered) {
        showToast(`✅ Approved! Dataset: ${dataset_size} rows. Auto-retraining triggered 🚀`, 'success')
      } else {
        showToast(`✅ Approved! Dataset now has ${dataset_size} rows.`, 'success')
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Approval failed.', 'error')
    } finally {
      setSubmitting(null)
    }
  }

  const handleRejectSubmit = async () => {
    if (!rejectFeedback.trim() || !rejectTarget) return
    setSubmitting(rejectTarget.id)
    try {
      await api.post(`/reviewer/simulations/${rejectTarget.id}/reject`, { feedback: rejectFeedback })
      setSimulations(prev => prev.filter(s => s.id !== rejectTarget.id))
      setCounts(prev => ({ ...prev, pending: prev.pending - 1, rejected: prev.rejected + 1 }))
      showToast('Simulation rejected.', 'info')
      setRejectTarget(null)
      setRejectFeedback('')
    } catch (err) {
      showToast(err.response?.data?.message || 'Rejection failed.', 'error')
    } finally {
      setSubmitting(null)
    }
  }

  // Simple toast state
  const [toast, setToast] = useState(null)
  const showToast = (message, type = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 5000)
  }

  if (user?.role !== 'reviewer' && user?.role !== 'admin') {
    return (
      <div className="max-w-6xl mx-auto p-6 text-center text-red-500 mt-20">
        <h2 className="text-2xl font-bold">Access Denied</h2>
        <p>You need the Reviewer role to access this page.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 text-white">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-2xl font-medium text-sm animate-slide-in
          ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-red-500' : 'bg-blue-500'}`}>
          {toast.message}
        </div>
      )}

      {/* Reject Modal */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl w-full max-w-lg p-6">
            <h3 className="text-xl font-bold text-white mb-1">Reject Simulation</h3>
            <p className="text-slate-400 text-sm mb-4">
              Provide feedback for <span className="text-white font-medium">"{rejectTarget.title}"</span>
            </p>
            <textarea
              value={rejectFeedback}
              onChange={e => setRejectFeedback(e.target.value)}
              rows={4}
              placeholder="Explain what needs to be corrected (required)..."
              className="w-full bg-slate-800 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setRejectTarget(null); setRejectFeedback('') }}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 transition text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRejectSubmit}
                disabled={!rejectFeedback.trim() || submitting === rejectTarget?.id}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold transition"
              >
                {submitting === rejectTarget?.id ? 'Rejecting...' : 'Confirm Reject'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Reviewer Dashboard</h1>
              <p className="text-slate-400 text-sm mt-0.5">Validate CFD simulations for the ML training dataset</p>
            </div>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { key: 'pending',  label: 'Pending Review', icon: '⏳', gradient: 'from-amber-500/20 to-amber-600/10', border: 'border-amber-500/30', text: 'text-amber-300' },
            { key: 'approved', label: 'Approved → ML', icon: '✅', gradient: 'from-emerald-500/20 to-emerald-600/10', border: 'border-emerald-500/30', text: 'text-emerald-300' },
            { key: 'rejected', label: 'Rejected', icon: '❌', gradient: 'from-red-500/20 to-red-600/10', border: 'border-red-500/30', text: 'text-red-300' },
          ].map(stat => (
            <button
              key={stat.key}
              onClick={() => handleFilterChange(stat.key)}
              className={`relative p-5 rounded-2xl border bg-gradient-to-br ${stat.gradient} ${stat.border} 
                text-left transition-all hover:scale-[1.02] hover:shadow-lg
                ${statusFilter === stat.key ? 'ring-2 ring-white/20 shadow-xl scale-[1.02]' : ''}`}
            >
              <div className="text-2xl mb-2">{stat.icon}</div>
              <div className={`text-3xl font-bold ${stat.text}`}>{counts[stat.key]}</div>
              <div className="text-slate-400 text-sm mt-1">{stat.label}</div>
              {statusFilter === stat.key && (
                <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-white/60"></div>
              )}
            </button>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected'].map(s => {
            const cfg = statusConfig[s]
            return (
              <button
                key={s}
                onClick={() => handleFilterChange(s)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all
                  ${statusFilter === s
                    ? 'bg-white/10 text-white border border-white/20 shadow'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                <span className={`inline-block w-2 h-2 rounded-full mr-2 ${cfg.dot}`}></span>
                {cfg.label}
                <span className="ml-2 text-xs opacity-60">{counts[s]}</span>
              </button>
            )
          })}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-300 text-sm">{error}</div>
        ) : simulations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500">
            <div className="text-5xl mb-4">🎉</div>
            <p className="font-medium">No {statusFilter} simulations</p>
            <p className="text-sm mt-1">All caught up!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {simulations.map(sim => (
              <SimulationCard
                key={sim.id}
                sim={sim}
                statusFilter={statusFilter}
                submitting={submitting}
                onApprove={handleApprove}
                onReject={() => { setRejectTarget(sim); setRejectFeedback('') }}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between mt-6 pt-6 border-t border-white/10">
            <span className="text-slate-400 text-sm">Page {meta.current_page} of {meta.last_page}</span>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-30 transition"
              >
                Previous
              </button>
              <button
                disabled={page === meta.last_page}
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-slate-300 hover:bg-white/10 disabled:opacity-30 transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  )
}

function SimulationCard({ sim, statusFilter, submitting, onApprove, onReject }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = statusConfig[sim.ml_review_status] || statusConfig.pending
  const hasCdCl = sim.cd !== null && sim.cl !== null

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:bg-white/[0.07] transition-all">
      <div className="p-5 flex items-start gap-5">
        {/* Thumbnail */}
        <div className="w-20 h-20 rounded-xl bg-slate-800 border border-white/10 overflow-hidden shrink-0 flex items-center justify-center">
          {sim.thumbnail ? (
            <img src={`${STORAGE_URL}/${sim.thumbnail}`} alt={sim.title} className="w-full h-full object-cover" />
          ) : (
            <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
            </svg>
          )}
        </div>

        {/* Main info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-white text-lg leading-tight">{sim.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${cfg.color}`}>
                  <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${cfg.dot}`}></span>
                  {cfg.label}
                </span>
              </div>
              <p className="text-slate-400 text-sm mt-0.5">
                {sim.geometry?.cfd_project?.title} →{' '}
                <span className="text-indigo-400">{sim.geometry?.name}</span>
              </p>
              {sim.description && (
                <p className="text-slate-500 text-xs mt-1 line-clamp-1">{sim.description}</p>
              )}
            </div>

            {/* Cd / Cl badges */}
            <div className="shrink-0 flex flex-col items-end gap-1.5">
              {hasCdCl ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Cd</span>
                    <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 text-sm font-bold">
                      {Number(sim.cd).toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Cl</span>
                    <span className="px-2.5 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg text-purple-300 text-sm font-bold">
                      {Number(sim.cl).toFixed(4)}
                    </span>
                  </div>
                </>
              ) : (
                <span className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
                  Missing Cd/Cl
                </span>
              )}
            </div>
          </div>

          {/* Geometry features row */}
          {sim.geometry?.features && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {Object.entries(sim.geometry.features)
                .filter(([, v]) => v !== null)
                .slice(0, 5)
                .map(([k, v]) => (
                  <span key={k} className="text-xs text-slate-500">
                    <span className="text-slate-400 font-medium">{k}:</span>{' '}
                    {typeof v === 'number' ? v.toFixed(3) : v}
                  </span>
                ))}
            </div>
          )}

          {/* Simulation params */}
          {sim.parameters && Object.keys(sim.parameters).length > 0 && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
              {Object.entries(sim.parameters).slice(0, 4).map(([k, v]) => (
                <span key={k} className="text-xs text-slate-500">
                  <span className="text-slate-400 font-medium">{k}:</span> {v}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={() => setExpanded(e => !e)}
              className="text-xs text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1"
            >
              {expanded ? '▲ Hide metrics' : '▼ Show all metrics'}
              {!hasCdCl && <span className="ml-1 text-red-400">⚠ No Cd/Cl</span>}
            </button>

            {/* Actions */}
            {statusFilter === 'pending' && (
              <div className="flex gap-2">
                <button
                  onClick={() => onReject()}
                  disabled={!!submitting}
                  className="px-4 py-1.5 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-500/10 text-sm font-semibold transition disabled:opacity-40"
                >
                  Reject
                </button>
                <button
                  onClick={() => onApprove(sim)}
                  disabled={!hasCdCl || !!submitting}
                  className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white text-sm font-semibold transition flex items-center gap-1.5"
                >
                  {submitting === sim.id ? (
                    <><span className="w-3 h-3 border border-white border-t-transparent rounded-full animate-spin"></span> Approving...</>
                  ) : (
                    <>✓ Approve & Add to Dataset</>
                  )}
                </button>
              </div>
            )}

            {statusFilter !== 'pending' && (
              <span className="text-xs text-slate-500">
                {sim.ml_validated_at
                  ? `Processed: ${new Date(sim.ml_validated_at).toLocaleDateString()}`
                  : `Reviewed`}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expanded metrics */}
      {expanded && sim.metrics?.length > 0 && (
        <div className="border-t border-white/10 bg-black/20 px-5 py-4">
          <p className="text-xs text-slate-500 uppercase font-semibold mb-3">All Metrics</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {sim.metrics.map(m => (
              <div key={m.key} className="bg-slate-800/60 border border-white/5 rounded-xl px-3 py-2">
                <div className="text-xs text-slate-500 uppercase">{m.key}</div>
                <div className="text-white font-bold mt-0.5">
                  {Number(m.value).toFixed(4)}
                  {m.unit && <span className="text-slate-500 font-normal text-xs ml-1">{m.unit}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
