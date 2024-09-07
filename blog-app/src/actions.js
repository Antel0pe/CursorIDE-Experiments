// User authentication actions
export const login = (user) => ({
    type: 'LOGIN',
    payload: user
});

export const logout = () => ({
    type: 'LOGOUT'
});

// Blog post actions
export const fetchPosts = () => {
    return async (dispatch) => {
        try {
            const response = await fetch('/api/posts');
            const posts = await response.json();
            dispatch(setPosts(posts));
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };
};

export const setPosts = (posts) => ({
    type: 'SET_POSTS',
    payload: posts
});

export const addPost = (post) => ({
    type: 'ADD_POST',
    payload: post
});

export const createPost = (postData) => {
    return async (dispatch) => {
        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });
            const newPost = await response.json();
            dispatch(addPost(newPost));
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };
};
