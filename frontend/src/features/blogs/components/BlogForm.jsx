import { useState } from 'react';
import { useBlogMutations } from '../hooks/useBlogMutations';

const BlogForm = () => {
  const { addBlogMutation } = useBlogMutations()

  const [newBlog, setNewBlog] = useState({
    title: '',
    author: '',
    url: '',
  });

  // A single, generic handler for all inputs
  const handleInputChange = (event) => {
    const { name, value } = event.target; // 'name' attribute of input matches state key
    setNewBlog((prevBlog) => ({
      ...prevBlog, // keep existing values
      [name]: value, // Dynamically update the correct property
    }));
  };

  const addBlog = (event) => {
    event.preventDefault();

    addBlogMutation.mutate(newBlog);

    setNewBlog({
      title: '',
      author: '',
      url: '',
    });
  };

  return (
    <div>
      <h2> Create a new blog</h2>

      <form onSubmit={addBlog}>
        <div>
          <label htmlFor="title-input">title:</label>
          <input
            id="title-input"
            value={newBlog.title}
            onChange={handleInputChange}
            name="title"
          />
        </div>

        <div>
          <label htmlFor="author-input">author:</label>
          <input
            id="author-input"
            value={newBlog.author}
            onChange={handleInputChange}
            name="author"
          />
        </div>

        <div>
          <label htmlFor="url-input">url:</label>
          <input
            id="url-input"
            value={newBlog.url}
            onChange={handleInputChange}
            name="url"
          />
        </div>

        <button type="submit">create</button>
      </form>
    </div>
  );
};

export default BlogForm;
