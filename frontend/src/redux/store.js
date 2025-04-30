import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../features/User/userSlice';

// Load state from localStorage
const loadState = () => {
  try {
    const serializedState = localStorage.getItem('userState');
    return serializedState ? JSON.parse(serializedState) : undefined;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return undefined;
  }
};

// Save state to localStorage
const saveState = (state) => {
  try {
    const serializedState = JSON.stringify(state.user);
    localStorage.setItem('userState', serializedState);
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

// Create the store with persisted state
const preloadedState = { user: loadState() };
export const store = configureStore({
  reducer: {
    user: userReducer,
  },
  preloadedState,
});

// Subscribe to store changes to save state
store.subscribe(() => {
  saveState(store.getState());
});