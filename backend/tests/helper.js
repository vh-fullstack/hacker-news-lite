const Blog = require('../models/blog');
const User = require('../models/user');
const bcrypt = require('bcrypt');
const supertest = require('supertest');
const { SALT_ROUNDS } = require('../utils/constants');

const initialBlogs = [
  {
    title: 'React patterns',
    author: 'Michael Chan',
    url: 'https://reactpatterns.com/',
    likes: 7,
  },
  {
    title: 'Go To Statement Considered Harmful',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    likes: 5,
  },
  {
    title: 'Canonical string reduction',
    author: 'Edsger W. Dijkstra',
    url: 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    likes: 12,
  },
  {
    title: 'First class tests',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    likes: 10,
  },
  {
    title: 'TDD harms architecture',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    likes: 0,
  },
  {
    title: 'Type wars',
    author: 'Robert C. Martin',
    url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    likes: 2,
  },
];

const initialUsers = [
  {
    username: 'testuser',
    name: 'Test User',
    password: 'testpassword', // Plain text for test setup, will be hashed
  },
  {
    username: 'anotheruser',
    name: 'Another User',
    password: 'anotherpassword',
  },
  {
    username: 'root',
    name: 'Root User',
    password: 'sekretpassword',
  },
];

// Function to clear and populate the User collection
const resetUsersInDb = async () => {
  await User.deleteMany({});

  const userObjectsPromises = initialUsers.map(async (user) => {
    const passwordHash = await bcrypt.hash(user.password, SALT_ROUNDS);
    return {
      username: user.username,
      name: user.name,
      passwordHash: passwordHash,
    };
  });

  const userObjects = await Promise.all(userObjectsPromises);
  const createdUsers = await User.insertMany(userObjects);

  return createdUsers;
};

const resetBlogsInDb = async () => {
  await Blog.deleteMany({});
  await Blog.insertMany(initialBlogs);
};

const blogsInDb = async () => {
  const blogs = await Blog.find({});
  return blogs.map((blog) => blog.toJSON());
};

const usersInDb = async () => {
  const users = await User.find({});
  return users.map((u) => u.toJSON());
};

const loginAndGetToken = async (apiInstance, username, password) => {
  const response = await apiInstance // use the passed supertest instance
    .post('/api/login')
    .send({ username, password });

  if (response.status !== 200) {
    console.error('Login failed in helper:', response.body);
    throw new Error(
      `Login failed for ${username}: ${response.body.error || response.status}`
    );
  }
  return response.body.token;
};

module.exports = {
  resetUsersInDb,
  resetBlogsInDb,
  blogsInDb,
  usersInDb,
  initialBlogs,
  initialUsers,
  loginAndGetToken,
};
