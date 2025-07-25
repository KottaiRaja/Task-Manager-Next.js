'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTasks, deleteTask } from '@/redux/features/taskSlice'

export default function TaskList() {
  const dispatch = useDispatch()
  const { tasks, loading, error } = useSelector((state) => state.tasks)

  const [page, setPage] = useState(1)
  const [limit] = useState(15)
  const [total, setTotal] = useState(0)
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [refresh, setRefresh] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
      setPage(1)
    }, 500)
    return () => clearTimeout(timer)
  }, [search])

  // Fetch tasks from Redux
  useEffect(() => {
    dispatch(fetchTasks({ page, limit, search: debouncedSearch }))
      .unwrap()
      .then((res) => setTotal(res.total))
      .catch(() => setTotal(0));
  }, [page, limit, debouncedSearch, dispatch, refresh]); // ✅ Add `refresh`

  const totalPages = Math.ceil(total / limit)

  const handleDelete = async (e, id) => {
    e.preventDefault();
    if (confirm('Are you sure you want to delete this task?')) {
      await dispatch(deleteTask(id));
      setRefresh((prev) => !prev); // ✅ Toggle to re-trigger useEffect
    }
  };

  return (
    <div>
      {/* Search Bar */}
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

      {/* Task Table */}
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
            <tr>
              <td colSpan={5} className="text-center text-white py-4">
                Loading...
              </td>
            </tr>
          ) : error ? (
            <tr>
              <td colSpan={5} className="text-center text-red-500 py-4">
                {error}
              </td>
            </tr>
          ) : tasks.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-white py-4">
                No tasks found.
              </td>
            </tr>
          ) : (
            tasks.map((task) => (
              <tr key={task._id} className="border-b border-gray-800 hover:bg-gray-700">
                <td className="p-2 text-white">{task.title}</td>
                <td className="p-2 text-white">
                  {new Date(task.dueDate).toLocaleDateString('en-GB')}
                </td>
                <td className="p-2 text-white">
                  <span className="bg-yellow-600 text-xs rounded-full px-2 py-1">
                    {task.status}
                  </span>
                </td>
                <td className="p-2 text-white">
                  <span className="bg-purple-600 text-xs rounded-full px-2 py-1">
                    {task.priority}
                  </span>
                </td>
                <td className="p-2 space-x-2">
                  <Link href={`/edit?id=${task._id}`} className="text-blue-400">
                    Edit
                  </Link>
                  <button
                    onClick={(e) => handleDelete(e, task._id)}
                    className="text-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
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
                    className={`px-3 py-1 rounded border ${page === item
                      ? 'border-purple-600 text-purple-600 font-bold'
                      : 'border-gray-600 text-white'}`}
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
