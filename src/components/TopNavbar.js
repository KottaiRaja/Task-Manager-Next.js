'use client'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [username, setUsername] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('username') || 'User'
    setUsername(storedUser)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    window.location.href = '/login'
  }

  return (
    <nav className="flex justify-between items-center p-4 bg-gray-900 text-white">
      <div className="font-bold text-xl"></div>
      <div className="flex items-center gap-4">
        <span className="text-sm">Hello, {username}</span>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}
