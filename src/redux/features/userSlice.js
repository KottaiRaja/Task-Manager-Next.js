// src/redux/features/userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
  users: [],
  currentUser: null,
  loading: false,
  error: null,
}

export const fetchUsers = createAsyncThunk('users/fetchUsers', async () => {
  const res = await axios.get('/api/users')
  return res.data
})

export const fetchUserById = createAsyncThunk('users/fetchUserById', async (id) => {
  const res = await axios.get(`/api/users/${id}`)
  return res.data
})

export const createUser = createAsyncThunk('users/createUser', async (user) => {
  const res = await axios.post('/api/users', user)
  return res.data
})

export const updateUser = createAsyncThunk('users/updateUser', async ({ id, user }) => {
  const res = await axios.put(`/api/users/${id}`, user)
  return res.data
})

export const deleteUser = createAsyncThunk('users/deleteUser', async (id) => {
  await axios.delete(`/api/users/${id}`)
  return id
})

export const RoleOfUsers = createAsyncThunk('users/RoleOfUsers', async () => {
  const res = await axios.get('/api/user-based/list')
  return res.data
})

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    clearCurrentUser: (state) => {
      state.currentUser = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.users = action.payload
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.currentUser = action.payload
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.users.push(action.payload)
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        const index = state.users.findIndex(u => u._id === action.payload._id)
        if (index !== -1) {
          state.users[index] = action.payload
        }
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.users = state.users.filter(u => u._id !== action.payload)
      })
      .addCase(RoleOfUsers.fulfilled, (state, action) => {
        state.users = action.payload.users || []
      })
  },
})

export const { clearCurrentUser } = userSlice.actions
export default userSlice.reducer
