'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const path = usePathname()

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-8">TaskMaster</h1>
      <nav className="space-y-2">
        <Link
          href="/alltask"
          className={`block py-2 px-4 rounded ${
            path === '/' ? 'bg-purple-700' : 'hover:bg-gray-700'
          }`}
        >
          📝 All Tasks
        </Link>
        <Link
          href="/create"
          className={`block py-2 px-4 rounded ${
            path === '/create' ? 'bg-purple-700' : 'hover:bg-gray-700'
          }`}
        >
          ➕ Create Task
        </Link>
      </nav>
    </aside>
  )
}
