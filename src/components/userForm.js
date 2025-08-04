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
  RoleOfUsers,
} from '@/redux/features/userSlice'

export default function UserForm() {
  const dispatch = useDispatch()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const userId = searchParams.get('id')

  const { users, currentUser, roleBasedUsers } = useSelector((state) => state.users)

  const isEdit = Boolean(userId)
  const isUserList = pathname === '/user/list'
  const isCreateUser = pathname === '/user/create'
  const isEditUser = pathname === '/user/edit'

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    role: 'user',
    assignedUser: [],
    imageUrl: '', // ✅ Added imageUrl
  })

  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' })

  useEffect(() => {
    (async () => {
      await dispatch(RoleOfUsers())
    })()
  }, [dispatch])

  useEffect(() => {
    dispatch(fetchUsers())
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
        imageUrl: currentUser.imageUrl || '',
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
      let res = await dispatch(updateUser({ id: userId, user: formData }))
      if (res.error) {
        showPopup('Failed to update user.', 'error')
        return
      }
      handleMoveBack()
      showPopup('User updated successfully.', 'success')
    } else {
      let res = await dispatch(createUser(formData))
      if (res.error) {
        showPopup('User already exists', 'error')
        return
      }
      handleMoveBack()
      showPopup('User created successfully.', 'success')
    }
  }

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this user?')) {
      await dispatch(deleteUser(userId))
      showPopup('User deleted successfully.', 'error')
      router.push('/user/list')
    }
  }

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type })
    setTimeout(() => {
      setPopup({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  const handleMoveBack = () => {
    setFormData({
      username: '',
      email: '',
      role: 'user',
      assignedUser: [],
      imageUrl: '',
    })
    dispatch(clearCurrentUser())
    router.push('/user/list')
  }

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const imageData = new FormData()
    imageData.append('file', file)

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: imageData,
      })

      const data = await res.json()
      if (res.ok) {
        setFormData((prev) => ({ ...prev, imageUrl: data.url }))
        showPopup('Image uploaded successfully', 'success')
      } else {
        showPopup(data.error || 'Upload failed', 'error')
      }
    } catch (err) {
      console.error('Upload error:', err)
      showPopup('Upload error', 'error')
    }
  }

  return (
    <div className="flex flex-col w-full max-w-3xl">
      {popup.show && (
        <div className={`fixed top-1/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 px-6 py-4 rounded-xl shadow-xl text-white text-center min-w-[250px] ${popup.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {popup.message}
        </div>
      )}

      {/* Tab Buttons */}
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

      {/* Form */}
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
              {roleBasedUsers.map((user) => (
                <option key={user._id} value={user._id} disabled={formData.assignedUser.includes(user._id)}>
                  {user.username} ({user.email})
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-2 mt-2">
              {formData.assignedUser.map((uid) => {
                const user = roleBasedUsers.find((u) => u._id === uid)
                if (!user) return null
                return (
                  <span key={uid} className="flex items-center bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
                    {user.username}
                    <button type="button" onClick={() => handleRemoveUser(uid)} className="ml-2 text-white hover:text-red-300">❌</button>
                  </span>
                )
              })}
            </div>
          </div>
        )}

        <div>
          {/* <label className="text-white mb-1 block text-sm">Upload Profile Image</label> */}
          <input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600"
          />
          {formData.imageUrl && (
            <div className="mt-3 flex justify-center">
              <img
                src={formData.imageUrl}
                alt="Profile"
                className="w-28 h-28 object-cover rounded-full border border-gray-500"
              />
            </div>
          ) }
        </div>

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          <button type="button" onClick={handleMoveBack} className="text-sm text-gray-300 hover:underline">
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
