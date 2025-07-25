'use client'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function UserList() {
  const [users, setUsers] = useState([])
  const [page, setPage] = useState(1)
  const [limit] = useState(15)
  const [total, setTotal] = useState(0)

    useEffect(() => {
    const role = JSON.parse(localStorage.getItem('role'));

    if (!role || !['admin'].includes(role)) {
      router.push('/alltask');
    }
  }, []);

  useEffect(() => {
    fetch(`/api/users?page=${page}&limit=${limit}`)
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.users)) {
          setUsers(data.users)
          setTotal(data.total || 0)
        } else {
          setUsers([])
          setTotal(0)
        }
      })
      .catch(err => {
        console.error('Failed to fetch users:', err)
        setUsers([])
        setTotal(0)
      })
  }, [page, limit])

  const totalPages = Math.ceil(total / limit)

  const handleDelete = async (e, id) => {
    e.preventDefault()
    if (confirm('Are you sure you want to delete this user?')) {
      await fetch(`/api/users/${id}`, {
        method: 'DELETE',
      })
      setUsers(prev => prev.filter(user => user._id !== id))
    }
  }


    const router = useRouter()
  const pathname = usePathname()

  const isUserList = pathname === '/user/list'
  const isCreateUser = pathname === '/user/create'

  return (
    <div>
      <div className="flex gap-2">
        <button
          className={`px-4 py-2 rounded text-white transition ${isUserList ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-800'
            }`}
          onClick={() => router.push('/user/list')}
        >
          All Users
        </button>
        <button
          className={`px-4 py-2 rounded text-white transition ${isCreateUser ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-800'
            }`}
          onClick={() => router.push('/user/create')}
        >
          Create User
        </button>
      </div>

      <table className="w-full text-left border-collapse text-sm mb-4">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-2 text-white">Name</th>
            <th className="p-2 text-white">Email</th>
            <th className="p-2 text-white">Role</th>
            <th className="p-2 text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-2 text-center text-gray-400">No users found.</td>
            </tr>
          ) : (
            users.map(user => (
              <tr key={user._id} className="border-b border-gray-800 hover:bg-gray-700">
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

      <div className="flex flex-col md:flex-row justify-center items-center text-white gap-4 mt-6">
        <div className="flex justify-center mt-6">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => setPage(prev => Math.max(prev - 1, 1))}
              disabled={page === 1}
              className={`px-3 py-1 rounded ${page === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-gray-600 text-white'}`}
            >
              &lt;
            </button>

            {/* Pagination buttons */}
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
    </div>
  )
}
