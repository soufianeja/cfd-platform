import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

export default function Profile() {
    const { setAuth } = useAuthStore()

    const { data: user, isLoading } = useQuery({
        queryKey: ['me'],
        queryFn: async () => {
            const { data } = await api.get('/me')
            console.log(data)
            return data.user
        },
    })

    const { data: myProjects, isLoading: loadingProjects } = useQuery({
        queryKey: ['my-cfd-projects'],
        queryFn: async () => {
            const { data } = await api.get('/cfd-projects/mine')
            return data.data
        },
    })

    useEffect(() => {
        if (user) setAuth(user, localStorage.getItem('token'))
    }, [user])

    if (isLoading) return <p className="p-8 text-gray-500">Loading profile...</p>

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">

            {/* Profile Card */}
            <div className="bg-white rounded-xl shadow p-8 mb-8 flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-3xl flex-shrink-0">
                    {user?.name?.[0]?.toUpperCase()}
                </div>
                <div>
                    <h1 className="text-2xl font-bold">{user?.name}</h1>
                    <p className="text-gray-500 text-sm">{user?.email}</p>
                    {user?.university && (
                        <p className="text-gray-400 text-sm mt-1">🎓 {user.university}</p>
                    )}
                    {user?.bio && (
                        <p className="text-gray-600 text-sm mt-2">{user.bio}</p>
                    )}
                    <div className="flex gap-2 mt-3 flex-wrap">
                        {user?.roles?.map((role) => (
                            <span key={role.name} className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
                                {role.name}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* My Projects */}
            <div className="bg-white rounded-xl shadow p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">My CFD Projects</h2>
                    <Link to="/cfd/create" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">+ New Project</Link>
                </div>

                {loadingProjects && <p className="text-gray-500 text-sm">Loading projects...</p>}

                {myProjects?.length === 0 && (
                    <p className="text-gray-400 text-sm">No projects yet. Create your first one!</p>
                )}

                <div className="space-y-4">
                    {myProjects?.map((project) => (
                        <div key={project.id} className="border rounded-lg p-4 flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold">{project.title}</h3>
                                <div className="flex gap-2 mt-1">
                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                                        {project.software}
                                    </span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full ${project.status === 'published'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                        }`}>
                                        {project.status}
                                    </span>
                                </div>
                            </div>
                            <Link
                                to={`/cfd/${project.slug}`}
                                className="text-blue-600 text-sm hover:underline"
                            >
                                View →
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}