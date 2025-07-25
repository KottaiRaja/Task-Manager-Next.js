// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import taskReducer from './features/taskSlice';
import userReducer from './features/userSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    users: userReducer
  },
});

export default store;
