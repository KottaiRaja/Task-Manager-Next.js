'use client'
import { useEffect, useState } from 'react'
import { User } from 'lucide-react';
import { useSelector } from 'react-redux';

export default function Navbar() {
  const [username, setUsername] = useState('')
  const [profileImage, setProfileImage] = useState('')

  useEffect(() => {
    const storedUser = localStorage.getItem('username') || 'User'
    const storedImageUrl = localStorage.getItem('imageUrl') || ''
    setUsername(storedUser)
    setProfileImage(storedImageUrl)
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
        {profileImage ? (
          <img
            src={profileImage}
            alt={username}
            className="w-10 h-10 rounded-full object-cover border border-gray-600"
          />
        ) : (
          <div className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-full border border-gray-600">
            <User className="w-5 h-5 text-gray-300" />
          </div>
        )}
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
