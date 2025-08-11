'use client'

import { useEffect, useState } from 'react'

export default function ActivityFeed() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/activity/log')
        const data = await res.json()
        setLogs(data)
      } catch (err) {
        console.error('Failed to fetch activity logs:', err)
      }
    }

    fetchLogs()
  }, [])

  return (
    <div className="bg-[#0f172a] text-white rounded-lg p-4 shadow-md">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2">🕒 Activity Feed</h2>
      <ul className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
        {logs.length === 0 ? (
          <li className="text-gray-400">No activity recorded.</li>
        ) : (
          logs.map((log) => {
            const isTaskAction = ['CREATED', 'UPDATED', 'DELETED', 'FETCHED'].includes(log.action?.toUpperCase())
            const isUserAction = ['LOGIN', 'LOGOUT', 'SIGNUP', 'FORGOT_PASSWORD', 'RESET_PASSWORD', 'USER_CREATED', 'USER_DELETED', 'PROFILE_UPDATED', 'REGISTERED'].includes(log.action?.toUpperCase())

            return (
              <li key={log._id} className="text-sm border-b border-gray-700 pb-2">
                <div>
                  <span className="font-bold text-yellow-400">{log.action?.toUpperCase()}</span>{' '}

                  {isTaskAction && (
                    <>
                      task{' '}
                      <span className="text-blue-400 font-medium">
                        {log.taskTitle ? log.taskTitle : log.action === 'fetched' ? "list" : 'Untitled'}
                      </span>
                    </>
                  )}

                  {isUserAction && (
                    <>
                      by user{' '}
                      <span className="text-blue-400 font-medium">
                        {log.user?.username || 'Unknown'}
                      </span>
                    </>
                  )}
                </div>

                <div className="text-gray-400 text-xs mt-1">
                  {log.user?.email && <>({log.user.email}){' '}</>}
                  {log.user?.role && <>[{log.user.role}] &middot;{' '}</>}
                  {log.timestamp ? new Date(log.timestamp).toLocaleString('en-IN') : 'Unknown time'}
                </div>
              </li>
            )
          })
        )}
      </ul>

    </div>
  )
}
