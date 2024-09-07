import React, { useState } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';
import store from './store';
import './App.css';
import Register from './Register';
import UserLogin from './UserLogin';
import BlogPostList from './BlogPostList';
import BlogDetail from './BlogDetail';
import mockData from './mockData.json';

function App() {
  const [blogForm, setBlogForm] = useState({
    title: '',
    content: ''
  });

  const handleBlogFormChange = (e) => {
    const { name, value } = e.target;
    setBlogForm(prevForm => ({
      ...prevForm,
      [name]: value
    }));
  };

  const handleBlogSubmit = (e) => {
    e.preventDefault();
    const newPost = {
      id: Math.max(...mockData.flatMap(user => user.posts.map(post => post.id))) + 1,
      title: blogForm.title,
      content: blogForm.content,
      date: new Date().toISOString()
    };

    // Assuming the first user in mockData is the current user
    mockData[0].posts.push(newPost);

    console.log('New blog post added:', newPost);
    console.log('Updated mock data:', mockData);

    // Reset form after submission
    setBlogForm({
      title: '',
      content: ''
    });
  };

  return (
    <Provider store={store}>
      <div className="App">
        <header className="App-header">
          <h1>My Blog App</h1>
        </header>
        <main>
          <BrowserRouter>
            <Switch>
              <Route path="/register" component={Register} />
              <Route path="/login" component={UserLogin} />
              <Route path="/post/:id" component={BlogDetail} />
              <Route exact path="/" render={() => (
                <>
                  <h2>Welcome to My Blog App</h2>
                  <form onSubmit={handleBlogSubmit}>
                    <div>
                      <label htmlFor="title">Title:</label>
                      <input
                        type="text"
                        id="title"
                        name="title"
                        value={blogForm.title}
                        onChange={handleBlogFormChange}
                        placeholder="Enter blog title"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="content">Content:</label>
                      <textarea
                        id="content"
                        name="content"
                        value={blogForm.content}
                        onChange={handleBlogFormChange}
                        placeholder="Enter blog content"
                        required
                      />
                    </div>
                    <button type="submit">Add Blog Post</button>
                  </form>
                  <BlogPostList />
                </>
              )} />
            </Switch>
          </BrowserRouter>
        </main>
      </div>
    </Provider>
  );
}

export default App;
