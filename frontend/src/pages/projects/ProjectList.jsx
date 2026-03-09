import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function ProjectList() {
    const [search, setSearch] = useState('')
    const [projectType, setProjectType] = useState('')

    const { data, isLoading, isError, error } = useQuery({
        queryKey: ['projects', search, projectType],
        queryFn: async () => {
            const params = {}
            if (search) params.search = search
            if (projectType) params.project_type = projectType
            const { data } = await api.get('/projects', { params })
            return data
        },
    })

    const projects = data?.data ?? []

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Academic Projects</h1>

            {/* Filters */}
            <div className="flex gap-4 mb-8">
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="border rounded-lg px-4 py-2 w-full max-w-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <select
                    value={projectType}
                    onChange={(e) => setProjectType(e.target.value)}
                    className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">All Types</option>
                    <option value="master">Master</option>
                    <option value="phd">PhD</option>
                    <option value="paper">Paper</option>
                    <option value="article">Article</option>
                </select>
            </div>

            {/* States */}
            {isLoading && <p className="text-gray-500">Loading projects...</p>}
            {isError && <p className="text-red-500">Failed to load projects. {error?.message}</p>}

            {/* Empty state */}
            {!isLoading && !isError && projects.length === 0 && (
                <p className="text-gray-500 mb-6">No projects found.</p>
            )}

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Link
                        key={project.id}
                        to={`/projects/${project.slug}`}
                        className="bg-white rounded-xl shadow hover:shadow-md transition p-6 block"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full font-medium uppercase">
                                {project.project_type}
                            </span>
                            <span className="text-xs text-gray-400">{project.publication_year}</span>
                        </div>
                        <h2 className="font-semibold text-lg mb-2 line-clamp-2">{project.title}</h2>
                        <p className="text-gray-500 text-sm line-clamp-3">{project.description}</p>
                        <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                            <span>👁 {project.views_count} views</span>
                            <span>{project.user?.name}</span>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Pagination */}
            {data?.meta && (
                <div className="mt-8 flex justify-center gap-2">
                    {data.meta.links?.map((link, i) => (
                        <button
                            key={i}
                            disabled={!link.url}
                            dangerouslySetInnerHTML={{ __html: link.label }}
                            className={`px-3 py-1 rounded border text-sm ${link.active ? 'bg-indigo-600 text-white border-indigo-600' : 'text-gray-600 hover:bg-gray-100'
                                } disabled:opacity-40`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
