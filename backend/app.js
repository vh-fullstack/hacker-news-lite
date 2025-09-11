const config = require('./utils/config');
const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet')

const blogsRouter = require('./controllers/blogs');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');

const middleware = require('./utils/middleware');
const mongoose = require('mongoose');
const logger = require('./utils/logger');

mongoose
  .connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB');
  })
  .catch((error) => {
    logger.error('error connection to MongoDB:', error.message);
  });

if (process.env.NODE_ENV === 'production') {
  app.use(
    helmet({
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          "default-src": ["'self'"],
          "script-src": ["'self'", "cdn.jsdelivr.net"],
          "style-src": ["'self'", "fonts.googleapis.com"],
          "font-src": ["'self'", "fonts.gstatic.com"],
          "img-src": ["'self'", "data:"],
        },
      },
      referrerPolicy: { policy: 'no-referrer-when-downgrade' },
    })
  );

  app.use(helmet.hsts({ maxAge: 31536000 }));
  app.use(helmet.frameguard({ action: 'deny' }));
} else {
  // In development: disable CSP for hot reload
  app.use(helmet({ contentSecurityPolicy: false }));
}

app.use(cors());
app.use(express.static('dist'));
app.use(express.json());

app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);
app.use('/api/blogs', middleware.tokenExtractor, blogsRouter);

if (process.env.NODE_ENV === 'test') {
  const testingRouter = require('./controllers/testing');
  app.use('/api/testing', testingRouter);
}

module.exports = app;
