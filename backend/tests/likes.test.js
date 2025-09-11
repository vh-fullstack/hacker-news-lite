const { test, describe, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const helper = require('./helper');
const {
  favoriteBlog,
  mostBlogs,
  totalLikes,
  mostLikes,
} = require('../utils/list_helper');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Blog = require('../models/blog');

// Initialize variable that will hold all BLOGS in MongoDB database
let initialContentsInDb;

// Initialize variable that will hold all USERS in MongoDB database
let initialUsersInDb;

let token; // variable to store the token for tests

// This runs before EACH test
beforeEach(async () => {
  // 1. Reinitialize BLOGS
  await helper.resetBlogsInDb();

  // 2. Fetch the initial state and store it
  initialContentsInDb = await helper.blogsInDb();

  // Reinitialize USERS
  await helper.resetUsersInDb();

  initialUsersInDb = await helper.usersInDb();

  // 2. Login the test user and get a token
  // use one of the users from helper.initialUsers
  token = await helper.loginAndGetToken(api, 'testuser', 'testpassword');

  if (!token) {
    throw new Error('Failed to get token in beforeEach');
  }
});

/*** BEGIN DATABASE BASIC API FUNCTIONALITY ***/
describe('database functionality', async () => {
  test('blog fails with proper status code 401 Unauthorized if a token is not provided', async () => {
    const newBlog = {
      title: 'Unauthorized Blog',
      author: 'Hacker',
      url: 'http://unauth.com',
      likes: 0,
    };

    await api.post('/api/blogs').send(newBlog).expect(401);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, initialContentsInDb.length); // No blog should be added
  });

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs');
    assert.strictEqual(response.body.length, helper.initialBlogs.length);
  });

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs');
    const titles = response.body.map((e) => e.title);
    assert(titles.includes('First class tests'));
  });

  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'SQL Patterns for dummies',
      author: 'Victor Haskell',
      url: 'https://google.com',
      likes: 5,
    };

    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    assert.strictEqual(blogsAtEnd.length, initialContentsInDb.length + 1);

    const titles = blogsAtEnd.map((b) => b.title);
    assert(titles.includes('SQL Patterns for dummies'));
  });

  test("blogs contain 'id' as attribute instead of '_id'", async () => {
    const allHaveCorrectId = initialContentsInDb.every((blog) => {
      // Check if 'id' property exists directly on object
      const hasId = Object.hasOwn(blog, 'id');
      // Check if '_id' property does NOT exist directly on the object
      const hasNo_id = !Object.hasOwn(blog, '_id');

      return hasId && hasNo_id; // return true only if both conditions are met
    });

    assert.strictEqual(allHaveCorrectId, true);
  });
});

describe('deleting a resource', () => {
  test('delete a single blog post resource', async () => {
    // The following is an inefficient solution.
    // We are adding one blog with an assigned user rather than refactoring helper.js so that all blogs have a user.
    const newBlog = {
      title: 'Hacker jobs for dummies',
      author: 'Hank Hankman',
      url: 'https://google.com',
      likes: 0,
    };

    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const blogsAtBeginning = await helper.blogsInDb();

    const blogToDelete = blogsAtBeginning[blogsAtBeginning.length - 1];

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    const blogsAtEnd = await helper.blogsInDb();

    const titles = blogsAtEnd.map((b) => b.title);
    assert(!titles.includes(blogToDelete.title));

    assert.strictEqual(blogsAtEnd.length, blogsAtBeginning.length - 1);
  });
});

describe('updating a resource', () => {
  test('updating the information of an individual blog post', async () => {
    const blogToUpdate = initialContentsInDb[0];

    const modifiedBlog = { ...blogToUpdate, likes: blogToUpdate.likes + 1 };

    await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(modifiedBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/);

    const blogsAtEnd = await helper.blogsInDb();
    const updatedBlogInDb = blogsAtEnd.find((b) => b.id === blogToUpdate.id);

    assert.strictEqual(blogToUpdate.likes + 1, updatedBlogInDb.likes);
  });
});

describe('missing properties (title, url, likes)', () => {
  test("blogs who aren't passed a value for the 'likes' property in the request will default 0", async () => {
    const newBlog = {
      title: 'Principles of efficiency',
      author: 'Andy Proop',
      url: 'https://google.com',
    };

    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${token}`)
      .send(newBlog);

    const blogsAtEnd = await helper.blogsInDb();
    const newBlogInDb = blogsAtEnd.find(
      (blog) => blog.title === 'Principles of efficiency'
    );

    assert.strictEqual(newBlogInDb.likes, 0);
  });

  test('blogs without titles are rejected with status 400 bad request', async () => {
    const newBlog = {
      author: 'Benjamin Tea',
      url: 'https://google.com',
      likes: 2,
    };

    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400);
  });

  test('blogs without urls are rejected with status 400 bad request', async () => {
    const newBlog = {
      title: 'Oxford lessons in computer sci.',
      author: 'Benjamin Tea',
      likes: 2,
    };

    await api
      .post('/api/blogs')
      .set('authorization', `Bearer ${token}`)
      .send(newBlog)
      .expect(400);
  });
});

/*** END DATABASE FUNCTIONALITY ***/

/***** BEGIN TESTING FOR TOTAL LIKES *****/
describe('total likes', () => {
  const listWithOneBlog = [
    {
      id: '5a422aa71b54a676234d17f8',
      title: 'Go To Statement Considered Harmful',
      author: 'Edsger W. Dijkstra',
      url: 'https://homepages.cwi.nl/~storm/teaching/reader/Dijkstra68.pdf',
      likes: 5,
    },
  ];

  test('when list has only one blog, equals the likes of that', () => {
    const result = totalLikes(listWithOneBlog);
    assert.strictEqual(result, 5);
  });
});
/***** END, TOTAL LIKES *****/

/***** BEGIN TESTING FOR FAVORITE BLOGS *****/
describe('favorite blogs', () => {
  test('in a list of multiple (n > 1) blogs, equals the blog with the most likes', async () => {
    const result = favoriteBlog(initialContentsInDb);

    assert.deepStrictEqual(result, 12);
  });
});
/***** END TESTING FOR FAVORITE BLOGS *****/

/***** BEGIN TESTING FOR AUTHOR WITH MOST BLOGS *****/
describe('author with most blogs', () => {
  const authorWithMostBlogs = {
    author: 'Robert C. Martin',
    blogs: 3,
  };

  test('given multiple blogs, identifies the author with the most blogs and returns their name and count', async () => {
    const result = mostBlogs(initialContentsInDb);

    assert.deepStrictEqual(result, authorWithMostBlogs);
  });
});
/***** END TESTING FOR AUTHOR WITH MOST BLOGS *****/

/***** BEGIN TESTING FOR AUTHOR WITH MOST LIKES *****/
describe('author with most likes', () => {
  const authorWithMostLikes = {
    author: 'Edsger W. Dijkstra',
    likes: 17,
  };

  test('given multiple blogs, identifies the author with most likes and returns their name and count', async () => {
    const result = mostLikes(initialContentsInDb);

    assert.deepStrictEqual(result, authorWithMostLikes);
  });
});
/***** END TESTING FOR AUTHOR WITH MOST LIKES *****/

// Close database connection
after(async () => {
  await mongoose.connection.close();
});
