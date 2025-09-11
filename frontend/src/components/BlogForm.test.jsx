import { render, screen } from '@testing-library/react';
import BlogForm from './BlogForm';
import userEvent from '@testing-library/user-event';

test('<BlogForm /> updates parent state and calls onSubmit', async () => {
  const user = userEvent.setup();
  const createBlog = vi.fn();

  render(<BlogForm createBlog={createBlog} />);

  /*
    regex below:
    /.../ -> regular expression literal syntax
    title -> pattern matching (exact string 'title')
    i -> flag for case-insensitive matching
  */
  const titleInput = screen.getByLabelText(/title/i);
  const authorInput = screen.getByLabelText(/author/i);
  const urlInput = screen.getByLabelText(/url/i);

  await user.type(titleInput, 'title for testing a form');
  await user.type(authorInput, 'author for testing a form');
  await user.type(urlInput, 'url for testing a form');

  const createButton = screen.getByRole('button', { name: 'create' });

  await user.click(createButton);

  expect(createBlog).toHaveBeenCalledTimes(1);

  expect(createBlog.mock.calls[0][0].title).toBe('title for testing a form');
});
