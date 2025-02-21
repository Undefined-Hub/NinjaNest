import { configureStore } from '@reduxjs/toolkit'
import { userSlice } from '../features/User/userSlice'
export const store = configureStore({
  reducer: {
    user: userSlice.reducer,
  },
})