import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState, useEffect } from 'react'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function ProjectDetail() {
    const { slug } = useParams()
    const { user } = useAuthStore()
    const [pdfBlobUrl, setPdfBlobUrl] = useState(null)

    const { data, isLoading, isError } = useQuery({
        queryKey: ['project', slug],
        queryFn: async () => {
            const { data } = await api.get(`/projects/${slug}`)
            return data.data
        },
    })

    // Fetch PDF as base64 via Axios — IDM doesn't intercept JSON responses
    // The data URL is set directly as iframe src (no blob conversion needed)
    useEffect(() => {
        if (!data?.id || !data?.pdf_file) return
        api.get(`/projects/${data.id}/pdf`)
            .then(res => {
                setPdfBlobUrl(res.data.data) // data:application/pdf;base64,...
            })
            .catch(err => {
                console.error('PDF load error:', err)
                setPdfBlobUrl(null)
            })
    }, [data?.id])

    if (isLoading) return <p className="p-8 text-gray-500">Loading...</p>
    if (isError) return <p className="p-8 text-red-500">Project not found.</p>

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            <Link to="/projects" className="text-indigo-600 hover:underline text-sm mb-6 inline-block">
                ← Back to projects
            </Link>

            {/* Header */}
            <div className="bg-white rounded-xl shadow p-8 mb-6">
                <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium uppercase">
                        {data.project_type}
                    </span>
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
                        {data.publication_year}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${data.status === 'published' ? 'bg-green-100 text-green-700' :
                        data.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                        {data.status}
                    </span>
                </div>
                <div className="flex items-start justify-between mb-4">
                    <h1 className="text-3xl font-bold">{data.title}</h1>
                    {user?.id === data.user?.id && (
                        <Link
                            to={`/projects/${data.slug}/edit`}
                            className="text-sm bg-gray-50 text-indigo-600 border border-indigo-200 px-4 py-2 rounded-lg hover:bg-indigo-50 transition"
                        >
                            ✏️ Edit Project
                        </Link>
                    )}
                </div>
                <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{data.description}</p>
            </div>

            {/* Info Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Type', value: data.project_type?.toUpperCase() },
                    { label: 'Year', value: data.publication_year },
                    { label: 'Views', value: data.views_count },
                ].map((item) => (
                    <div key={item.label} className="bg-white rounded-xl shadow p-4 text-center">
                        <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                        <p className="font-semibold">{item.value ?? '—'}</p>
                    </div>
                ))}
            </div>

            {/* Project Materials (PDF) */}
            {data.pdf_file && (
                <div className="bg-white rounded-xl shadow p-8 mb-6">
                    <h2 className="text-xl font-bold mb-4">Project Document</h2>
                    <div className="w-full mb-6 border rounded-lg overflow-hidden bg-gray-100" style={{ height: '600px' }}>
                        {pdfBlobUrl ? (
                            <iframe
                                src={pdfBlobUrl}
                                title="Project PDF"
                                className="w-full h-full"
                                style={{ border: 'none' }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                                Loading PDF preview...
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {pdfBlobUrl && (
                            <button
                                onClick={() => {
                                    // Browsers block new-tab navigation to data: URLs — convert to blob: first
                                    fetch(pdfBlobUrl)
                                        .then(r => r.blob())
                                        .then(blob => {
                                            const url = URL.createObjectURL(blob)
                                            window.open(url, '_blank')
                                        })
                                }}
                                className="inline-flex items-center gap-2 text-indigo-600 font-medium hover:bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 transition"
                            >
                                🔍 View Fullscreen
                            </button>
                        )}
                        {pdfBlobUrl && (
                            <button
                                onClick={() => {
                                    fetch(pdfBlobUrl)
                                        .then(r => r.blob())
                                        .then(blob => {
                                            const url = URL.createObjectURL(blob)
                                            const a = document.createElement('a')
                                            a.href = url
                                            a.download = `${data.title || 'document'}.pdf`
                                            a.click()
                                            URL.revokeObjectURL(url)
                                        })
                                }}
                                className="inline-flex items-center gap-2 bg-indigo-600 text-white font-medium hover:bg-indigo-700 px-4 py-2 rounded-lg transition"
                            >
                                📥 Download PDF
                            </button>
                        )}
                    </div>
                </div>
            )}



            {/* Links */}
            {data.external_link && (
                <div className="bg-white rounded-xl shadow p-8 mb-6">
                    <h2 className="text-xl font-bold mb-4">External Resources</h2>
                    <a
                        href={data.external_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline break-all"
                    >
                        {data.external_link}
                    </a>
                </div>
            )}

            {/* Author */}
            {data.user && (
                <div className="bg-white rounded-xl shadow p-6 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                        {data.user.name[0]}
                    </div>
                    <div>
                        <p className="font-semibold">{data.user.name}</p>
                        <p className="text-sm text-gray-400">Project Author</p>
                    </div>
                </div>
            )}
        </div>
    )
}
