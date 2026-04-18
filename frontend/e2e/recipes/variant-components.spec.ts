import { expect, test } from "@playwright/test";
import type { Recipe } from "@/shared/models";
import { RecipeEditPage } from "./recipe-edit.po";
import { VariantComponentsPage } from "./variant-components.po";

const mockRecipeWithComponents: Recipe = {
  id: "1",
  slug: "pasta",
  title: "Fresh Pasta",
  description: "Handmade pasta with semolina flour and eggs",
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  variants: [
    {
      slug: "classic",
      name: "Classic",
      description: "Traditional egg pasta recipe",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      components: [
        {
          id: "comp-1",
          title: "Dough",
          description: "The pasta dough base",
          link: { quality: "self" },
          ingredients: [
            {
              slug: "flour",
              name: "Semolina Flour",
              notes: "Fine grade",
              quantity: { unit: "gram", amount: 300 },
            },
            {
              slug: "eggs",
              name: "Eggs",
              notes: "Room temperature",
              quantity: { unit: "unspecified", notes: "3 large eggs" },
            },
          ],
          steps: [
            {
              id: "step-1",
              text: "Mix flour and eggs in a large bowl",
              notes: "Use a fork to combine",
            },
            {
              id: "step-2",
              text: "Knead the dough for 10 minutes",
              notes: "Until smooth and elastic",
            },
          ],
        },
        {
          id: "comp-2",
          title: "Sauce",
          description: "Tomato basil sauce",
          link: { quality: "self" },
          ingredients: [
            {
              slug: "tomatoes",
              name: "San Marzano Tomatoes",
              notes: "Canned, whole",
              quantity: { unit: "gram", amount: 400 },
            },
          ],
          steps: [
            {
              id: "step-3",
              text: "Sauté garlic in olive oil",
              notes: "Medium heat, don't burn",
            },
          ],
        },
      ],
    },
    {
      slug: "spinach",
      name: "Spinach",
      description: "Green pasta with spinach",
      createdAt: "2026-01-01T00:00:00Z",
      updatedAt: "2026-01-01T00:00:00Z",
      components: [],
    },
  ],
};

test("variant components — navigates from recipe edit to components list", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithComponents),
    }),
  );

  const editPage = new RecipeEditPage(page);
  const componentsPage = new VariantComponentsPage(page);

  await test.step("navigate to recipe edit page", async () => {
    await editPage.goto("pasta", "variants/classic");
  });

  await test.step("click components link in navigation", async () => {
    await page.getByTestId("variant-components-link").click();
  });

  await test.step("verify URL contains components path", async () => {
    await expect(page).toHaveURL(/\/recipes\/pasta\/edit\/variants\/classic\/components/);
  });

  await test.step("verify components page is displayed", async () => {
    await expect(componentsPage.pageHeading).toBeVisible();
    await expect(componentsPage.pageHeading).toHaveText("Components");
    await expect(componentsPage.variantName).toHaveText("Classic");
  });

  await test.step("verify components list is rendered", async () => {
    await expect(componentsPage.componentsList).toBeVisible();
    await expect(componentsPage.componentCard("comp-1")).toBeVisible();
    await expect(componentsPage.componentCard("comp-2")).toBeVisible();
  });
});

test("variant components — selects a component and navigates to detail page", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithComponents),
    }),
  );

  const editPage = new RecipeEditPage(page);
  const componentsPage = new VariantComponentsPage(page);

  await test.step("navigate to components list", async () => {
    await editPage.goto("pasta", "variants/classic/components");
  });

  await test.step("click on first component card", async () => {
    await componentsPage.clickComponentCard("comp-1");
  });

  await test.step("verify URL navigated to component detail", async () => {
    await expect(page).toHaveURL(/\/recipes\/pasta\/edit\/components\/comp-1/);
  });

  await test.step("verify component detail page is displayed", async () => {
    await expect(componentsPage.componentDetailPage).toBeVisible();
    await expect(componentsPage.componentTitle).toHaveText("comp-1");
  });

  await test.step("verify placeholder message is shown", async () => {
    await expect(componentsPage.componentPlaceholder).toBeVisible();
    await expect(componentsPage.componentPlaceholder).toHaveText("Component detail page - coming soon.");
  });
});

test("variant components — navigates back from detail to list", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithComponents),
    }),
  );

  const editPage = new RecipeEditPage(page);
  const componentsPage = new VariantComponentsPage(page);

  await test.step("navigate to components list first to establish history", async () => {
    await editPage.goto("pasta", "variants/classic/components");
    await expect(componentsPage.componentsList).toBeVisible();
  });

  await test.step("navigate to component detail page", async () => {
    await componentsPage.clickComponentCard("comp-1");
    await expect(componentsPage.componentDetailPage).toBeVisible();
  });

  await test.step("click back button", async () => {
    await componentsPage.clickBackButton();
  });

  await test.step("verify returned to components list", async () => {
    await expect(page).toHaveURL(/\/recipes\/pasta\/edit\/variants\/classic\/components/);
    await expect(componentsPage.componentsList).toBeVisible();
  });
});

test("variant components — switch variant and verify components update", async ({ page }) => {
  await page.route("**/api/recipes/pasta", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithComponents),
    }),
  );

  const editPage = new RecipeEditPage(page);
  const componentsPage = new VariantComponentsPage(page);

  await test.step("navigate to classic variant components", async () => {
    await editPage.goto("pasta", "variants/classic/components");
  });

  await test.step("verify classic variant components are shown", async () => {
    await expect(componentsPage.variantName).toHaveText("Classic");
    await expect(componentsPage.componentCard("comp-1")).toBeVisible();
    await expect(componentsPage.componentCard("comp-2")).toBeVisible();
  });

  await test.step("switch to spinach variant", async () => {
    await editPage.selectVariant("spinach");
  });

  await test.step("verify URL updated to spinach variant", async () => {
    await expect(page).toHaveURL(/\/recipes\/pasta\/edit\/variants\/spinach/);
  });
});
