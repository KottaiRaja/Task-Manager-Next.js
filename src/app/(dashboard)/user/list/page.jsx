'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { User } from 'lucide-react';
import { fetchUsers } from '@/redux/features/userSlice'
import { useDispatch, useSelector } from 'react-redux'

export default function UserList() {

  const dispatch = useDispatch()

  const { users } = useSelector(state => state.users)

  const [page, setPage] = useState(1)
  const [limit] = useState(15)
  const [total, setTotal] = useState(0)
  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' })

  const router = useRouter()
  const pathname = usePathname()

  const isUserList = pathname === '/user/list'
  const isCreateUser = pathname === '/user/create'

  


  useEffect(() => {
    const role = JSON.parse(localStorage.getItem('role'))
    if (!role || !['admin'].includes(role)) {
      router.push('/alltask')
    }
  }, [])

  useEffect(() => {
    dispatch(fetchUsers({ page, limit }))
  }, [page, limit])

  const totalPages = Math.ceil(total / limit)

  const handleDelete = async (e, id) => {
    e.preventDefault()
    if (confirm('Are you sure you want to delete this user?')) {
      const res = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        dispatch(fetchUsers({ page, limit }))
        showPopup('User deleted successfully.', 'error')
      } else {
        showPopup('Failed to delete user.', 'error')
      }
    }
  }

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type })
    setTimeout(() => {
      setPopup({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  const handleEdit = (e, id) => {
    e.preventDefault()
    router.push(`/user/edit?id=${id}`)
  }

  const activeUsers = users.filter(user => user.status === 'active')
  const pendingUsers = users.filter(user => user.status === 'pending')

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {popup.show && (
        <div className={`fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 px-6 py-4 rounded-xl shadow-xl text-white text-center min-w-[250px] ${popup.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {popup.message}
        </div>
      )}

      {/* Left - User Table */}
      <div className="w-full lg:w-2/3">
        <div className="flex gap-2 mb-4">
          <button
            className={`px-4 py-2 rounded text-white transition ${isUserList ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-800'}`}
            onClick={() => router.push('/user/list')}
          >
            All Users
          </button>
          <button
            className={`px-4 py-2 rounded text-white transition ${isCreateUser ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-800'}`}
            onClick={() => router.push('/user/create')}
          >
            Create User
          </button>
        </div>

        <table className="w-full text-left border-collapse text-sm mb-4">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="p-2 text-white">Profile</th>
              <th className="p-2 text-white">Name</th>
              <th className="p-2 text-white">Email</th>
              <th className="p-2 text-white">Role</th>
              <th className="p-2 text-white">Actions</th>
            </tr>
          </thead>
          <tbody>
            {activeUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-2 text-center text-gray-400">No active users found.</td>
              </tr>
            ) : (
              activeUsers.map(user => (
                <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-700">
                  <td className="p-2">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border border-gray-600"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-700 rounded-full border border-gray-600">
                        <User className="w-5 h-5 text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="p-2 text-white">{user.username}</td>
                  <td className="p-2 text-white">{user.email}</td>
                  <td className="p-2 text-white">
                    <span className="bg-yellow-600 text-xs rounded-full px-2 py-1">{user.role}</span>
                  </td>
                  <td className="p-2 space-x-2">
                    <Link href={`/user/edit?id=${user._id}`} className="text-blue-400">Edit</Link>
                    <button onClick={(e) => handleDelete(e, user._id)} className="text-red-500">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>


        {/* Pagination */}
        <div className="flex justify-center items-center text-white gap-4 mt-6">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 text-white'}`}
            >
              &lt;
            </button>
            {(() => {
              const pages = []
              const siblings = 1
              const showEllipsisLeft = page > 2 + siblings
              const showEllipsisRight = page < totalPages - (1 + siblings)
              pages.push(1)
              if (showEllipsisLeft) pages.push('ellipsis')
              const start = Math.max(2, page - siblings)
              const end = Math.min(totalPages - 1, page + siblings)
              for (let i = start; i <= end; i++) pages.push(i)
              if (showEllipsisRight) pages.push('ellipsis')
              if (totalPages > 1) pages.push(totalPages)

              return pages.map((item, index) =>
                item === 'ellipsis' ? (
                  <span key={`ellipsis-${index}`} className="px-2 py-1 text-gray-400">...</span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={`px-3 py-1 rounded border ${page === item
                      ? 'border-purple-600 text-purple-600 font-bold'
                      : 'border-gray-600 text-white'
                      }`}
                  >
                    {item}
                  </button>
                )
              )
            })()}
            <button
              onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
              className={`px-3 py-1 rounded ${page === totalPages ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 text-white'}`}
            >
              &gt;
            </button>
          </nav>
        </div>
      </div>

      {/* Right - Pending Users */}

      <div className="w-full lg:w-1/3 bg-gray-800 rounded p-4">
        <h2 className="text-white text-lg font-semibold mb-4">Pending Users</h2>
        {pendingUsers.length === 0 ? (
          <p className="text-gray-400 text-sm">No pending users.</p>
        ) : (
          <ul className="space-y-3">
            {pendingUsers.map(user => (
              <li key={user._id} className="bg-gray-700 rounded p-3">
                <div className="flex justify-between items-start">
                  {/* Image or Icon */}
                  <div className="flex items-start gap-3">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.username}
                        className="w-10 h-10 rounded-full object-cover border border-gray-500"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center bg-gray-600 rounded-full border border-gray-500">
                        <User className="w-5 h-5 text-gray-300" />
                      </div>
                    )}

                    {/* User Info */}
                    <div>
                      <div className="text-white font-medium">{user.username}</div>
                      <div className="text-sm text-gray-400">{user.email}</div>
                      <div className="text-xs text-yellow-400 mt-1">{user.role} - Pending</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => handleEdit(e, user._id)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                      title="Edit user"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => handleDelete(e, user._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                      title="Delete user"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  )
}
