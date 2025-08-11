'use client'

import { useEffect, useState } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import ActivityFeed from '@/components/ActivityFeed'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

export default function InsightsPage() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetch('/api/insights')
      .then(res => res.json())
      .then(setData)
  }, [])

  if (!data) return <div className="p-4 text-white">Loading dashboard...</div>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span>📊</span> Dashboard Insights
      </h1>

      {/* Top Row: 2 Charts Side by Side */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Tasks Per User */}
        <div className="bg-white text-gray-900 p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">Tasks Per User</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.tasksPerUser.map(user => ({
                  username: user.name,
                  taskCount: user.taskCount
                }))}
                dataKey="taskCount"
                nameKey="username"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {data.tasksPerUser.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Breakdown */}
        <div className="bg-white text-gray-900 p-4 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-2">Task Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Total', value: data.totalTasks },
                  { name: 'Completed', value: data.completedTasks },
                  { name: 'Overdue', value: data.overdueTasks }
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={index} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full Width Bottom Row: Activity Feed */}
      <div className="bg-white text-gray-900 p-4 rounded-xl shadow-md">
        <ActivityFeed />
      </div>
    </div>
  )
}
