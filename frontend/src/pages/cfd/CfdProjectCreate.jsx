import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const SOFTWARE_OPTIONS = ['OpenFOAM', 'ANSYS Fluent', 'STAR-CCM+', 'SU2', 'COMSOL', 'Other']
const SIMULATION_TYPES = ['internal', 'external', 'multiphase', 'heat_transfer', 'combustion', 'acoustics', 'other']
const TURBULENCE_MODELS = ['k-epsilon', 'k-omega', 'k-omega SST', 'Spalart-Allmaras', 'LES', 'DNS', 'Laminar']

function Field({ label, field, type = 'text', required = false, value, onChange, error }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                type={type}
                value={value}
                onChange={onChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
        </div>
    )
}

function Select({ label, field, options, required = false, value, onChange, error }) {
    return (
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <select
                value={value}
                onChange={onChange}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select...</option>
                {options.map((o) => (
                    <option key={o} value={o}>{o}</option>
                ))}
            </select>
            {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
        </div>
    )
}

export default function CfdProjectCreate() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [form, setForm] = useState({
        title: '',
        description: '',
        software: '',
        solver: '',
        mesh_cells: '',
        reynolds_number: '',
        turbulence_model: '',
        simulation_type: '',
        results_summary: '',
        status: 'draft',
    })

    const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setErrors({})
        try {
            const { data } = await api.post('/cfd-projects', form)
            navigate(`/cfd/${data.data.slug}`)
        } catch (err) {
            setErrors(err.response?.data?.errors || { general: 'Something went wrong.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">New CFD Project</h1>

            {errors.general && (
                <p className="text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-6">
                    {errors.general}
                </p>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-8 space-y-6">

                {/* Basic Info */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Basic Info</h2>
                    <Field label="Title" field="title" required value={form.title} onChange={set('title')} error={errors.title} />
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={form.description}
                            onChange={set('description')}
                            rows={4}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>}
                    </div>
                </div>

                {/* Simulation Details */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Simulation Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="Software" field="software" options={SOFTWARE_OPTIONS} required value={form.software} onChange={set('software')} error={errors.software} />
                        <Select label="Simulation Type" field="simulation_type" options={SIMULATION_TYPES} required value={form.simulation_type} onChange={set('simulation_type')} error={errors.simulation_type} />
                        <Select label="Turbulence Model" field="turbulence_model" options={TURBULENCE_MODELS} value={form.turbulence_model} onChange={set('turbulence_model')} error={errors.turbulence_model} />
                        <Field label="Solver" field="solver" value={form.solver} onChange={set('solver')} error={errors.solver} />
                        <Field label="Mesh Cells" field="mesh_cells" type="number" value={form.mesh_cells} onChange={set('mesh_cells')} error={errors.mesh_cells} />
                        <Field label="Reynolds Number" field="reynolds_number" type="number" value={form.reynolds_number} onChange={set('reynolds_number')} error={errors.reynolds_number} />
                    </div>
                </div>

                {/* Results */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Results</h2>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Results Summary</label>
                        <textarea
                            value={form.results_summary}
                            onChange={set('results_summary')}
                            rows={4}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex gap-4">
                        {['draft', 'published'].map((s) => (
                            <label key={s} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
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

                {/* Submit */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Project'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="border px-8 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}