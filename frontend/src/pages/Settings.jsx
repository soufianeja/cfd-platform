import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import api from '../api/axios'
import useAuthStore from '../store/authStore'

export default function Settings() {
    const { user, setAuth } = useAuthStore()
    const navigate = useNavigate()
    const queryClient = useQueryClient()
    
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        bio: '',
        university: '',
        password: '',
        password_confirmation: ''
    })
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || '',
                bio: user.bio || '',
                university: user.university || ''
            }))
        }
    }, [user])

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        setError('')
        
        try {
            const dataToSubmit = { ...formData }
            if (!dataToSubmit.password) {
                delete dataToSubmit.password
                delete dataToSubmit.password_confirmation
            }
            
            const response = await api.put('/me', dataToSubmit)
            
            setAuth(response.data.user, localStorage.getItem('token'))
            queryClient.invalidateQueries({ queryKey: ['me'] })
            
            setMessage('Profile updated successfully!')
            setFormData(prev => ({ ...prev, password: '', password_confirmation: '' }))
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto py-12 px-6">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">Account Settings</h1>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                {message && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg text-sm">{message}</div>}
                {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm">{error}</div>}
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        />
                    </div>
                    
                    {(!user || user.role === 'user') && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">University / Organization</label>
                                <input
                                    type="text"
                                    name="university"
                                    value={formData.university}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Bio</label>
                                <textarea
                                    name="bio"
                                    value={formData.bio}
                                    onChange={handleChange}
                                    rows="4"
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                ></textarea>
                            </div>
                        </>
                    )}

                    <div className="pt-6 mt-6 border-t border-slate-100">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Change Password</h3>
                        <p className="text-sm text-slate-500 mb-4">Leave blank if you don't want to change your password.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">New Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-1">Confirm New Password</label>
                                <input
                                    type="password"
                                    name="password_confirmation"
                                    value={formData.password_confirmation}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
