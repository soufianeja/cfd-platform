import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../api/axios'
import useAuthStore from '../../store/authStore'

export default function Register() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [form, setForm] = useState({ name: '', email: '', password: '', password_confirmation: '' })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    try {
      const { data } = await api.post('/register', form)
      setAuth(data.user, data.token)
      navigate('/')
    } catch (err) {
      setErrors(err.response?.data?.errors || { general: 'Registration failed.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Register</h1>
        {errors.general && <p className="text-red-500 text-sm mb-4">{errors.general}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          {['name', 'email', 'password', 'password_confirmation'].map((field) => (
            <div key={field}>
              <input
                type={field.includes('password') ? 'password' : 'text'}
                placeholder={field.replace('_', ' ')}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {errors[field] && <p className="text-red-500 text-xs mt-1">{errors[field][0]}</p>}
            </div>
          ))}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm mt-4">
          Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
        </p>
      </div>
    </div>
  )
}