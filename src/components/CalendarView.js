'use client'
import React, { useEffect, useRef, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'

export default function CalendarView({ tasks }) {
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 })
  const calendarRef = useRef(null)
useEffect(() => {
  if (tasks && tasks.length) {
    const mappedEvents = tasks.map((task, index) => ({
      id: task._id,
      title: task.name,
      start: task.dueDate,
      allDay: true,
      extendedProps: {  
        taskName: task.title, // 👈 Add Task 1, Task 2...
        assignedTo: task.assignedTo,
        status: task.status,
        description: task.description
      }
    }))
    setEvents(mappedEvents)
  }
}, [tasks])


  const handleEventClick = (info) => {
    const calendarRect = calendarRef.current.getBoundingClientRect()
    const popupWidth = 320
    const offsetX = info.jsEvent.clientX - calendarRect.left
    const offsetY = info.jsEvent.clientY - calendarRect.top

    // Adjust X if too close to right edge
    let left = offsetX
    if (offsetX + popupWidth > calendarRect.width) {
      left = calendarRect.width - popupWidth - 20
    }

    setPopupPosition({ top: offsetY, left })
    setSelectedEvent(info.event)
  }

  return (
    <div
      ref={calendarRef}
      className="p-4 bg-dark-100 dark:bg-gray-800 rounded shadow relative"
    >
      <style jsx global>{`
        .fc .fc-col-header-cell {
          background-color: #1e293b !important;
          color: #e2e8f0;
          border: 1px solid #334155;
        }
      `}</style>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        eventClick={handleEventClick}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        height="auto"
      />

      {selectedEvent && (
        <div
          className="absolute z-50 w-80 p-4 bg-white text-gray-900 rounded-lg shadow-lg border border-gray-700"
          style={{
            top: popupPosition.top + 10,
            left: popupPosition.left,
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold">Task Details</h3>
            <button
              onClick={() => setSelectedEvent(null)}
              className="text-red-400 hover:text-red-300"
            >
              ✕
            </button>
          </div>
          <p className="mb-1"><strong>Task Number:</strong> {selectedEvent.title}</p>
          <p className="mb-1"><strong>Task Name:</strong> {selectedEvent.extendedProps.taskName}</p>
          <p className="mb-1"><strong>Assigned To:</strong> {selectedEvent.extendedProps.assignedTo || 'N/A'}</p>
          <p className="mb-1"><strong>Status:</strong> {selectedEvent.extendedProps.status || 'Pending'}</p>
          <p className="mb-1"><strong>Due Date:</strong> {new Date(selectedEvent.start).toLocaleDateString()}</p>
          <p><strong>Description:</strong> {selectedEvent.extendedProps.description || '—'}</p>
        </div>
      )}
    </div>
  )
}
