require('dotenv').config();

const USERS = {
  alex: {
    name: 'Alex Morgan',
    username: 'testUser01',
    password: process.env.TEST_USER_01_PASSWORD,
  },
  jane: {
    name: 'Jane Example',
    username: 'jane_test98',
    password: process.env.TEST_USER_02_PASSWORD,
  },
};

const BLOGS = {
  functional: {
    title: 'Functional Programming in JavaScript: A Practical Guide',
    author: 'Mark N. Talbot',
    url: 'https://devjournal.io/posts/fp-js-guide',
  },
  ciCd: {
    title: 'Breaking the Build: Why CI/CD Fails and What To Do About It',
    author: 'Ravi Sinha',
    url: 'https://buildculture.dev/blogs/ci-cd-fails',
  },
  eventLoop: {
    title: 'Mastering the Event Loop in JavaScript',
    author: 'Dr. Eliza Thornton',
    url: 'https://techspere.blogs.io/event-loop-mastery',
  },
};

export { USERS, BLOGS };
