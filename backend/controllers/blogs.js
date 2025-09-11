const blogsRouter = require('express').Router();
const Blog = require('../models/blog');
const User = require('../models/user');
const middleware = require('../utils/middleware');
const mongoose = require('mongoose');

blogsRouter.get('/', async (request, response, next) => {
  try {
    const blogs = await Blog.find({}).populate('user', {
      username: 1,
      name: 1,
    });

    response.json(blogs);
  } catch (error) {
    next(error);
  }
});

blogsRouter.get('/:id/comments', async (request, response) => {
  const { id } = request.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).json({ error: 'Invalid blog ID' });
  }
  
  try {
    const blog = await Blog.findById(id).select('comments');
    if (!blog) return response.status(404).json({ error: 'Blog not found' });

    response.json(blog.comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    response.status(500).json({ error: 'Internal Server Error' });
  }
})

blogsRouter.post('/:id/comments', async (request, response) => {
  const { text } = request.body;
  if (!text) return response.status(400).json({ error: 'Comment text is required' });

  const blog = await Blog.findById(request.params.id);
  if (!blog) return response.status(404).json({ error: 'Blog not found' });

  blog.comments.push({ text })

  const updatedBlog = await blog.save();
  response.status(201).json(updatedBlog);
})

blogsRouter.post('/', middleware.userExtractor, async (request, response) => {
  try {
    // The userExtractor middleware should have populated request.user
    // if token was valid

    if (!request.user || !request.user.id) {
      return response
        .status(401)
        .json({ error: 'token missing, invalid, or user not extracted' });
    }

    // Explicit field picking (enhanced security/clarity)
    const { title, author, url, likes } = request.body;

    const user = await User.findById(request.user.id);

    if (!user) {
      // Handle the case where no users exist in the database
      return response.status(400).json({
        error:
          'Cannot create blog: No users found in the database to assign' +
          ' as creator.',
      });
    }

    if (!title || !url) {
      return response
        .status(400)
        .json({ message: 'Title and URL are required' });
    }

    const blog = new Blog({
      title,
      author,
      url,
      likes,
      user: user._id,
    });

    // Save the new blog to the database
    const savedBlog = await blog.save();
    user.blogs = user.blogs.concat(savedBlog._id);
    await user.save();

    const populatedBlog = await savedBlog.populate('user', {
      username: 1,
      name: 1,
    });

    response.status(201).json(populatedBlog);
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return response.status(401).json({ error: 'token invalid' });
    }
    console.error(error);
    next(error);
  }
});

blogsRouter.put('/:id', async (request, response) => {
  try {
    const body = request.body;

    const updatedData = {
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes,
    };

    const options = {
      new: true, // Return the modified document
      runValidators: true, // Run schema validators on update
      context: 'query', // Necessary for some validators (like unique) during updates
    };

    // Perform the update
    const updatedBlog = await Blog.findByIdAndUpdate(
      request.params.id,
      updatedData,
      options
    ).populate('user', { username: 1, name: 1 });

    // Handle results
    if (updatedBlog) {
      response.json(updatedBlog);
    } else {
      response.status(404).json({ message: 'Blog not found' });
    }
  } catch (error) {
    console.error(error);
    return response.status(400);
  }
});

blogsRouter.delete(
  '/:id',
  middleware.userExtractor,
  async (request, response, next) => {
    try {
      if (!request.user || !request.user.id) {
        return response
          .status(401)
          .json({ error: 'token missing, invalid, or user not extracted' });
      }

      const blogIdToDelete = request.params.id;
      // The ID of the user attempting the deletion
      const userIdFromToken = request.user.id;

      // Find the blog to be deleted
      const blog = await Blog.findById(blogIdToDelete);

      if (!blog) {
        return response.status(404).json({ error: 'blog not found' });
      }

      // Authorization: Check if the user attempting deletion is the blog's creator
      // blog.user stores the ObjectId of the user who created the blog.
      // We need to compare it with the userIdFromToken (which is a string).
      if (blog.user.toString() !== userIdFromToken) {
        return response
          .status(403)
          .json({ error: 'user not authorized to delete this blog' });
      }

      // If authorized, delete the blog
      await Blog.findByIdAndDelete(blogIdToDelete);
      response.status(204).end();
    } catch (exception) {
      if (exception.name === 'JsonWebTokenError') {
        return response.status(401).json({ error: 'token invalid' });
      }
      console.error(exception);
      next(exception);
    }
  }
);

module.exports = blogsRouter;