import { configureStore } from '@reduxjs/toolkit';
import { thunk } from 'redux-thunk'; // Correct named import for redux-thunk

const initialState = {
  user: null, // The user is initially null
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload }; // Action to set the user
    case 'LOGOUT':
      return { ...state, user: null }; // Action to clear the user on logout
    default:
      return state;
  }
};

// Create the Redux store with thunk middleware
const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(thunk),
});

export default store;
