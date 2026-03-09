import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'

const PROJECT_TYPES = ['master', 'phd', 'paper', 'article']

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
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
                <option value="">Select...</option>
                {options.map((o) => (
                    <option key={o} value={o} className="capitalize">{o}</option>
                ))}
            </select>
            {error && <p className="text-red-500 text-xs mt-1">{error[0]}</p>}
        </div>
    )
}

export default function ProjectCreate() {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})
    const [form, setForm] = useState({
        title: '',
        description: '',
        project_type: '',
        publication_year: new Date().getFullYear(),
        external_link: '',
        pdf_file: null,
        status: 'draft',
    })

    const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
    const handleFile = (e) => {
    setForm((prev) => ({ ...prev, pdf_file: e.target.files[0] }))
}

    const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
        const formData = new FormData()
        Object.entries(form).forEach(([key, value]) => {
            if (value !== null && value !== '') {
                formData.append(key, value)
            }
        })
        const { data } = await api.post('/projects', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        navigate(`/projects/${data.data.slug}`)
    } catch (err) {
        setErrors(err.response?.data?.errors || { general: 'Something went wrong.' })
    } finally {
        setLoading(false)
    }
}

    return (
        <div className="max-w-3xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">New Academic Project</h1>

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
                            rows={6}
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description[0]}</p>}
                    </div>
                </div>

                {/* Project Details */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold border-b pb-2">Project Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Select label="Project Type" field="project_type" options={PROJECT_TYPES} required value={form.project_type} onChange={set('project_type')} error={errors.project_type} />
                        <Field label="Publication Year" field="publication_year" type="number" value={form.publication_year} onChange={set('publication_year')} error={errors.publication_year} />
                        <div className="md:col-span-2">
                            <Field label="External Link (URL)" field="external_link" type="url" value={form.external_link} onChange={set('external_link')} error={errors.external_link} />
                        </div>
                    </div>
                </div>
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        PDF File
                    </label>
                    <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFile}
                        className="w-full border rounded-lg px-4 py-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                    {form.pdf_file && (
                        <p className="text-xs text-green-600 mt-1">✅ {form.pdf_file.name}</p>
                    )}
                    {errors.pdf_file && <p className="text-red-500 text-xs mt-1">{errors.pdf_file[0]}</p>}
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <div className="flex gap-4">
                        {['draft', 'published', 'archived'].map((s) => (
                            <label key={s} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="status"
                                    value={s}
                                    checked={form.status === s}
                                    onChange={set('status')}
                                    className="text-indigo-600 focus:ring-indigo-500"
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
                        className="bg-indigo-600 text-white px-8 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Project'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/projects')}
                        className="border px-8 py-2 rounded-lg text-gray-600 hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    )
}
