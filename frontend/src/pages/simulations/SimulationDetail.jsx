import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
} from 'recharts'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

const STATUS_COLORS = {
    pending: 'bg-yellow-100 text-yellow-700',
    running: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
}

const IMAGE_TYPES = ['pressure', 'velocity', 'streamlines', 'mesh', 'residuals', 'temperature', 'other']

export default function SimulationDetail() {
    const { slug, geometryId, simulationId } = useParams()
    const { token } = useAuthStore()
    const queryClient = useQueryClient()

    const [activeImage, setActiveImage] = useState(null)
    const [showMetricForm, setShowMetricForm] = useState(false)
    const [showImageForm, setShowImageForm] = useState(false)
    const [metrics, setMetrics] = useState([{ key: '', value: '', unit: '' }])
    const [imageFile, setImageFile] = useState(null)
    const [imageData, setImageData] = useState({ type: 'other', caption: '', order: 0 })

    const BASE = `/geometries/${geometryId}/simulations/${simulationId}`

    const { data: sim, isLoading } = useQuery({
        queryKey: ['simulation', simulationId],
        queryFn: async () => {
            const { data } = await api.get(BASE)
            return data.data
        },
    })

    const invalidate = () => queryClient.invalidateQueries(['simulation', simulationId])

    // Add metrics
    const metricsMutation = useMutation({
        mutationFn: () => api.post(`${BASE}/metrics`, { metrics }),
        onSuccess: () => {
            invalidate()
            setShowMetricForm(false)
            setMetrics([{ key: '', value: '', unit: '' }])
        },
    })

    // Add single image
    const imageMutation = useMutation({
        mutationFn: () => {
            const fd = new FormData()
            fd.append('image', imageFile)
            fd.append('type', imageData.type)
            if (imageData.caption) fd.append('caption', imageData.caption)
            fd.append('order', imageData.order)
            return api.post(`${BASE}/images`, fd, { headers: { 'Content-Type': 'multipart/form-data' } })
        },
        onSuccess: () => {
            invalidate()
            setShowImageForm(false)
            setImageFile(null)
            setImageData({ type: 'other', caption: '', order: 0 })
        },
    })

    // Update status
    const statusMutation = useMutation({
        mutationFn: (status) => api.post(BASE, { status }),
        onSuccess: invalidate,
    })

    const addMetricRow = () => setMetrics([...metrics, { key: '', value: '', unit: '' }])
    const removeMetricRow = (i) => setMetrics(metrics.filter((_, idx) => idx !== i))
    const updateMetric = (i, field, value) => {
        const updated = [...metrics]; updated[i][field] = value; setMetrics(updated)
    }

    if (isLoading) return <p className="p-8 text-gray-500">Loading simulation...</p>
    if (!sim) return <p className="p-8 text-red-500">Simulation not found.</p>

    const chartData = sim.metrics?.map(m => ({
        name: m.key,
        value: parseFloat(m.value) || 0,
        unit: m.unit,
    })) ?? []

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link to="/" className="hover:text-blue-600">Projects</Link>
                <span>/</span>
                <Link to={`/cfd/${slug}`} className="hover:text-blue-600">Project</Link>
                <span>/</span>
                <Link to={`/cfd/${slug}/geometries`} className="hover:text-blue-600">Geometries</Link>
                <span>/</span>
                <Link to={`/cfd/${slug}/geometries/${geometryId}/simulations`} className="hover:text-blue-600">Simulations</Link>
                <span>/</span>
                <span className="text-gray-800 font-medium truncate max-w-xs">{sim.title}</span>
            </div>

            {/* Header */}
            <div className="bg-white rounded-xl shadow p-8 mb-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h1 className="text-3xl font-bold">{sim.title}</h1>
                            <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[sim.status]}`}>
                                {sim.status}
                            </span>
                            {token && (
                                <Link
                                    to={`/cfd/${slug}/geometries/${geometryId}/simulations/${simulationId}/edit`}
                                    className="text-sm text-gray-500 border border-gray-200 px-3 py-1 rounded-lg hover:bg-gray-50"
                                >
                                    ✏️ Edit
                                </Link>
                            )}
                        </div>
                        {sim.description && (
                            <p className="text-gray-600 mt-3 leading-relaxed whitespace-pre-wrap">{sim.description}</p>
                        )}
                    </div>

                    {/* Status quick-switch */}
                    {token && (
                        <div className="flex gap-2 flex-wrap shrink-0">
                            {['pending', 'running', 'completed', 'failed'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => statusMutation.mutate(s)}
                                    disabled={sim.status === s || statusMutation.isPending}
                                    className={`text-xs px-3 py-1.5 rounded-lg border capitalize transition ${sim.status === s
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'
                                            : 'hover:bg-gray-50 text-gray-600 border-gray-300'
                                        }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Metrics */}
            <div className="bg-white rounded-xl shadow p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Metrics</h2>
                    {token && (
                        <button
                            onClick={() => setShowMetricForm(!showMetricForm)}
                            className="text-sm border border-blue-300 text-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-50"
                        >
                            {showMetricForm ? 'Cancel' : '+ Add Metrics'}
                        </button>
                    )}
                </div>

                {showMetricForm && (
                    <div className="border rounded-xl p-4 mb-6 space-y-3 bg-gray-50">
                        {metrics.map((m, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <input placeholder="Key (e.g. Cd)" value={m.key}
                                    onChange={e => updateMetric(i, 'key', e.target.value)}
                                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <input placeholder="Value (e.g. 0.24)" value={m.value}
                                    onChange={e => updateMetric(i, 'value', e.target.value)}
                                    className="flex-1 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                <input placeholder="Unit" value={m.unit}
                                    onChange={e => updateMetric(i, 'unit', e.target.value)}
                                    className="w-24 border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                {metrics.length > 1 && (
                                    <button onClick={() => removeMetricRow(i)} className="text-red-400 hover:text-red-600 text-lg">×</button>
                                )}
                            </div>
                        ))}
                        <div className="flex gap-2 pt-2">
                            <button onClick={addMetricRow} className="text-sm text-blue-600 hover:underline">+ Add row</button>
                            <button
                                onClick={() => metricsMutation.mutate()}
                                disabled={metricsMutation.isPending}
                                className="ml-auto bg-blue-600 text-white px-6 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
                            >
                                {metricsMutation.isPending ? 'Saving...' : 'Save Metrics'}
                            </button>
                        </div>
                    </div>
                )}

                {sim.metrics?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Metric cards */}
                        <div className="grid grid-cols-2 gap-3 content-start">
                            {sim.metrics.map((m, i) => (
                                <div key={i} className="border rounded-xl p-4 text-center bg-gray-50">
                                    <p className="text-xs text-gray-400 mb-1 font-mono">{m.key}</p>
                                    <p className="text-xl font-bold text-blue-700">{m.value}</p>
                                    {m.unit && <p className="text-xs text-gray-400 mt-1">{m.unit}</p>}
                                </div>
                            ))}
                        </div>

                        {/* Bar chart */}
                        {chartData.length >= 2 && (
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                                        <YAxis tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={(val, _, props) => [`${val} ${props.payload.unit ?? ''}`, 'Value']} />
                                        <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No metrics added yet.</p>
                )}
            </div>

            {/* Images */}
            <div className="bg-white rounded-xl shadow p-8 mb-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">Result Images</h2>
                    {token && (
                        <button
                            onClick={() => setShowImageForm(!showImageForm)}
                            className="text-sm border border-blue-300 text-blue-600 px-4 py-1.5 rounded-lg hover:bg-blue-50"
                        >
                            {showImageForm ? 'Cancel' : '+ Upload Image'}
                        </button>
                    )}
                </div>

                {showImageForm && (
                    <div className="border rounded-xl p-4 mb-6 space-y-3 bg-gray-50">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Image File *</label>
                                <input type="file" accept=".jpg,.jpeg,.png,.webp"
                                    onChange={e => setImageFile(e.target.files[0])}
                                    className="w-full border rounded-lg px-3 py-1.5 text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700" />
                                {imageFile && <p className="text-xs text-green-600 mt-1">✅ {imageFile.name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                <select value={imageData.type} onChange={e => setImageData({ ...imageData, type: e.target.value })}
                                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    {IMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                                <input type="text" value={imageData.caption}
                                    onChange={e => setImageData({ ...imageData, caption: e.target.value })}
                                    placeholder="e.g. Pressure contour at Re=50000"
                                    className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                            </div>
                        </div>
                        <button onClick={() => imageMutation.mutate()}
                            disabled={imageMutation.isPending || !imageFile}
                            className="bg-blue-600 text-white px-6 py-1.5 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50">
                            {imageMutation.isPending ? 'Uploading...' : 'Upload Image'}
                        </button>
                    </div>
                )}

                {sim.images?.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {sim.images.map((img, i) => (
                            <div key={i}
                                className="cursor-pointer group relative rounded-xl overflow-hidden border"
                                onClick={() => setActiveImage(img)}
                            >
                                <img
                                    src={`/storage/${img.path}`}
                                    alt={img.caption}
                                    className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-200"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                    <span className="text-xs text-white font-medium capitalize">{img.type}</span>
                                    {img.caption && <p className="text-xs text-white/80 truncate">{img.caption}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm">No images uploaded yet.</p>
                )}
            </div>

            {/* Lightbox */}
            {activeImage && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
                    onClick={() => setActiveImage(null)}>
                    <div className="max-w-4xl w-full relative" onClick={e => e.stopPropagation()}>
                        <img
                            src={`/storage/${activeImage.path}`}
                            alt={activeImage.caption}
                            className="w-full rounded-xl max-h-[80vh] object-contain"
                        />
                        {activeImage.caption && (
                            <p className="text-white text-center mt-3 text-sm">{activeImage.caption}</p>
                        )}
                        <button onClick={() => setActiveImage(null)}
                            className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-gray-800 hover:bg-gray-100 text-lg">
                            ×
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
