'use client'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import {
  fetchUsers,
  fetchUserById,
  createUser,
  updateUser,
  deleteUser,
  clearCurrentUser, 
  RoleOfUsers // ✅ correct name
} from '@/redux/features/userSlice'

export default function UserForm() {
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const userId = searchParams.get('id')

  const { users, currentUser } = useSelector((state) => state.users)
  console.log('Current User:', currentUser, users)
  const isEdit = Boolean(userId)
  const isUserList = pathname === '/user/list'
  const isCreateUser = pathname === '/user/create'
  const isEditUser = pathname === '/user/edit'

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    assignedUser: [],
  })

  useEffect(() => {
    dispatch(fetchUsers())
  }, [dispatch])

  useEffect(() => {
    dispatch(RoleOfUsers())

  }, [dispatch])

  useEffect(() => {
    if (isEdit) dispatch(fetchUserById(userId))
    else dispatch(clearCurrentUser())
  }, [isEdit, userId, dispatch])

  useEffect(() => {
    if (currentUser) {
      setFormData({
        username: currentUser.username || '',
        email: currentUser.email || '',
        role: currentUser.role || 'user',
        assignedUser: currentUser.assignedUser || [],
      })
    }
  }, [currentUser])

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === 'assignedUser') {
      if (!formData.assignedUser.includes(value)) {
        setFormData((prev) => ({
          ...prev,
          assignedUser: [...prev.assignedUser, value],
        }))
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleRemoveUser = (id) => {
    setFormData((prev) => ({
      ...prev,
      assignedUser: prev.assignedUser.filter((uid) => uid !== id),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (isEdit) {
      await dispatch(updateUser({ id: userId, user: formData }))
    } else {
      await dispatch(createUser(formData))
    }
    router.push('/user/list')
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this user?')) {
      await dispatch(deleteUser(userId))
      router.push('/user/list')
    }
  }

  return (
    <div className="flex flex-col w-full max-w-3xl">
      <div className="flex gap-2 mb-6">
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
        {isEdit && (
          <button
            className={`px-4 py-2 rounded text-white transition ${isEditUser ? 'bg-purple-600' : 'bg-gray-700 hover:bg-gray-800'}`}
            onClick={() => router.push(`/user/edit?id=${userId}`)}
          >
            Edit User
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 bg-[#1e293b] p-6 rounded-xl shadow-md">
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Enter user name"
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600"
          required
        />

        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter email"
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600"
          required
        />

        <select
          name="role"
          value={formData.role}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600"
        >
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>

        {formData.role === 'manager' && (
          <div className="w-full">
            <select
              name="assignedUser"
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600"
            >
              <option value="">Select Users</option>
              {users.map((user) => (
                <option key={user._id} value={user._id} disabled={formData.assignedUser.includes(user._id)}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2 mt-2">
              {formData.assignedUser.map((uid) => {
                const user = users.find((u) => u._id === uid)
                if (!user) return null
                return (
                  <span key={uid} className="flex items-center bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    {user.username}
                    <button type="button" onClick={() => handleRemoveUser(uid)} className="ml-2 text-white hover:text-red-300">
                      ❌
                    </button>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <div className="flex justify-between pt-4">
          <button type="button" onClick={() => router.push('/user/list')} className="text-sm text-gray-300 hover:underline">
            Cancel
          </button>

          <div className="flex gap-4">
            {isEdit && (
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            )}
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90"
            >
              {isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
