import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'

const FILE_ICONS = { stl: '🔷', obj: '🟦', step: '⚙️', stp: '⚙️', iges: '📐', igs: '📐' }
const FILE_TYPES = ['stl', 'obj', 'step', 'stp', 'iges', 'igs']

export default function GeometryStore() {
    const [search, setSearch] = useState('')
    const [type, setType] = useState('')
    const [page, setPage] = useState(1)

    const { data, isLoading } = useQuery({
        queryKey: ['geometry-store', search, type, page],
        queryFn: async () => {
            const params = new URLSearchParams()
            if (search) params.set('search', search)
            if (type) params.set('type', type)
            params.set('page', page)
            const { data } = await api.get(`/geometries?${params}`)
            return data
        },
        keepPreviousData: true,
    })

    const geometries = data?.data ?? []
    const meta = data?.meta ?? {}

    const handleSearch = (e) => { setSearch(e.target.value); setPage(1) }
    const handleType = (t) => { setType(prev => prev === t ? '' : t); setPage(1) }

    return (
        <div className="max-w-6xl mx-auto px-4 py-10">

            {/* Header */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold mb-2">Geometry Store</h1>
                <p className="text-gray-500">Browse all CFD geometry files from across the platform.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-8 items-center">
                <input
                    type="text"
                    value={search}
                    onChange={handleSearch}
                    placeholder="🔍  Search geometries..."
                    className="flex-1 min-w-[220px] border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white shadow-sm"
                />
                <div className="flex gap-2 flex-wrap">
                    {FILE_TYPES.map(t => (
                        <button
                            key={t}
                            onClick={() => handleType(t)}
                            className={`text-xs px-3 py-1.5 rounded-full border font-mono uppercase transition ${type === t
                                    ? 'bg-blue-600 text-white border-blue-600'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                                }`}
                        >
                            {t}
                        </button>
                    ))}
                    {type && (
                        <button onClick={() => { setType(''); setPage(1) }} className="text-xs text-gray-400 px-2 hover:text-gray-600">
                            ✕ Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Results count */}
            {meta.total != null && (
                <p className="text-sm text-gray-400 mb-4">{meta.total} geometr{meta.total === 1 ? 'y' : 'ies'} found</p>
            )}

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-white rounded-xl shadow animate-pulse h-64" />
                    ))}
                </div>
            ) : geometries.length === 0 ? (
                <div className="text-center py-24 text-gray-400">
                    <p className="text-5xl mb-4">📭</p>
                    <p className="text-lg font-medium">No geometries found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {geometries.map(geo => (
                        <div key={geo.id} className="bg-white rounded-xl shadow overflow-hidden hover:shadow-md transition group">

                            {/* Preview */}
                            {geo.preview_image ? (
                                <img
                                    src={geo.preview_image}
                                    alt={geo.name}
                                    className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-44 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-5xl">
                                    {FILE_ICONS[geo.file_type] ?? '📁'}
                                </div>
                            )}

                            {/* Info */}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate">{geo.name}</h3>
                                    <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded font-mono uppercase shrink-0">
                                        {geo.file_type}
                                    </span>
                                </div>

                                {geo.description && (
                                    <p className="text-gray-400 text-xs line-clamp-2 mb-2">{geo.description}</p>
                                )}

                                {geo.project && (
                                    <Link
                                        to={`/cfd/${geo.project.slug}`}
                                        className="text-xs text-blue-500 hover:underline block mb-3 truncate"
                                    >
                                        📂 {geo.project.title}
                                    </Link>
                                )}

                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400">{geo.file_size_mb}</span>
                                    <a
                                        href={geo.geometry_file}
                                        download
                                        className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        ⬇️ Download
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {meta.last_page > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                    >
                        ← Prev
                    </button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                        Page {meta.current_page} of {meta.last_page}
                    </span>
                    <button
                        onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                        disabled={page === meta.last_page}
                        className="px-4 py-2 border rounded-lg text-sm disabled:opacity-40 hover:bg-gray-50"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    )
}
