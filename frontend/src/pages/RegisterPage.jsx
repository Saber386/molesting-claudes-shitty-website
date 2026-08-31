import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import client from '../api/client'

export default function RegisterPage({ onRegister }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', fullName: '' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await client.post('/auth/register', formData)
      onRegister(response.data.token, response.data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Register</h2>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" placeholder="Full Name" value={formData.fullName} onChange={(e) => setFormData({...formData, fullName: e.target.value})} className="w-full border rounded px-3 py-2" required />
          <input type="text" placeholder="Username" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} className="w-full border rounded px-3 py-2" required />
          <input type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full border rounded px-3 py-2" required />
          <input type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full border rounded px-3 py-2" required />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Register</button>
        </form>
        <p className="text-center mt-4"><Link to="/login" className="text-blue-600 hover:underline">Already have account?</Link></p>
      </div>
    </div>
  )
}
