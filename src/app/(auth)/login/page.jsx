'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { loginUser } from '@/redux/features/authSlice'

export default function LoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const router = useRouter()
  const dispatch = useDispatch()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const result = await dispatch(loginUser(formData)).unwrap()
      localStorage.setItem('username', result.user.username)
      localStorage.setItem('role', JSON.stringify(result.user.role))
      localStorage.setItem('imageUrl', result.user.imageUrl || '')
      router.push('/insights')
    } catch (err) {
      alert(err.message || 'Login failed')
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="p-8 bg-gray-800 rounded shadow-md space-y-4 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center">Login</h2>

        <input
          name="email"
          type="email"
          placeholder="Email"
          onChange={handleChange}
          required
          className="p-2 w-full rounded bg-gray-700 text-white"
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          required
          className="p-2 w-full rounded bg-gray-700 text-white"
        />
        <button
          type="submit"
          className="bg-purple-600 px-4 py-2 rounded w-full hover:bg-purple-700 transition"
        >
          Login
        </button>

        <div className="text-sm text-center mt-4 space-y-1">
          <p>
            <a href="/forgot-password" className="text-blue-400 hover:underline">
              Forgot Password?
            </a>
          </p>
          <p>
            Don't have an account?{' '}
            <a href="/signup" className="text-green-400 hover:underline">
              Sign Up
            </a>
          </p>
        </div>
      </form>
    </div>
  )
}
