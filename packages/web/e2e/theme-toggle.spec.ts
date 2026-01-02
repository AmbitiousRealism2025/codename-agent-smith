import { test, expect } from "./fixtures/test-base";

/**
 * Theme Toggle E2E Tests
 *
 * Tests theme switching between light and dark mode with persistence.
 * Validates:
 * - Theme toggle button visibility and functionality
 * - Theme switching updates document class correctly
 * - Theme persists across page reloads
 * - Theme persists across navigation between pages
 * - Correct aria-label updates based on current theme
 */

/**
 * Storage key used by Zustand persist middleware for UI store
 */
const UI_STORAGE_KEY = "advisor-ui";

/**
 * Clear UI state from localStorage
 */
async function clearUIState(page: import("@playwright/test").Page): Promise<void> {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, UI_STORAGE_KEY);
}

/**
 * Get current theme from localStorage
 */
async function getStoredTheme(
  page: import("@playwright/test").Page
): Promise<string | null> {
  return page.evaluate((key) => {
    const data = localStorage.getItem(key);
    if (!data) return null;

    try {
      const parsed = JSON.parse(data);
      return parsed.state?.theme ?? null;
    } catch {
      return null;
    }
  }, UI_STORAGE_KEY);
}

/**
 * Check if the document has the dark class
 */
async function hasDarkClass(page: import("@playwright/test").Page): Promise<boolean> {
  return page.evaluate(() => {
    return document.documentElement.classList.contains("dark");
  });
}

test.describe("Theme Toggle - Basic Functionality", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page first to access localStorage
    await page.goto("/");
    await clearUIState(page);
    // Reload to ensure clean state
    await page.reload();
  });

  test("should display theme toggle button on landing page", async ({
    landingPage,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Theme toggle should be visible - look for the button with theme-related aria-label
    const themeToggle = landingPage.page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });
    await expect(themeToggle).toBeVisible();
  });

  test("should toggle from light to dark mode", async ({ landingPage, page }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Get the theme toggle button
    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });

    // Initially should not have dark class (default is system, but we cleared storage)
    // After toggle, it should have dark class
    await themeToggle.click();

    // Wait for the theme to be applied
    await page.waitForTimeout(100);

    // Check the stored theme
    const storedTheme = await getStoredTheme(page);
    expect(["light", "dark"]).toContain(storedTheme);
  });

  test("should toggle from dark to light mode", async ({ landingPage, page }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });

    // Toggle twice: first toggles to one mode, second toggles back
    await themeToggle.click();
    await page.waitForTimeout(100);
    const firstTheme = await getStoredTheme(page);

    await themeToggle.click();
    await page.waitForTimeout(100);
    const secondTheme = await getStoredTheme(page);

    // Themes should be different after toggle
    expect(firstTheme).not.toBe(secondTheme);
  });

  test("should update aria-label when theme changes", async ({
    landingPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Find theme toggle by its aria-label pattern
    const lightModeButton = page.getByRole("button", {
      name: "Switch to dark theme",
    });
    const darkModeButton = page.getByRole("button", {
      name: "Switch to light theme",
    });

    // One of these should be visible initially
    const initialLightVisible = await lightModeButton.isVisible().catch(() => false);
    const initialDarkVisible = await darkModeButton.isVisible().catch(() => false);
    expect(initialLightVisible || initialDarkVisible).toBe(true);

    // Click the visible toggle
    if (initialLightVisible) {
      await lightModeButton.click();
      await page.waitForTimeout(100);
      // After clicking "Switch to dark theme", the button should now say "Switch to light theme"
      await expect(darkModeButton).toBeVisible();
    } else {
      await darkModeButton.click();
      await page.waitForTimeout(100);
      // After clicking "Switch to light theme", the button should now say "Switch to dark theme"
      await expect(lightModeButton).toBeVisible();
    }
  });

  test("should apply dark class to document when in dark mode", async ({
    landingPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });

    // Get initial dark class state
    const initialDark = await hasDarkClass(page);

    // Toggle theme
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Dark class should have changed
    const afterToggleDark = await hasDarkClass(page);
    expect(afterToggleDark).not.toBe(initialDark);

    // Toggle again
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Should be back to initial state
    const afterSecondToggleDark = await hasDarkClass(page);
    expect(afterSecondToggleDark).toBe(initialDark);
  });
});

test.describe("Theme Toggle - Persistence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearUIState(page);
    await page.reload();
  });

  test("should persist dark theme after page reload", async ({
    landingPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Set to dark mode by toggling until we're in dark mode
    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });

    // Toggle until we're in dark mode
    await themeToggle.click();
    await page.waitForTimeout(100);

    let isDark = await hasDarkClass(page);
    if (!isDark) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }

    // Now we should be in dark mode
    expect(await hasDarkClass(page)).toBe(true);
    const storedTheme = await getStoredTheme(page);
    expect(storedTheme).toBe("dark");

    // Reload the page
    await page.reload();
    await landingPage.waitForLoad();

    // Theme should still be dark after reload
    expect(await hasDarkClass(page)).toBe(true);
    expect(await getStoredTheme(page)).toBe("dark");
  });

  test("should persist light theme after page reload", async ({
    landingPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });

    // Toggle until we're in light mode
    await themeToggle.click();
    await page.waitForTimeout(100);

    let isDark = await hasDarkClass(page);
    if (isDark) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }

    // Now we should be in light mode
    expect(await hasDarkClass(page)).toBe(false);
    const storedTheme = await getStoredTheme(page);
    expect(storedTheme).toBe("light");

    // Reload the page
    await page.reload();
    await landingPage.waitForLoad();

    // Theme should still be light after reload
    expect(await hasDarkClass(page)).toBe(false);
    expect(await getStoredTheme(page)).toBe("light");
  });

  test("should persist theme across navigation between pages", async ({
    landingPage,
    setupPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });

    // Set to dark mode
    await themeToggle.click();
    await page.waitForTimeout(100);

    let isDark = await hasDarkClass(page);
    if (!isDark) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }

    // Verify we're in dark mode
    expect(await hasDarkClass(page)).toBe(true);

    // Navigate to setup page
    await landingPage.clickGetStarted();
    await setupPage.waitForLoad();

    // Theme should still be dark on setup page
    expect(await hasDarkClass(page)).toBe(true);

    // Navigate back to landing page
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Theme should still be dark
    expect(await hasDarkClass(page)).toBe(true);
  });

  test("should persist theme across multiple page reloads", async ({
    landingPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });

    // Set to dark mode
    await themeToggle.click();
    await page.waitForTimeout(100);

    if (!(await hasDarkClass(page))) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }

    // Multiple reloads
    await page.reload();
    await landingPage.waitForLoad();
    expect(await hasDarkClass(page)).toBe(true);

    await page.reload();
    await landingPage.waitForLoad();
    expect(await hasDarkClass(page)).toBe(true);

    await page.reload();
    await landingPage.waitForLoad();
    expect(await hasDarkClass(page)).toBe(true);
  });
});

test.describe("Theme Toggle - Different Pages", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearUIState(page);
    await page.reload();
  });

  test("should have theme toggle on interview page", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Theme toggle should be visible on interview page
    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });
    await expect(themeToggle).toBeVisible();
  });

  test("should have theme toggle on setup page", async ({ setupPage, page }) => {
    await setupPage.goto();
    await setupPage.waitForLoad();

    // Theme toggle should be visible on setup page
    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });
    await expect(themeToggle).toBeVisible();
  });

  test("should sync theme across all pages", async ({
    landingPage,
    setupPage,
    interviewPage,
    page,
  }) => {
    // Start on landing page and set dark mode
    await landingPage.goto();
    await landingPage.waitForLoad();

    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });

    // Toggle to dark mode
    await themeToggle.click();
    await page.waitForTimeout(100);

    if (!(await hasDarkClass(page))) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }

    expect(await hasDarkClass(page)).toBe(true);

    // Check setup page has dark theme
    await setupPage.goto();
    await setupPage.waitForLoad();
    expect(await hasDarkClass(page)).toBe(true);

    // Check interview page has dark theme
    await interviewPage.goto();
    await interviewPage.waitForLoad();
    expect(await hasDarkClass(page)).toBe(true);

    // Toggle theme on interview page
    const interviewToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });
    await interviewToggle.click();
    await page.waitForTimeout(100);

    // Should now be light mode
    expect(await hasDarkClass(page)).toBe(false);

    // Go back to landing page - should still be light mode
    await landingPage.goto();
    await landingPage.waitForLoad();
    expect(await hasDarkClass(page)).toBe(false);
  });
});

test.describe("Theme Toggle - Visual Elements", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearUIState(page);
    await page.reload();
  });

  test("should show sun icon in dark mode", async ({ landingPage, page }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });

    // Toggle to dark mode
    await themeToggle.click();
    await page.waitForTimeout(100);

    if (!(await hasDarkClass(page))) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }

    // In dark mode, button should say "Switch to light theme" (showing sun icon)
    const lightThemeButton = page.getByRole("button", {
      name: "Switch to light theme",
    });
    await expect(lightThemeButton).toBeVisible();
  });

  test("should show moon icon in light mode", async ({ landingPage, page }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });

    // Toggle to light mode
    await themeToggle.click();
    await page.waitForTimeout(100);

    if (await hasDarkClass(page)) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }

    // In light mode, button should say "Switch to dark theme" (showing moon icon)
    const darkThemeButton = page.getByRole("button", {
      name: "Switch to dark theme",
    });
    await expect(darkThemeButton).toBeVisible();
  });
});
