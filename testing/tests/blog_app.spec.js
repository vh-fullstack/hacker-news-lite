const { test, expect, beforeEach, describe } = require('@playwright/test');
const { loginWith, createBlog } = require('./helper');
require('dotenv').config()

// Reminder: Pages are isolated between tests due to the Browser Context!
// i.e. all tests are performed onto a 'fresh' browser environment
describe('Blog app', () => {
  beforeEach(async ({ page, request }) => {
    // empty the db
    await request.post('/api/testing/reset');

    // create a user for the backend
    await request.post('/api/users', {
      data: {
        name: 'Alex Morgan',
        username: 'testUser01',
        password: process.env.ANOTHER_SECURE_PASSWORD_01,
      },
    });
    await page.goto('/');
  });

  test('Login form is shown', async ({ page }) => {
    await page.getByRole('button', { name: 'log in' }).click();
    await expect(page.getByLabel('username')).toBeVisible();
    await expect(page.getByLabel('password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'sign in' })).toBeVisible();
  });

  // GROUP 1: Focus on Login/Logout functionality
  describe('Login and Logout', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'log in' }).click();
    });

    test('succeeds with correct credentials', async ({ page }) => {
      await loginWith(page, 'testUser01', 'SecureTest123!');
      await expect(page.getByText('Alex Morgan logged in')).toBeVisible();
    });

    test('fails with wrong credentials', async ({ page }) => {
      await loginWith(page, 'testUser01', 'wrongPassword');
      const errorDiv = page.locator('.notification.error');
      await expect(errorDiv).toContainText('wrong username or password');
      await expect(page.getByText('Alex Morgan logged in')).not.toBeVisible();
    });

    test('a logged-in user can log out', async ({ page }) => {
      await loginWith(page, 'testUser01', 'SecureTest123!');
      await page.getByRole('button', { name: 'Logout' }).click();
      await expect(page.getByRole('button', { name: 'log in' })).toBeVisible();
    });
  });
  // GROUP 2: Focus on blog creation and interaction for a single logged-in user
  describe('When a user is logged in', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'log in' }).click();
      await loginWith(page, 'testUser01', 'SecureTest123!');
    });

    test('a new blog can be created', async ({ page }) => {
      await page.getByRole('button', { name: 'create new blog' }).click();
      await createBlog(page, {
        title: 'Functional Programming in JavaScript: A Practical Guide',
        author: 'Mark N. Talbot',
        url: 'https://devjournal.io/posts/fp-js-guide',
      });

      // targets all <div> elements with the class blog.
      await expect(
        page.locator('div.blogTitleAuthor', {
          hasText: 'Functional Programming',
        })
      ).toBeVisible();
    });

    describe('and a blog exists', () => {
      beforeEach(async ({ page }) => {
        await page.getByRole('button', { name: 'create new blog' }).click();
        await createBlog(page, {
          title: 'Breaking the Build: Why CI/CD Fails and What To Do About It',
          author: 'Ravi Sinha',
          url: 'https://buildculture.dev/blogs/ci-cd-fails',
        });
      });

      test('the blog can be liked', async ({ page }) => {
        // Only one blog so we select the only 'view' button
        await page.getByRole('button', { name: 'view' }).click();
        await expect(page.getByText('likes: 0like')).toBeVisible();
        await page.getByRole('button', { name: 'like', exact: true }).click();
        await expect(page.getByText('likes: 1like')).toBeVisible();
      });

      test('a blog can be deleted by the user who created it', async ({
        page,
      }) => {
        await page.getByRole('button', { name: 'view' }).click();
        page.once('dialog', (dialog) => dialog.accept());
        await page.getByRole('button', { name: 'remove' }).click();

        // Assert that the blog is no longer visible
        await expect(
          page.locator('.blogTitleAuthor', {
            hasText:
              'Breaking the Build: Why ' +
              'CI/CD Fails and What To Do About It',
          })
        ).not.toBeVisible();
      });
    });
  });

  // GROUP 3: Focus on the more complex multi-user permission scenario
  describe('Blog deletion permissions', () => {
    test('a user can only see the delete button for their own blogs', async ({
      page,
      request,
    }) => {
      await page.getByRole('button', { name: 'log in' }).click();
      await loginWith(page, 'testUser01', 'SecureTest123!');
      await page.getByRole('button', { name: 'create new blog' }).click();
      await createBlog(page, {
        title: "Alex's Blog",
        author: 'Alex Morgan',
        url: 'http://AlexMorganRules.com',
      });

      await page.getByRole('button', { name: 'Logout' }).click();

      // Create a second user via the API
      await request.post('/api/users', {
        data: {
          name: 'Jamie Harper',
          username: 'testdev123',
          password: process.env.ANOTHER_SECURE_PASSWORD_02
        },
      });

      // Login as the second user (Jamie) and create a blog
      await page.getByRole('button', { name: 'log in' }).click();
      await loginWith(page, 'testdev123', 'StrongPass42!');
      await page.getByRole('button', { name: 'create new blog' }).click();
      await createBlog(page, {
        title: "Jamie's Blog",
        author: 'Jamie Harper',
        url: 'http://JamieHarperForever.ca',
      });

      /* Warning/History: 
      Code has a very common scenario that trips up even experienced testers:
      The app's frontend (React) code responds to the click.
      It expands the details for the first blog.
      In doing so, it removes the "view" button from the DOM and replaces it with a "hide" button.
      This change to the first blog component causes the entire list of blogs to re-render.
      The loop continues to the second iteration. 
      The button variable is now viewButton2. 
      However, because of the re-render in step 4/5,
      the original DOM element that viewButton2 was pointing to no longer exists.
      It has been replaced by a new, identical-looking element.
      When Playwright tries to execute await button.click() on viewButton2,
      it fails with a "stale element" error because the element 
      it was originally told to find has been detached from the DOM.*/

      // Temporary solution to the problem above (buttons one and two)
      // Notice that .first() implies more than one button but then
      // simply becomes .click() [locators taken from test:ui]
      await page.getByRole('button', { name: 'view' }).first().click();
      await page.getByRole('button', { name: 'view' }).click();

      // Assert: The 'remove' button is NOT visible for Alex's blog
      const alexBlog = page.locator('.blog', { hasText: "Alex's Blog" });
      await expect(
        alexBlog.getByRole('button', { name: 'remove' })
      ).not.toBeVisible();

      // Assert: The 'remove' button IS visible for Jamie's blog.
      const jamiesBlog = page.locator('.blog', { hasText: "Jamie's Blog" });
      await expect(
        jamiesBlog.getByRole('button', { name: 'remove' })
      ).toBeVisible();
    });
  });
  describe('Blog list sorting', () => {
    beforeEach(async ({ page }) => {
      await page.getByRole('button', { name: 'log in' }).click();
      await loginWith(page, 'testUser01', 'SecureTest123!');
      await page.getByRole('button', { name: 'create new blog' }).click();

      // Blogs below have expects in order to 'wait' for observable states.

      // Create Blog A - This will have 1 like
      await createBlog(page, {
        title: 'Blog with one like',
        author: 'Author A',
        url: '...',
      });
      await expect(
        page.locator('.blog', { hasText: 'Blog with one like' })
      ).toBeVisible();

      // Create Blog B - This will have 3 likes
      await createBlog(page, {
        title: 'Blog with three likes',
        author: 'Author B',
        url: '...',
      });
      await expect(
        page.locator('.blog', { hasText: 'Blog with three likes' })
      ).toBeVisible();

      // Create Blog C - This will have 0 likes
      await createBlog(page, {
        title: 'Blog with zero likes',
        author: 'Author C',
        url: '...',
      });
      await expect(
        page.locator('.blog', { hasText: 'Blog with zero likes' })
      ).toBeVisible();

      // Find and like "C Blog with three likes" 3 times
      const blogWithThreeLikes = page.locator('.blog', {
        hasText: 'Blog with three likes',
      });
      await blogWithThreeLikes.getByRole('button', { name: 'view' }).click();
      // Wait for the like button to be ready before clicking
      const likeButtonThree = blogWithThreeLikes.getByRole('button', {
        name: 'like',
      });
      await expect(likeButtonThree).toBeVisible();
      await likeButtonThree.click(); // like 1
      await expect(blogWithThreeLikes.getByText('likes: 1like')).toBeVisible();
      await likeButtonThree.click(); // like 2
      await expect(blogWithThreeLikes.getByText('likes: 2like')).toBeVisible();
      await likeButtonThree.click(); // like 3
      await expect(blogWithThreeLikes.getByText('likes: 3like')).toBeVisible();
      await blogWithThreeLikes.getByRole('button', { name: 'hide' }).click();

      // Find and like "A Blog with one like" 1 time
      const blogWithOneLike = page.locator('.blog', {
        hasText: 'Blog with one like',
      });
      await blogWithOneLike.getByRole('button', { name: 'view' }).click();
      const likeButtonOne = blogWithOneLike.getByRole('button', {
        name: 'like',
      });
      await expect(likeButtonOne).toBeVisible();
      await likeButtonOne.click(); // like 1
      await expect(blogWithOneLike.getByText('likes: 1like')).toBeVisible();
      await blogWithOneLike.getByRole('button', { name: 'hide' }).click();
    });
    test.only('blogs are sorted by the number of likes in descending order', async ({
      page,
    }) => {
      const blogTitlesLocator = page.locator('.blog .blogTitleAuthor');

      const expectedOrder = [
        'Blog with three likes by Author B',
        'Blog with one like by Author A',
        'Blog with zero likes by Author C',
      ];

      await expect(blogTitlesLocator).toHaveText(expectedOrder);
    });
  });
});
