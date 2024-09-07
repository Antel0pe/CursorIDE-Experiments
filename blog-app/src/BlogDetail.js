import React from 'react';
import { useParams } from 'react-router-dom';
import mockData from './mockData.json';

const BlogDetail = () => {
  const { id } = useParams();
  const allPosts = mockData.flatMap(user => user.posts);
  const post = allPosts.find(post => post.id === parseInt(id));

  if (!post) {
    return <div>Post not found</div>;
  }

  const author = mockData.find(user => user.posts.some(p => p.id === post.id));

  return (
    <div className="blog-detail">
      <h2>{post.title}</h2>
      <p><strong>Author:</strong> {author ? author.username : 'Unknown'}</p>
      <p><strong>Date:</strong> {new Date(post.date).toLocaleDateString()}</p>
      <div className="blog-content">
        {post.content}
      </div>
    </div>
  );
};

export default BlogDetail;
