import { combineReducers } from 'redux';

const initialUserState = {
    isAuthenticated: false,
    user: null
};

const userReducer = (state = initialUserState, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                isAuthenticated: true,
                user: action.payload
            };
        case 'LOGOUT':
            return {
                ...state,
                isAuthenticated: false,
                user: null
            };
        default:
            return state;
    }
};

const initialPostsState = {
    posts: []
};

const postsReducer = (state = initialPostsState, action) => {
    switch (action.type) {
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
        case 'DELETE_POST':
            return {
                ...state,
                posts: state.posts.filter(post => post.id !== action.payload)
            };
        case 'UPDATE_POST':
            return {
                ...state,
                posts: state.posts.map(post =>
                    post.id === action.payload.id ? action.payload : post
                )
            };
        default:
            return state;
    }
};

const rootReducer = combineReducers({
    user: userReducer,
    posts: postsReducer
});

export default rootReducer;
