'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTasks, deleteTask } from '@/redux/features/taskSlice'

export default function TaskList() {
  const dispatch = useDispatch()
  const { tasks, loading, error } = useSelector((state) => state.tasks)

  const [taskList, setTaskList] = useState(tasks)

  const [page, setPage] = useState(1)
  const [limit] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')

  const [popup, setPopup] = useState({ show: false, message: '', type: 'success' })

  const showPopup = (message, type = 'success') => {
    setPopup({ show: true, message, type })
    setTimeout(() => {
      setPopup({ show: false, message: '', type: 'success' })
    }, 3000)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  const fetchTaskData = async (customPage = page) => {
    try {

      const res = await dispatch(fetchTasks({
        page: customPage,
        limit,
        search: debouncedSearch,
        status: statusFilter,
        priority: priorityFilter
      })).unwrap()

      setTotal(res.total)
      setTaskList(res.tasks || [])

      if (res.tasks.length === 0 && customPage > 1) {
        setPage(customPage - 1)
      }
    } catch {
      setTotal(0)
      showPopup('Failed to load tasks', 'error')
    }
  }


  useEffect(() => {
    fetchTaskData()
  }, [page, limit, debouncedSearch, statusFilter, priorityFilter, dispatch])

  const totalPages = Math.ceil(total / limit)

  const handleDelete = async (e, id) => {
    e.preventDefault()
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await dispatch(deleteTask(id)).unwrap()
        showPopup('Task deleted successfully', 'success')

        // Fetch again after delete
        fetchTaskData()
      } catch {
        showPopup('Failed to delete task', 'error')
      }
    }
  }

  const [role, setRole] = useState(null)
  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem('role'))
    if (userRole) setRole(userRole)
  }, [])

  return (
    <div>
      {popup.show && (
        <div
          className={`fixed top-1/4 left-1/2 z-50 px-4 py-2 rounded shadow-md text-white ${popup.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
        >
          {popup.message}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-3xl font-bold text-white">All Tasks</h2>
        <input
          type="text"
          placeholder="Search tasks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-3 py-1 rounded border border-gray-600 bg-gray-800 text-white w-full sm:w-64"
        />
      </div>

      <div className="flex flex-wrap gap-4 mb-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
        >
          <option value="">All Status</option>
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-2 py-1 rounded bg-gray-800 text-white border border-gray-600"
        >
          <option value="">All Priority</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      <table className="w-full text-left border-collapse text-sm mb-4">
        <thead>
          <tr className="border-b border-gray-700">
            <th className="p-2 text-white">Title</th>
            <th className="p-2 text-white">Due Date</th>
            <th className="p-2 text-white">Status</th>
            <th className="p-2 text-white">Priority</th>
            <th className="p-2 text-white">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr><td colSpan={5} className="text-center text-white py-4">Loading...</td></tr>
          ) : error ? (
            <tr><td colSpan={5} className="text-center text-red-500 py-4">{error}</td></tr>
          ) : taskList.length === 0 ? (
            <tr><td colSpan={5} className="text-center text-white py-4">No tasks found.</td></tr>
          ) : (
            taskList.map((task) => (
              <tr key={task._id} className="border-b border-gray-800 hover:bg-gray-700">
                <td className="p-2 text-white">{task.title}</td>
                <td className="p-2 text-white">{new Date(task.dueDate).toLocaleDateString('en-GB')}</td>
                <td className="p-2 text-white">
                  <span className="bg-yellow-600 text-xs rounded-full px-2 py-1">{task.status}</span>
                </td>
                <td className="p-2 text-white">
                  <span className="bg-purple-600 text-xs rounded-full px-2 py-1">{task.priority}</span>
                </td>
                <td className="p-2 space-x-2">
                  <Link href={`/edit?id=${task._id}`} className="text-blue-400">Edit</Link>
                  {role !== 'user' && (
                    <button onClick={(e) => handleDelete(e, task._id)} className="text-red-500">Delete</button>
                  )}
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
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
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
                    className={`px-3 py-1 rounded border ${page === item ? 'border-purple-600 text-purple-600 font-bold' : 'border-gray-600 text-white'}`}
                  >
                    {item}
                  </button>
                )
              )
            })()}

            <button
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
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
