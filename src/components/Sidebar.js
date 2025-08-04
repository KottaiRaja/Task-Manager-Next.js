'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function Sidebar() {
  
  const path = usePathname()
  const [role, setRole] = useState(null);
  useEffect(() => {
    const userRole = JSON.parse(localStorage.getItem('role'));
    if (userRole) setRole(userRole);
  }, []);

  return (
    <aside className="w-64 bg-gray-800 text-white flex flex-col p-4">
      <h1 className="text-2xl font-bold mb-8">TaskMaster</h1>
      <nav className="space-y-2">
        <Link
          href="/alltask"
          className={`block py-2 px-4 rounded ${path === '/alltask' ? 'bg-purple-700' : 'hover:bg-gray-700'
            }`}
        >
          📝 All Tasks
        </Link>
      {role !== ("user") &&  <Link
          href="/create"
          className={`block py-2 px-4 rounded ${path === '/create' ? 'bg-purple-700' : 'hover:bg-gray-700'
            }`}
        >
          ➕ Create Task
        </Link> }
        {role !== ("manager" && "user") && <Link
          href="/user/list"
          className={`block py-2 px-4 rounded ${path === ('/user/list' || '/user/create') ? 'bg-purple-700' : 'hover:bg-gray-700'
            }`}
        >
          👥 Users
        </Link>}
        <Link href="/calendar" className={`block py-2 px-4 rounded ${path === '/calendar' ? 'bg-purple-700' : 'hover:bg-gray-700'
            }`}>
          📅 Calendar
        </Link>
      </nav>
    </aside>
  )
}
