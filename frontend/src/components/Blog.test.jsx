import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Blog from './Blog';

test('renders blog title and author', () => {
  const blog = {
    title: 'Testing React components',
    author: 'Jane Repolev',
    url: 'https://www.example.com/blog/testing',
    likes: 6,
    user: {
      username: 'johndoe',
      name: 'John A. Developer',
    },
  };

  const user = {
    username: 'johndoe',
    name: 'John A. Developer',
  };

  const mockHandleLike = vi.fn();
  const mockHandleDelete = vi.fn();

  render(
    <Blog
      blog={blog}
      user={user}
      handleLike={mockHandleLike}
      handleDelete={mockHandleDelete}
    />
  );

  // If text must exist -> getByText() (throws error if not found)
  // /string/ is Regex literal delimiters (exact text matching)
  expect(screen.getByText(/Testing React components/)).toBeVisible();
  expect(screen.getByText(/Jane Repolev/)).toBeVisible();

  // If the text might not exist -> queryByText() (returns null if not found)
  expect(screen.queryByText(blog.url)).not.toBeVisible();
  expect(screen.queryByText(/likes/i)).not.toBeVisible();
});

test('renders URL and number of likes shown after button click', async () => {
  const blog = {
    title: 'Testing React components',
    author: 'Jane Repolev',
    url: 'https://www.example.com/blog/testing',
    likes: 6,
    user: {
      username: 'johndoe',
      name: 'John A. Developer',
    },
  };

  const user = {
    username: 'johndoe',
    name: 'John A. Developer',
  };

  const mockHandleLike = vi.fn();
  const mockHandleDelete = vi.fn();

  render(
    <Blog
      blog={blog}
      user={user}
      handleLike={mockHandleLike}
      handleDelete={mockHandleDelete}
    />
  );

  const clickUser = userEvent.setup();
  const button = screen.getByText('view');
  await clickUser.click(button);

  expect(screen.queryByText(blog.url)).toBeVisible();
  expect(screen.queryByText(/likes/i)).toBeVisible();
});

test('if the like button is clicked twice, the event handler the component received as props is called twice', async () => {
  const blog = {
    title: 'Testing React components',
    author: 'Jane Repolev',
    url: 'https://www.example.com/blog/testing',
    likes: 6,
    user: {
      username: 'johndoe',
      name: 'John A. Developer',
    },
  };

  const user = {
    username: 'johndoe',
    name: 'John A. Developer',
  };

  const mockHandleLike = vi.fn();
  const mockHandleDelete = vi.fn();

  render(
    <Blog
      blog={blog}
      user={user}
      handleLike={mockHandleLike}
      handleDelete={mockHandleDelete}
    />
  );

  const clickUser = userEvent.setup();
  const button = screen.getByRole('button', { name: 'view' });
  await clickUser.click(button);

  /* 
    regex below:
    /.../ -> regular expression literal syntax
    like -> pattern matching (exact string 'like')
    i -> flag for case-insensitive matching
  */
  const likeButton = screen.getByRole('button', { name: /like/i });

  const clickCount = 2;
  for (let i = 0; i < clickCount; i++) {
    await clickUser.click(likeButton);
  }

  expect(mockHandleLike).toHaveBeenCalledTimes(clickCount);
});
