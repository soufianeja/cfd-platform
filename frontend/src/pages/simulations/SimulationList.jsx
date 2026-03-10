import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

const STATUS_STYLES = {
    pending: 'bg-yellow-100 text-yellow-700',
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
}

export default function SimulationList() {
    const { slug, geometryId } = useParams()
    const { user } = useAuthStore()
    const queryClient = useQueryClient()

    const { data: simulations = [], isLoading } = useQuery({
        queryKey: ['simulations', geometryId],
        queryFn: async () => {
            const { data } = await api.get(`/geometries/${geometryId}/simulations`)
            return data.data
        },
    })

    const deleteMutation = useMutation({
        mutationFn: (simId) => api.delete(`/geometries/${geometryId}/simulations/${simId}`),
        onSuccess: () => queryClient.invalidateQueries(['simulations', geometryId]),
    })

    if (isLoading) return <p className="p-8 text-gray-500">Loading simulations...</p>

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <Link
                        to={`/cfd/${slug}/geometries`}
                        className="text-blue-600 hover:underline text-sm"
                    >
                        ← Back to Geometries
                    </Link>
                    <h1 className="text-3xl font-bold mt-2">Simulations</h1>
                </div>
                {user && (
                    <Link
                        to={`/cfd/${slug}/geometries/${geometryId}/simulations/create`}
                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                        + New Simulation
                    </Link>
                )}
            </div>

            {simulations.length === 0 ? (
                <div className="bg-white rounded-xl shadow p-12 text-center text-gray-400">
                    <p className="text-5xl mb-4">🔬</p>
                    <p className="text-lg font-medium">No simulations yet</p>
                    <p className="text-sm mt-1">Create the first simulation for this geometry.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {simulations.map((sim) => (
                        <div key={sim.id} className="bg-white rounded-xl shadow p-6 flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-lg font-semibold">{sim.title}</h2>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[sim.status] || 'bg-gray-100 text-gray-700'}`}>
                                        {sim.status}
                                    </span>
                                </div>
                                {sim.description && (
                                    <p className="text-gray-500 text-sm line-clamp-2">{sim.description}</p>
                                )}
                                {sim.metrics?.length > 0 && (
                                    <div className="flex flex-wrap gap-3 mt-3">
                                        {sim.metrics.slice(0, 4).map((m) => (
                                            <span key={m.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                {m.key}: <strong>{m.value}</strong>{m.unit ? ` ${m.unit}` : ''}
                                            </span>
                                        ))}
                                        {sim.metrics.length > 4 && (
                                            <span className="text-xs text-gray-400">+{sim.metrics.length - 4} more</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <Link
                                    to={`/cfd/${slug}/geometries/${geometryId}/simulations/${sim.id}`}
                                    className="text-sm text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                                >
                                    View
                                </Link>
                                {user && (
                                    <Link
                                        to={`/cfd/${slug}/geometries/${geometryId}/simulations/${sim.id}/edit`}
                                        className="text-sm text-gray-600 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                                    >
                                        Edit
                                    </Link>
                                )}
                                {user && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this simulation?'))
                                                deleteMutation.mutate(sim.id)
                                        }}
                                        className="text-sm text-red-500 border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50"
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
