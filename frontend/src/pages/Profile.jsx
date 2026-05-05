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
            return data.user
        },
    })

    const { data: myCfdProjects, isLoading: loadingCfdProjects } = useQuery({
        queryKey: ['my-cfd-projects'],
        queryFn: async () => {
            const { data } = await api.get('/cfd-projects/mine')
            return data.data
        },
    })

    const { data: myProjects, isLoading: loadingProjects } = useQuery({
        queryKey: ['my-projects'],
        queryFn: async () => {
            const { data } = await api.get('/projects/mine')
            return data.data
        },
    })

    useEffect(() => {
        if (user) setAuth(user, localStorage.getItem('token'))
    }, [user])

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    )

    return (
        <div className="min-h-screen bg-slate-50/50 pb-12">
            {/* Header Area with subtle gradient background */}
            <div className="bg-gradient-to-br from-blue-50 via-indigo-50/30 to-purple-50 pt-16 pb-24 border-b border-indigo-100/50">
                <div className="max-w-6xl mx-auto px-6">
                    <h1 className="text-4xl font-extrabold text-slate-800 tracking-tight">Creator Studio</h1>
                    <p className="text-slate-500 mt-2 text-lg">Manage your profile, CFD simulations, and academic projects.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-6 -mt-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Left Sidebar: Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-900/5 border border-white/60 p-8 flex flex-col items-center text-center relative overflow-hidden group">
                            {/* Decorative background blob */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-400/10 rounded-full blur-3xl group-hover:bg-indigo-400/20 transition-all duration-700"></div>
                            
                            <div className="relative mb-6">
                                {/* Animated gradient border ring */}
                                <div className="absolute inset-[-4px] rounded-full bg-gradient-to-tr from-blue-500 via-indigo-500 to-purple-500 animate-spin-slow opacity-70"></div>
                                <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-indigo-600 font-black text-4xl relative z-10 shadow-sm border-2 border-white">
                                    {user?.name?.[0]?.toUpperCase()}
                                </div>
                            </div>

                            <h2 className="text-2xl font-bold text-slate-800 mb-1">{user?.name}</h2>
                            <p className="text-slate-500 text-sm mb-4">{user?.email}</p>
                            
                            {user?.university && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold mb-3">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /></svg>
                                    {user.university}
                                </span>
                            )}
                            
                            {user?.bio && (
                                <p className="text-slate-600 text-sm leading-relaxed mb-6">{user.bio}</p>
                            )}

                            <div className="flex flex-wrap justify-center gap-2 mt-auto w-full pt-4 border-t border-slate-100">
                                {user?.roles?.map((role) => (
                                    <span key={role.name} className="px-3 py-1 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold shadow-md shadow-blue-500/20">
                                        {role.name.toUpperCase()}
                                    </span>
                                ))}
                                {(!user?.roles || user.roles.length === 0) && (
                                    <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold">
                                        USER
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Content: Projects & CFD */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* CFD Projects Section */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/40 border border-white/60 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800">CFD Projects</h2>
                                </div>
                                <Link to="/cfd/create" className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-md shadow-blue-500/20 transition-all hover:-translate-y-0.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                    New
                                </Link>
                            </div>

                            {loadingCfdProjects ? (
                                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div></div>
                            ) : myCfdProjects?.length === 0 ? (
                                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                    <div className="w-12 h-12 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                                    </div>
                                    <p className="text-slate-500 font-medium">No CFD projects yet.</p>
                                    <p className="text-slate-400 text-sm mt-1">Start your first simulation project to see it here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {myCfdProjects?.map((cfd_project) => (
                                        <Link to={`/cfd/${cfd_project.slug}`} key={cfd_project.id} className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-blue-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors mb-2 pr-6 truncate">{cfd_project.title}</h3>
                                            <div className="flex gap-2">
                                                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                                    {cfd_project.software}
                                                </span>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${cfd_project.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {cfd_project.status}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Academic Projects Section */}
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl shadow-slate-200/40 border border-white/60 p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-800">Academic Projects</h2>
                                </div>
                                <Link to="/projects/create" className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-md shadow-indigo-500/20 transition-all hover:-translate-y-0.5">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"/></svg>
                                    New
                                </Link>
                            </div>

                            {loadingProjects ? (
                                <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div></div>
                            ) : myProjects?.length === 0 ? (
                                <div className="text-center py-12 px-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50">
                                    <div className="w-12 h-12 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5L18.5 8H20" /></svg>
                                    </div>
                                    <p className="text-slate-500 font-medium">No academic projects yet.</p>
                                    <p className="text-slate-400 text-sm mt-1">Publish your research or thesis here.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {myProjects?.map((project) => (
                                        <Link to={`/projects/${project.slug}`} key={project.id} className="group p-5 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-indigo-100 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors mb-2 pr-6 truncate">{project.title}</h3>
                                            <div className="flex gap-2">
                                                <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                                    {project.project_type}
                                                </span>
                                                <span className={`text-xs font-semibold px-2 py-1 rounded-md ${project.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                                                    {project.status}
                                                </span>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
            
            {/* Custom animation style for spinning gradient ring */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin-slow {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                .animate-spin-slow {
                    animation: spin-slow 6s linear infinite;
                }
            `}} />
        </div>
    )
}