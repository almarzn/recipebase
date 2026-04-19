import { expect, test } from "@playwright/test";
import type { Recipe } from "@/shared/models";
import { RecipeDetailPage } from "./recipe-detail.po";

const mockRecipeWithTimer = {
  id: "1",
  slug: "timer-recipe",
  name: "Timer Recipe",
  tags: [],
  source: null,
  yield: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  notes: null,
  components: [
    {
      id: "comp-1",
      slug: "main",
      name: "Main",
      position: 1,
      ingredients: [],
      steps: [
        {
          id: "step-1",
          slug: "wait",
          stepOrder: 1,
          body: "Wait patiently",
          timer: "PT10M",
        },
      ],
    },
  ],
} as Recipe;

const mockRecipeShortTimer = {
  id: "2",
  slug: "short-timer-recipe",
  name: "Short Timer",
  tags: [],
  source: null,
  yield: null,
  createdAt: "2026-01-01T00:00:00Z",
  updatedAt: "2026-01-01T00:00:00Z",
  notes: null,
  components: [
    {
      id: "comp-1",
      slug: "main",
      name: "Main",
      position: 1,
      ingredients: [],
      steps: [
        {
          id: "step-1",
          slug: "quick",
          stepOrder: 1,
          body: "Quick step",
          timer: "PT5S",
        },
      ],
    },
  ],
} as Recipe;

test("timer — displays initial duration", async ({ page }) => {
  await page.route("**/api/recipes/timer-recipe", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithTimer),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("timer-recipe");

  await test.step("shows timer toggle with initial time", async () => {
    await expect(detail.timerToggle(0)).toBeVisible();
    await expect(detail.timerDisplay(0)).toHaveText("10:00");
  });

  await test.step("does not show reset button in idle state", async () => {
    await expect(detail.timerReset(0)).not.toBeVisible();
  });
});

test("timer — starts counting down when clicked", async ({ page }) => {
  await page.route("**/api/recipes/timer-recipe", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithTimer),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("timer-recipe");
  await page.clock.install();
  await expect(detail.timerDisplay(0)).toHaveText("10:00");

  await test.step("click toggle to start", async () => {
    await detail.timerToggle(0).click();
  });

  await test.step("time decreases over time", async () => {
    await page.clock.fastForward(5000);
    const first = await detail.timerDisplay(0).textContent();
    await page.clock.fastForward(5000);
    await expect(detail.timerDisplay(0)).not.toHaveText(first ?? "");
  });
});

test("timer — pauses and resumes", async ({ page }) => {
  await page.route("**/api/recipes/timer-recipe", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithTimer),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("timer-recipe");
  await page.clock.install();
  await expect(detail.timerDisplay(0)).toHaveText("10:00");

  await test.step("start the timer", async () => {
    await detail.timerToggle(0).click();
    await page.clock.fastForward(3000);
    await expect(detail.timerDisplay(0)).toContainText("09:5");
  });

  await test.step("pause the timer", async () => {
    await detail.timerToggle(0).click();
  });

  await test.step("time does not advance while paused", async () => {
    const pausedTime = await detail.timerDisplay(0).textContent();
    await page.clock.fastForward(5000);
    await expect(detail.timerDisplay(0)).toHaveText(pausedTime ?? "");
  });

  await test.step("resume the timer", async () => {
    const pausedTime = await detail.timerDisplay(0).textContent();
    await detail.timerToggle(0).click();
    await page.clock.fastForward(3000);
    const resumedTime = await detail.timerDisplay(0).textContent();
    expect(resumedTime).not.toBe(pausedTime);
  });
});

test("timer — reset button appears and works when paused", async ({ page }) => {
  await page.route("**/api/recipes/timer-recipe", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeWithTimer),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("timer-recipe");
  await page.clock.install();
  await expect(detail.timerDisplay(0)).toHaveText("10:00");

  await test.step("start and pause the timer", async () => {
    await detail.timerToggle(0).click();
    await page.clock.fastForward(5000);
    await expect(detail.timerDisplay(0)).toContainText("09:5");
    await detail.timerToggle(0).click();
  });

  await test.step("reset button appears when paused", async () => {
    await expect(detail.timerReset(0)).toBeVisible();
  });

  await test.step("reset restores initial duration", async () => {
    await detail.timerReset(0).click();
    await expect(detail.timerDisplay(0)).toHaveText("10:00");
  });

  await test.step("reset button hidden after reset", async () => {
    await expect(detail.timerReset(0)).not.toBeVisible();
  });
});

test("timer — reaches completion and shows reset", async ({ page }) => {
  await page.route("**/api/recipes/short-timer-recipe", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(mockRecipeShortTimer),
    }),
  );

  const detail = new RecipeDetailPage(page);
  await detail.goto("short-timer-recipe");
  await page.clock.install();
  await expect(detail.timerDisplay(0)).toHaveText("00:05");

  await test.step("start the timer", async () => {
    await detail.timerToggle(0).click();
  });

  await test.step("timer reaches zero after 5 seconds", async () => {
    await page.clock.fastForward(5000);
    await expect(detail.timerDisplay(0)).toHaveText("00:00");
  });

  await test.step("reset button appears on completion", async () => {
    await expect(detail.timerReset(0)).toBeVisible();
  });

  await test.step("reset restores initial duration after completion", async () => {
    await detail.timerReset(0).click();
    await expect(detail.timerDisplay(0)).toHaveText("00:05");
  });
});
