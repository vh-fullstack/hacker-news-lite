import { useState } from 'react'
import { useBlogs } from '../hooks/useBlogs'
import Blog from './Blog';
import BlogForm from './BlogForm';
import Togglable from '../../../shared/Togglable';

const BlogRender = () => {
  const [sortByLikes, setSortByLikes] = useState(true);
  const { data: blogs } = useBlogs()

  const blogsToDisplay = sortByLikes
    ? [...blogs].sort((a, b) => b.likes - a.likes)
    : blogs;

  return (
    <div style={{ textAlign: 'left', marginTop: '20px' }}>
      <Togglable buttonLabel="create new blog">
        <BlogForm />
      </Togglable>

      {blogsToDisplay.map((blog, index) => (
        <Blog
          index={index}
          key={blog.id}
          blog={blog}
        />
      ))}
    </div>
  )
}

export default BlogRender;