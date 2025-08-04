'use client'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchFullTask } from '@/redux/features/taskSlice'
import CalendarView from '@/components/CalendarView'

export default function CalendarPage() {
  const dispatch = useDispatch()
  const { allTasks } = useSelector(state => state.tasks)

  useEffect(() => {
    dispatch(fetchFullTask())
  }, [dispatch])
  console.log("Tasks in CalendarPage:", allTasks)
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Task Calendar</h1>
      <CalendarView tasks={allTasks} />
    </div>
  )
}
