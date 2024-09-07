import React from 'react';
import mockData from './mockData.json';

const BlogPostList = () => {
  const allPosts = mockData.flatMap(user => user.posts);

  return (
    <div className="blog-post-list">
      <h2>Blog Posts</h2>
      {allPosts.map(post => (
        <div key={post.id} className="blog-post">
          <h3>{post.title}</h3>
          <p>{post.content.substring(0, 100)}...</p>
        </div>
      ))}
    </div>
  );
};

export default BlogPostList;
