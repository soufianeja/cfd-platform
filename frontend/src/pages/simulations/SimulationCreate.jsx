import { useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import api from '../../api/axios'

const STATUSES = ['pending', 'running', 'completed', 'failed']
const IMAGE_TYPES = ['pressure', 'velocity', 'streamlines', 'mesh', 'residuals', 'temperature', 'other']
const METRIC_SUGGESTIONS = ['Cd', 'Cl', 'Cm', 'pressure_drop', 'Nu', 'velocity_max', 'Re', 'inlet_velocity', 'mass_flow_rate']

export default function SimulationCreate() {
    const { slug, geometryId } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const [form, setForm] = useState({ title: '', description: '', status: 'completed' })
    const [metrics, setMetrics] = useState([{ key: 'Cd', value: '', unit: '' }])
    const [images, setImages] = useState([])   // [{file, type, caption}]

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value })

    const addMetric = () => setMetrics([...metrics, { key: '', value: '', unit: '' }])
    const removeMetric = (i) => setMetrics(metrics.filter((_, idx) => idx !== i))
    const setMetric = (i, field) => (e) => {
        const updated = [...metrics]; updated[i][field] = e.target.value; setMetrics(updated)
    }

    const addImage = (e) => {
        const files = Array.from(e.target.files)
        setImages(prev => [...prev, ...files.map(f => ({ file: f, type: 'other', caption: '' }))])
        e.target.value = ''
    }
    const removeImage = (i) => setImages(images.filter((_, idx) => idx !== i))
    const setImageField = (i, field) => (e) => {
        const updated = [...images]; updated[i][field] = e.target.value; setImages(updated)
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
            images.forEach((img, i) => {
                fd.append('images[]', img.file)
                fd.append(`image_types[${i}]`, img.type)
                fd.append(`image_captions[${i}]`, img.caption)
            })
            const { data } = await api.post(`/geometries/${geometryId}/simulations`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            })
            navigate(`/cfd/${slug}/geometries/${geometryId}/simulations/${data.data.id}`)
        } catch (err) {
            setErrors(err.response?.data?.errors || { general: 'Something went wrong.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <Link to={`/cfd/${slug}/geometries/${geometryId}/simulations`} className="text-blue-600 hover:underline text-sm">
                ← Back to Simulations
            </Link>
            <h1 className="text-3xl font-bold mt-2 mb-8">New Simulation</h1>

            {errors.general && (
                <p className="text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">{errors.general}</p>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="bg-white rounded-xl shadow p-8 space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Basic Info</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            value={form.title}
                            onChange={set('title')}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g. NACA0012 at Re=1M"
                        />
                        {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title[0]}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={set('description')}
                            rows={3}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Describe the simulation setup, boundary conditions..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <div className="flex gap-4">
                            {STATUSES.map((s) => (
                                <label key={s} className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="radio"
                                        name="status"
                                        value={s}
                                        checked={form.status === s}
                                        onChange={set('status')}
                                        className="text-blue-600"
                                    />
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
                        <button
                            type="button"
                            onClick={addMetric}
                            className="text-sm text-blue-600 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50"
                        >
                            + Add Row
                        </button>
                    </div>
                    <div className="space-y-3">
                        {metrics.map((m, i) => (
                            <div key={i} className="grid grid-cols-12 gap-2 items-center">
                                <div className="col-span-5">
                                    <input
                                        list="metric-keys"
                                        value={m.key}
                                        onChange={setMetric(i, 'key')}
                                        placeholder="Key (e.g. Cd)"
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <datalist id="metric-keys">
                                        {METRIC_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
                                    </datalist>
                                </div>
                                <div className="col-span-4">
                                    <input
                                        type="number"
                                        step="any"
                                        value={m.value}
                                        onChange={setMetric(i, 'value')}
                                        placeholder="Value"
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        value={m.unit}
                                        onChange={setMetric(i, 'unit')}
                                        placeholder="Unit"
                                        className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div className="col-span-1 flex justify-center">
                                    {metrics.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeMetric(i)}
                                            className="text-red-400 hover:text-red-600 text-lg leading-none"
                                        >
                                            ×
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-3">Common metrics: Cd (drag), Cl (lift), Nu (Nusselt), pressure_drop…</p>
                </div>

                {/* Images */}
                <div className="bg-white rounded-xl shadow p-8">
                    <div className="flex items-center justify-between border-b pb-2 mb-4">
                        <h2 className="text-lg font-semibold">Result Images</h2>
                        <label className="text-sm text-blue-600 border border-blue-200 px-3 py-1 rounded-lg hover:bg-blue-50 cursor-pointer">
                            + Add Images
                            <input type="file" accept="image/*" multiple onChange={addImage} className="hidden" />
                        </label>
                    </div>
                    {images.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-4">No images added yet. Click "Add Images" to upload result plots.</p>
                    ) : (
                        <div className="space-y-3">
                            {images.map((img, i) => (
                                <div key={i} className="grid grid-cols-12 gap-3 items-center border rounded-lg p-3 bg-gray-50">
                                    <div className="col-span-2">
                                        <img
                                            src={URL.createObjectURL(img.file)}
                                            alt="preview"
                                            className="w-full h-14 object-cover rounded"
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <select
                                            value={img.type}
                                            onChange={setImageField(i, 'type')}
                                            className="w-full border rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        >
                                            {IMAGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-6">
                                        <input
                                            value={img.caption}
                                            onChange={setImageField(i, 'caption')}
                                            placeholder="Caption (optional)"
                                            className="w-full border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-1 flex justify-center">
                                        <button type="button" onClick={() => removeImage(i)} className="text-red-400 hover:text-red-600 text-xl">×</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
                    >
                        {loading ? 'Saving...' : 'Create Simulation'}
                    </button>
                    <Link
                        to={`/cfd/${slug}/geometries/${geometryId}/simulations`}
                        className="border px-8 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </Link>
                </div>
            </form>
        </div>
    )
}
