import { useParams, useNavigate } from 'react-router-dom'
import { useBlogs } from '../features/blogs/hooks/useBlogs';
import { useUserValue } from '../UserContext';
import { useBlogMutations } from '../features/blogs/hooks/useBlogMutations';
import Comments from '../features/blogs/components/Comments';

const BlogDetailPage = () => {
  const id = useParams().id
  const { data: blogs } = useBlogs();
  const user = useUserValue()
  const { updateBlogMutation, deleteBlogMutation } = useBlogMutations()
  const navigate = useNavigate();

  if (!blogs) return null

  const blog = blogs.find((blog) => blog.id === id)

  if (!blog) {
    return <div>Blog not found</div>
  }

  const showDeleteButton =
    user && blog.user && user.username === blog.user.username;

  const handleDelete = async (id) => {
    const blogToDelete = blogs.find((b) => b.id === id);

    if (!blogToDelete) {
      console.error('Blog not found');
      return;
    }

    if (
      window.confirm(
        `Remove blog ${blogToDelete.title} by ${blogToDelete.author}?`
      )
    ) {
      deleteBlogMutation.mutate(blogToDelete.id, {
        onSuccess: () => {
          navigate('/')
        }
      })
    }
  };

  const handleLike = async (blogToUpdate) => {
    const updatedBlog = {
      ...blogToUpdate,
      likes: blogToUpdate.likes + 1,
    };

    updateBlogMutation.mutate({
      id: updatedBlog.id,
      newObject: updatedBlog
    })
  };


  return (
    <div>
      <h2>{blog.title} by {blog.author}</h2>
      <a href={blog.url} target='_blank' rel='noreferrer'>{blog.url}</a>
      <div>
        likes: {blog.likes}
        <button onClick={() => handleLike(blog)}>like</button>
      </div>
      <div>Blog posted by: {blog.user.name}</div>
      {showDeleteButton && (
        <button onClick={() => handleDelete(blog.id)}>remove</button>
      )}
      <Comments id={blog.id} />
    </div>
  )
}

export default BlogDetailPage