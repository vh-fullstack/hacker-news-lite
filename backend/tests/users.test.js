const { test, describe, beforeEach, after } = require('node:test');
const assert = require('node:assert');
const {
  resetUsersInDb,
  resetBlogsInDb,
  initialBlogs,
  blogsInDb,
  usersInDb,
} = require('./helper');
const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const { MIN_PASSWORD_LENGTH } = require('../utils/constants');
require('dotenv').config()

// Initialize variable that will hold all blogs in MongoDB database
let initialContentsInDb;

// This runs before EACH test
beforeEach(async () => {
  // 1. Reinitialize BLOGS database
  await resetBlogsInDb();

  // 2. Fetch the initial BLOG state and store it
  initialContentsInDb = await blogsInDb();
});

describe('when there is initially two users in db', () => {
  beforeEach(async () => {
    await resetUsersInDb();
  });

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: process.env.NEW_USER_PASSWORD_01,
    };

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await usersInDb();
    assert.strictEqual(usersAtEnd.length, usersAtStart.length + 1);

    const usernames = usersAtEnd.map((u) => u.username);
    assert(usernames.includes(newUser.username));
  });

  test('creation fails with proper statuscode and message if password is under a desired length ', async () => {
    const usersAtStart = await usersInDb();

    const newUser = {
      username: 'PiddlingPasswordPerson',
      name: 'PPP',
      password: process.env.NEW_USER_PASSWORD_02,
    };

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(422)
      .expect('Content-Type', /application\/json/);

    const usersAtEnd = await usersInDb();

    assert(
      result.body.error.includes(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`
      )
    );

    assert.strictEqual(usersAtEnd.length, usersAtStart.length);
  });
});

after(async () => {
  await mongoose.connection.close();
});
