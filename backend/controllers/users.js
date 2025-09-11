const bcrypt = require('bcrypt');
const usersRouter = require('express').Router();
const User = require('../models/user');
const { SALT_ROUNDS, MIN_PASSWORD_LENGTH } = require('../utils/constants');

usersRouter.get('/', async (request, response, next) => {
  try {
    const users = await User.find({}).populate('blogs', {
      url: 1,
      title: 1,
      author: 1,
      likes: 1,
    });
    response.json(users);
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/', async (request, response, next) => {
  try {
    const { username, name, password } = request.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return response
        .status(400)
        .json({ error: 'expected `username` to be unique' });
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      // 422 Unprocessable Entity is more semantically correct for validation errors where the request structure is fine, but the data values are not (like a password being too short)
      return response
        .status(422)
        .json({ error: 'Password must be at least 4 characters long.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = new User({
      username,
      name,
      passwordHash,
    });

    const savedUser = await user.save();
    response.status(201).json(savedUser);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return response
        .status(422)
        .json({ error: 'expected `username` to be unique' });
    }
    next(error);
  }
});

module.exports = usersRouter;
