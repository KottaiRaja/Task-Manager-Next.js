// taskSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

// ✅ Define async thunks directly here

export const fetchTasks = createAsyncThunk('tasks/fetchTasks', async ({ page, limit, search }) => {
  const res = await axios.get(`/api/tasks?page=${page}&limit=${limit}&search=${search}`)
  return res.data // expects { tasks: [...], total: number }
})

export const createTask = createAsyncThunk('tasks/createTask', async (taskData) => {
  const res = await axios.post('/api/tasks', taskData)
  return res.data
})

export const deleteTask = createAsyncThunk('tasks/deleteTask', async (id) => {
  await axios.delete(`/api/tasks/${id}`)
  return id
})

// Your slice stays the same...
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    total: 0,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false
        state.tasks = action.payload.tasks || []
        state.total = action.payload.total || 0
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.tasks.unshift(action.payload)
        state.total += 1
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
        state.tasks = state.tasks.filter((task) => task._id !== action.payload)
        state.total -= 1
      })
  },
})

export default taskSlice.reducer
