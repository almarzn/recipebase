import { test, expect } from '@playwright/test';
import { RecipeListPage } from './recipe-list.po';

const mockRecipes = [
  {
    id: '1',
    slug: 'pasta',
    title: 'Pasta',
    description: 'A nice pasta',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    variants: [],
  },
  {
    id: '2',
    slug: 'salad',
    title: 'Salad',
    description: null,
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
    variants: [],
  },
];

test('recipe list — empty state', async ({ page }) => {
  await page.route('**/api/recipes', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );

  const recipeList = new RecipeListPage(page);
  await recipeList.goto();

  await test.step('shows empty message', async () => {
    await expect(recipeList.empty).toBeVisible();
  });
});

test('recipe list — populated state', async ({ page }) => {
  await page.route('**/api/recipes', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockRecipes),
    }),
  );

  const recipeList = new RecipeListPage(page);
  await recipeList.goto();

  await test.step('shows recipe count', async () => {
    await expect(recipeList.count).toBeVisible();
    await expect(recipeList.count).toHaveText('2 recipe(s)');
  });
});

test('recipe list — error state', async ({ page }) => {
  await page.route('**/api/recipes', (route) =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Internal error' }),
    }),
  );

  const recipeList = new RecipeListPage(page);
  await recipeList.goto();

  await test.step('shows error message', async () => {
    await expect(recipeList.error).toBeVisible();
  });
});

test('root redirects to /recipes', async ({ page }) => {
  await page.route('**/api/recipes', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: '[]' }),
  );

  await page.goto('/');

  await test.step('navigates to recipes page', async () => {
    await expect(page).toHaveURL(/\/recipes/);
  });
});
