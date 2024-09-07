import { createStore } from 'redux';

const initialState = {
  user: null,
  posts: []
};

const rootReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'ADD_POST':
      return {
        ...state,
        posts: [...state.posts, action.payload]
      };
    case 'SET_POSTS':
      return {
        ...state,
        posts: action.payload
      };
    default:
      return state;
  }
};

const store = createStore(rootReducer);

export default store;
