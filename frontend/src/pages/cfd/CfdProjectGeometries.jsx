import { useState, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

const FILE_ICONS = {
    stl: '🔷',
    obj: '🟦',
    step: '⚙️',
    stp: '⚙️',
    iges: '📐',
    igs: '📐',
}

export default function CfdProjectGeometries() {
    const { slug } = useParams()
    const { token, user } = useAuthStore()
    const queryClient = useQueryClient()
    const fileRef = useRef()
    const previewRef = useRef()

    const [form, setForm] = useState({ name: '', description: '' })
    const [files, setFiles] = useState({ geometry_file: null, preview_image: null })
    const [errors, setErrors] = useState({})
    const [showForm, setShowForm] = useState(false)

    // Fetch project info
    const { data: project } = useQuery({
        queryKey: ['cfd-project', slug],
        queryFn: async () => {
            const { data } = await api.get(`/cfd-projects/${slug}`)
            return data.data
        },
    })

    // Fetch geometries
    const { data: geometries, isLoading } = useQuery({
        queryKey: ['geometries', slug],
        queryFn: async () => {
            const { data } = await api.get(`/cfd-projects/${slug}/geometries`)
            return data.data
        },
    })

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: async () => {
            const formData = new FormData()
            formData.append('name', form.name)
            if (form.description) formData.append('description', form.description)
            formData.append('geometry_file', files.geometry_file)
            if (files.preview_image) formData.append('preview_image', files.preview_image)

            const { data } = await api.post(`/cfd-projects/${slug}/geometries`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            })
            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['geometries', slug])
            setForm({ name: '', description: '' })
            setFiles({ geometry_file: null, preview_image: null })
            setErrors({})
            setShowForm(false)
        },
        onError: (err) => {
            setErrors(err.response?.data?.errors || { general: 'Upload failed.' })
        },
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (geometryId) => {
            await api.delete(`/cfd-projects/${slug}/geometries/${geometryId}`)
        },
        onSuccess: () => queryClient.invalidateQueries(['geometries', slug]),
    })

    const handleSubmit = (e) => {
        e.preventDefault()
        if (!files.geometry_file) {
            setErrors({ geometry_file: ['Please select a geometry file.'] })
            return
        }
        uploadMutation.mutate()
    }

    const isOwner = user?.id === project?.author?.id

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                <Link to="/" className="hover:text-blue-600">Projects</Link>
                <span>/</span>
                <Link to={`/cfd/${slug}`} className="hover:text-blue-600">{project?.title ?? slug}</Link>
                <span>/</span>
                <span className="text-gray-800 font-medium">Geometries</span>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Geometries</h1>
                {token && isOwner && (
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                    >
                        {showForm ? 'Cancel' : '+ Upload Geometry'}
                    </button>
                )}
            </div>

            {/* Upload Form */}
            {showForm && (
                <form
                    onSubmit={handleSubmit}
                    className="bg-white rounded-xl shadow p-6 mb-8 space-y-4"
                >
                    <h2 className="text-lg font-semibold border-b pb-2">Upload New Geometry</h2>

                    {errors.general && (
                        <p className="text-red-500 bg-red-50 border border-red-200 rounded-lg px-4 py-2 text-sm">
                            {errors.general}
                        </p>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                            placeholder="e.g. Ahmed Body, FSAE Car, NACA 0012"
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            rows={3}
                            placeholder="Describe the geometry..."
                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Geometry File */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Geometry File <span className="text-red-500">*</span>
                            </label>
                            <input
                                ref={fileRef}
                                type="file"
                                accept=".glb,.stl,.obj,.step,.stp,.iges,.igs"
                                onChange={(e) => setFiles({ ...files, geometry_file: e.target.files[0] })}
                                className="w-full border rounded-lg px-4 py-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                            />
                            {files.geometry_file && (
                                <p className="text-xs text-green-600 mt-1">✅ {files.geometry_file.name}</p>
                            )}
                            {errors.geometry_file && (
                                <p className="text-red-500 text-xs mt-1">{errors.geometry_file[0]}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">Accepted: STL, OBJ, STEP, IGES (max 50MB)</p>
                        </div>

                        {/* Preview Image */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Preview Image <span className="text-gray-400">(optional)</span>
                            </label>
                            <input
                                ref={previewRef}
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp"
                                onChange={(e) => setFiles({ ...files, preview_image: e.target.files[0] })}
                                className="w-full border rounded-lg px-4 py-2 text-sm text-gray-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100"
                            />
                            {files.preview_image && (
                                <p className="text-xs text-green-600 mt-1">✅ {files.preview_image.name}</p>
                            )}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={uploadMutation.isPending}
                        className="bg-blue-600 text-white px-8 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {uploadMutation.isPending ? 'Uploading...' : 'Upload Geometry'}
                    </button>
                </form>
            )}

            {/* Geometries List */}
            {isLoading && <p className="text-gray-500">Loading geometries...</p>}

            {!isLoading && geometries?.length === 0 && (
                <div className="text-center py-16 text-gray-400">
                    <p className="text-4xl mb-4">📐</p>
                    <p>No geometries uploaded yet.</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {geometries?.map((geo) => (
                    <div key={geo.id} className="bg-white rounded-xl shadow overflow-hidden">

                        {/* Preview */}
                        {geo.preview_image ? (
                            <img
                                src={geo.preview_image}
                                alt={geo.name}
                                className="w-full h-40 object-cover"
                            />
                        ) : (
                            <div className="w-full h-40 bg-gray-50 flex items-center justify-center text-5xl">
                                {FILE_ICONS[geo.file_type] ?? '📁'}
                            </div>
                        )}

                        {/* Info */}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-semibold text-lg">{geo.name}</h3>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full uppercase font-mono">
                                    {geo.file_type}
                                </span>
                            </div>

                            {geo.description && (
                                <p className="text-gray-500 text-sm mb-3 line-clamp-2">{geo.description}</p>
                            )}

                            <div className="flex items-center justify-between text-xs text-gray-400">
                                <span>📦 {geo.file_size_mb}</span>
                                <span>{geo.created_at?.split(' ')[0]}</span>
                            </div>

                            <div className="flex items-center gap-2 mt-4">
                                <Link
                                    to={`/cfd/${slug}/geometries/${geo.id}/simulations`}
                                    className="flex-1 text-center text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700"
                                >
                                    🔬 Simulations
                                </Link>
                                <a
                                    href={geo.geometry_file}
                                    download
                                    className="text-sm border border-blue-300 text-blue-600 px-3 py-1.5 rounded-lg hover:bg-blue-50"
                                >
                                    ⬇️
                                </a>
                                {token && isOwner && (
                                    <button
                                        onClick={() => {
                                            if (confirm('Delete this geometry?')) deleteMutation.mutate(geo.id)
                                        }}
                                        className="text-sm border border-red-200 text-red-500 px-3 py-1.5 rounded-lg hover:bg-red-50"
                                    >
                                        🗑️
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
