import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'

const STATUSES = ['pending', 'running', 'completed', 'failed']
const IMAGE_TYPES = ['pressure', 'velocity', 'streamlines', 'mesh', 'residuals', 'temperature', 'other']
const METRIC_SUGGESTIONS = ['Cd', 'Cl', 'Cm', 'pressure_drop', 'Nu', 'velocity_max', 'Re', 'inlet_velocity', 'mass_flow_rate']

export default function SimulationEdit() {
    const { slug, geometryId, simulationId } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [newImages, setNewImages] = useState([])  // new files to upload

    const [form, setForm] = useState({ title: '', description: '', status: 'completed' })
    const [metrics, setMetrics] = useState([])

    const { data: sim, isLoading } = useQuery({
        queryKey: ['simulation', simulationId],
        queryFn: async () => {
            const { data } = await api.get(`/geometries/${geometryId}/simulations/${simulationId}`)
            return data.data
        },
    })

    // Pre-fill form once simulation is loaded
    useEffect(() => {
        if (!sim) return
        setForm({ title: sim.title, description: sim.description || '', status: sim.status })
        setMetrics(sim.metrics?.map(m => ({ key: m.key, value: String(m.value), unit: m.unit || '' })) || [])
    }, [sim])

    const [existingImages, setExistingImages] = useState([])
    useEffect(() => { if (sim?.images) setExistingImages(sim.images) }, [sim])

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    const addMetric = () => setMetrics([...metrics, { key: '', value: '', unit: '' }])
    const removeMetric = (i) => setMetrics(metrics.filter((_, idx) => idx !== i))
    const setMetric = (i, field) => (e) => {
        const updated = [...metrics]; updated[i][field] = e.target.value; setMetrics(updated)
    }

    const addImage = (e) => {
        const files = Array.from(e.target.files)
        setNewImages(prev => [...prev, ...files.map(f => ({ file: f, type: 'other', caption: '' }))])
        e.target.value = ''
    }
    const removeNewImage = (i) => setNewImages(newImages.filter((_, idx) => idx !== i))
    const setNewImageField = (i, field) => (e) => {
        const updated = [...newImages]; updated[i][field] = e.target.value; setNewImages(updated)
    }

    const deleteExistingImage = async (imgId) => {
        try {
            await api.delete(`/geometries/${geometryId}/simulations/${simulationId}/images/${imgId}`)
            setExistingImages(existingImages.filter(img => img.id !== imgId))
        } catch { alert('Failed to delete image.') }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        try {
            const fd = new FormData()
            fd.append('title', form.title)
            fd.append('description', form.description)
            fd.append('status', form.status)
            metrics.filter(m => m.key && m.value !== '').forEach((m, i) => {
                fd.append(`metrics[${i}][key]`, m.key)
                fd.append(`metrics[${i}][value]`, m.value)
                fd.append(`metrics[${i}][unit]`, m.unit || '')
            })
            newImages.forEach((img, i) => {
                fd.append('images[]', img.file)
                fd.append(`image_types[${i}]`, img.type)
                fd.append(`image_captions[${i}]`, img.caption)
            })
            await api.post(`/geometries/${geometryId}/simulations/${simulationId}`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            navigate(`/cfd/${slug}/geometries/${geometryId}/simulations/${simulationId}`)
        } catch (err) {
            setErrors(err.response?.data?.errors || { general: 'Something went wrong.' })
        } finally {
            setLoading(false)
        }
    }

    if (isLoading) return <p className="p-8 text-gray-500">Loading...</p>

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <Link to={`/cfd/${slug}/geometries/${geometryId}/simulations`} className="text-blue-600 hover:underline text-sm">
                ← Back to Simulations
            </Link>
            <h1 className="text-3xl font-bold mt-2 mb-8">Edit Simulation</h1>

            {errors.general && (
                <p className="text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">{errors.general}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl shadow p-8 space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Basic Info</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                        <input type="text" value={form.title} onChange={set('title')}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. NACA0012 at Re=1M" />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea value={form.description} onChange={set('description')} rows={3}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the simulation setup..." />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="flex gap-4">
                            {STATUSES.map(s => (
                                <label key={s} className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="status" value={s} checked={form.status === s}
                                        onChange={set('status')} className="text-blue-600" />
                                    <span className="capitalize text-sm">{s}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Metrics */}
                <div className="bg-white rounded-xl shadow p-8">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h2 className="text-lg font-semibold">Simulation Metrics</h2>
                        <button type="button" onClick={addMetric}
                            className="text-sm text-blue-600 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50">
                            + Add Row
                        </button>
                    </div>
                    <div className="space-y-3">
                        {metrics.map((m, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-5">
                                    <input list="metric-keys" value={m.key} onChange={setMetric(i, 'key')}
                                        placeholder="Key (e.g. Cd)"
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    <datalist id="metric-keys">{METRIC_SUGGESTIONS.map(s => <option key={s} value={s} />)}</datalist>
                                </div>
                                <div className="col-span-4">
                                    <input type="number" step="any" value={m.value} onChange={setMetric(i, 'value')}
                                        placeholder="Value"
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="col-span-2">
                                    <input value={m.unit} onChange={setMetric(i, 'unit')} placeholder="Unit"
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    {metrics.length > 1 && (
                                        <button type="button" onClick={() => removeMetric(i)}
                                            className="text-red-400 hover:text-red-600 text-lg">×</button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Existing Images */}
                {existingImages.length > 0 && (
                    <div className="bg-white rounded-xl shadow p-8">
                        <h2 className="text-lg font-semibold border-b pb-2 mb-4">Current Images</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {existingImages.map(img => (
                                <div key={img.id} className="relative rounded-lg overflow-hidden border group">
                                    <img
                                        src={`http://localhost:8000/storage/${img.path}`}
                                        alt={img.caption || img.type}
                                        className="w-full h-32 object-cover"
                                    />
                                    <div className="p-2 text-xs text-gray-500 bg-gray-50 flex items-center justify-between">
                                        <span className="capitalize font-medium">{img.type}</span>
                                        <button type="button" onClick={() => deleteExistingImage(img.id)}
                                            className="text-red-500 hover:text-red-700 text-xs">× Remove</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Add New Images */}
                <div className="bg-white rounded-xl shadow p-8">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h2 className="text-lg font-semibold">Add New Images</h2>
                        <label className="text-sm text-blue-600 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50 cursor-pointer">
                            + Add Images
                            <input type="file" accept="image/*" multiple onChange={addImage} className="hidden" />
                        </label>
                    </div>
                    {newImages.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No new images selected.</p>
                    ) : (
                        <div className="space-y-3">
                            {newImages.map((img, i) => (
                                <div key={i} className="grid grid-cols-12 gap-3 items-center border rounded-lg p-3 bg-gray-50">
                                    <div className="col-span-2">
                                        <img src={URL.createObjectURL(img.file)} alt="preview" className="w-full h-14 object-cover rounded" />
                                    </div>
                                    <div className="col-span-3">
                                        <select value={img.type} onChange={setNewImageField(i, 'type')}
                                            className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                            {IMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-6">
                                        <input value={img.caption} onChange={setNewImageField(i, 'caption')}
                                            placeholder="Caption (optional)"
                                            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button type="button" onClick={() => removeNewImage(i)} className="text-red-400 hover:text-red-600 text-xl">×</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button type="submit" disabled={loading}
                        className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    <Link to={`/cfd/${slug}/geometries/${geometryId}/simulations/${simulationId}`}
                        className="border px-8 py-2 rounded-lg text-gray-600 hover:bg-gray-50">
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    )
}
