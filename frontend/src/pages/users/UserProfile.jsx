import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import api from '../../api/axios'
import FollowButton from '../../components/ui/FollowButton'
import StatCard from '../../components/ui/StatCard'

export default function UserProfile() {
    const { id } = useParams()
    const [activeTab, setActiveTab] = useState('cfd')

    // 1. Fetch User Profile & Stats
    const { data: profile, isLoading: loadingProfile } = useQuery({
        queryKey: ['user-profile', id],
        queryFn: async () => {
            const { data } = await api.get(`/users/${id}`)
            return data.data
        },
    })

    // 2. Fetch User's CFD Projects
    const { data: cfdProjects, isLoading: loadingCfd } = useQuery({
        queryKey: ['user-cfd-projects', id],
        queryFn: async () => {
            const { data } = await api.get(`/users/${id}/cfd-projects`)
            return data.data
        },
    })

    // 3. Fetch User's Academic Projects
    const { data: projects, isLoading: loadingProjects } = useQuery({
        queryKey: ['user-projects', id],
        queryFn: async () => {
            const { data } = await api.get(`/users/${id}/projects`)
            return data.data
        },
    })

    if (loadingProfile) return <p className="p-8 text-gray-500">Loading profile...</p>
    if (!profile) return <p className="p-8 text-red-500">User not found.</p>

    const user = profile.user

    return (
        <div className="max-w-5xl mx-auto px-4 py-8">
            
            {/* Header section */}
            <div className="bg-white rounded-xl shadow p-8 mb-8">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
                    <div className="flex items-center gap-6">
                        <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-4xl flex-shrink-0">
                            {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{user.name}</h1>
                            {user.university && (
                                <p className="text-gray-500 mt-1">🎓 {user.university}</p>
                            )}
                        </div>
                    </div>
                    
                    <FollowButton userId={id} isFollowing={profile.is_following} />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <StatCard label="CFD Projects" value={profile.stats?.cfd_projects_count} />
                    <StatCard label="Academic Projects" value={profile.stats?.projects_count} />
                    <StatCard label="Followers" value={profile.stats?.followers_count} />
                    <StatCard label="Following" value={profile.stats?.following_count} />
                    <StatCard label="Total Likes" value={profile.stats?.total_likes} />
                </div>
            </div>

            {/* Tabs Navigation */}
            <div className="border-b mb-6">
                <nav className="flex gap-8">
                    {['cfd', 'projects', 'about'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`pb-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                                activeTab === tab
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab === 'cfd' && 'CFD Projects'}
                            {tab === 'projects' && 'Academic Projects'}
                            {tab === 'about' && 'About'}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-6">
                
                {/* CFD Projects Tab */}
                {activeTab === 'cfd' && (
                    <div className="bg-white rounded-xl shadow p-6">
                        {loadingCfd ? (
                            <p className="text-gray-500">Loading projects...</p>
                        ) : cfdProjects?.length === 0 ? (
                            <p className="text-gray-500">No CFD projects published yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {cfdProjects.map((p) => (
                                    <Link key={p.id} to={`/cfd/${p.slug}`} className="border rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition">
                                        <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                                        <div className="flex gap-2">
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{p.software}</span>
                                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">❤️ {p.likes_count ?? 0}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Academic Projects Tab */}
                {activeTab === 'projects' && (
                    <div className="bg-white rounded-xl shadow p-6">
                        {loadingProjects ? (
                            <p className="text-gray-500">Loading projects...</p>
                        ) : projects?.length === 0 ? (
                            <p className="text-gray-500">No academic projects published yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {projects.map((p) => (
                                    <Link key={p.id} to={`/projects/${p.slug}`} className="border rounded-xl p-4 hover:border-blue-300 hover:shadow-md transition">
                                        <h3 className="font-bold text-lg mb-2">{p.title}</h3>
                                        <div className="flex gap-2">
                                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{p.project_type ?? 'Project'}</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* About Tab */}
                {activeTab === 'about' && (
                    <div className="bg-white rounded-xl shadow p-6 max-w-2xl">
                        <h2 className="text-xl font-bold mb-4">About {user.name}</h2>
                        
                        {user.bio ? (
                            <p className="text-gray-600 leading-relaxed mb-6 whitespace-pre-line">{user.bio}</p>
                        ) : (
                            <p className="text-gray-400 italic mb-6">No bio provided.</p>
                        )}

                        <div className="space-y-3">
                            {user.website && (
                                <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                                    🌐 {user.website}
                                </a>
                            )}
                            {user.github && (
                                <a href={user.github} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-gray-700 hover:text-black hover:underline">
                                    🐙 GitHub Profile
                                </a>
                            )}
                            {user.linkedin && (
                                <a href={user.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-blue-700 hover:underline">
                                    💼 LinkedIn Profile
                                </a>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
