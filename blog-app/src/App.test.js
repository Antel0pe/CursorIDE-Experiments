import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import App from './App';
import { login, logout, createPost, fetchPosts } from './actions';

const mockStore = configureStore([thunk]);

describe('App Component Tests', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      user: { isAuthenticated: false, user: null },
      posts: { posts: [] }
    });
  });

  test('renders login form when not authenticated', () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    expect(screen.getByText(/Login/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
  });

  test('user can register', async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    fireEvent.click(screen.getByText(/Register/i));
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'testpass' } });
    fireEvent.click(screen.getByText(/Submit/i));

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(login({ username: 'testuser' }));
    });
  });

  test('user can login', async () => {
    render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    fireEvent.change(screen.getByLabelText(/Username/i), { target: { value: 'testuser' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'testpass' } });
    fireEvent.click(screen.getByText(/Login/i));

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(login({ username: 'testuser' }));
    });
  });

  test('authenticated user can create a blog post', async () => {
    store = mockStore({
      user: { isAuthenticated: true, user: { username: 'testuser' } },
      posts: { posts: [] }
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test Post' } });
    fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: 'This is a test post.' } });
    fireEvent.click(screen.getByText(/Create Post/i));

    await waitFor(() => {
      const actions = store.getActions();
      expect(actions).toContainEqual(createPost({ title: 'Test Post', content: 'This is a test post.' }));
    });
  });

  test('blog posts are displayed', async () => {
    store = mockStore({
      user: { isAuthenticated: true, user: { username: 'testuser' } },
      posts: { posts: [{ id: 1, title: 'Test Post', content: 'This is a test post.' }] }
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Post')).toBeInTheDocument();
      expect(screen.getByText('This is a test post.')).toBeInTheDocument();
    });

    const actions = store.getActions();
    expect(actions).toContainEqual(fetchPosts());
  });

  test('user can logout', () => {
    store = mockStore({
      user: { isAuthenticated: true, user: { username: 'testuser' } },
      posts: { posts: [] }
    });

    render(
      <Provider store={store}>
        <App />
      </Provider>
    );

    fireEvent.click(screen.getByText(/Logout/i));

    const actions = store.getActions();
    expect(actions).toContainEqual(logout());
  });
});
