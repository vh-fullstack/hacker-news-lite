import { useState, useEffect } from 'react'
import blogService from '../../../services/blogs'

export const useComments = (blogId) => {
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true); // Start as true
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!blogId) return;

    const fetchComments = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await blogService.getComments(blogId);
        setComments(data);
      } catch (error) {
        console.error('Failed to fetch comments:', error);
        setError(error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchComments()
  }, [blogId]);

  // Function to add a new comment
  const addComment = async (commentText) => {
    try {
      // The API returns the blog with the updated comments list
      const updatedBlog = await blogService.addComment(blogId, commentText);
      // Update our local state with the new list from the server
      setComments(updatedBlog.comments);
    } catch (err) {
      console.error('Failed to add comment:', err);
    }
  };

  // Return everything the component needs
  return { comments, isLoading, error, addComment };
};

