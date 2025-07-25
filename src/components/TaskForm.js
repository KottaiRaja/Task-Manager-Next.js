'use client'
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

export default function TaskForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const taskId = searchParams.get('id')

  const [formData, setFormData] = useState({
    title: '',
    assignedTo: '',
    description: '',
    dueDate: '',
    status: 'Pending',
    priority: 'Medium',
  })

  const [users, setUsers] = useState([])

  useEffect(() => {
    if (taskId) {
      fetch(`/api/tasks/${taskId}`)
        .then(res => res.json())
        .then(data => setFormData(data))
    }
  }, [taskId])

  useEffect(() => {
    fetch(`/api/user-based/list`)
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const method = taskId ? 'PUT' : 'POST'
    const url = taskId ? `/api/tasks/${taskId}` : '/api/tasks'
    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    })

    router.push('/alltask')
  }

 return (
    <div className="flex flex-col px-8 py-6 w-full max-w-3xl mx-auto">
      <h2 className="text-2xl font-semibold text-white mb-6">{ taskId ? 'Edit the Task' : 'Add New Task'}</h2>

      <form onSubmit={handleSubmit} className="space-y-4 bg-[#1e293b] p-6 rounded-xl shadow-md">
        <input
          type="text"
          name="title"
          placeholder="Enter task title"
          value={formData.title}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />

        <select
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="">Select User</option>
          {users.map(user => (
            <option key={user._id} value={user._id}>{user.username} {(user.email)}</option>
          ))}
        </select>

        <textarea
          name="description"
          placeholder="Enter task description"
          value={formData.description}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          rows={3}
          required
        />

        <input
          type="date"
          name="dueDate"
          value={(formData.dueDate && new Date(formData.dueDate).toISOString().split('T')[0]) || ''}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
          required
        />

        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="Pending">Pending</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          className="w-full px-4 py-2 rounded-md bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>

        <div className="flex justify-between items-center pt-4">
          <button
            type="button"
            onClick={() => router.push('/alltask')}
            className="text-sm text-gray-300 hover:underline"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:opacity-90"
          >
            {taskId ? 'Update' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  )
}
