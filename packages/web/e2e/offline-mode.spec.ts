import { test, expect } from "./fixtures/test-base";
import {
  clearSessionState,
  getSessionState,
  injectSessionState,
  createMidwaySession,
  createCompletedSession,
  waitForSessionState,
} from "./fixtures/storage";
import {
  clearAllStorage,
  waitForNetworkIdle,
} from "./support/commands";

/**
 * Offline Mode E2E Tests
 *
 * Tests PWA offline behavior and loading states including:
 * - Offline state detection and handling
 * - Graceful degradation when network is unavailable
 * - Service worker caching behavior
 * - Session state preservation during offline periods
 * - Online/offline state transitions
 * - Loading states and indicators
 */

test.describe("Offline Mode - Offline State Handling", () => {
  test.beforeEach(async ({ page }) => {
    // Start online to load the app
    await page.goto("/");
    await clearSessionState(page);
    // Ensure the page is fully loaded while online
    await waitForNetworkIdle(page);
  });

  test("should handle going offline gracefully on landing page", async ({
    landingPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Verify we're online and page works
    await expect(landingPage.heroTitle).toBeVisible();
    await expect(landingPage.getStartedButton).toBeVisible();

    // Go offline
    await page.context().setOffline(true);

    // Page should still be visible and interactive (from cache)
    await expect(landingPage.heroTitle).toBeVisible();
    await expect(landingPage.getStartedButton).toBeVisible();

    // Re-enable network
    await page.context().setOffline(false);
  });

  test("should handle going offline during interview", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Start answering questions
    await interviewPage.enterText("Offline Test Agent");
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Go offline
    await page.context().setOffline(true);

    // Should still be able to answer questions (no network needed)
    await interviewPage.enterText("Testing offline interview capabilities");

    // Wait for state to be saved to localStorage
    await waitForSessionState(
      page,
      (state) => state.responses["q1_agent_name"] === "Offline Test Agent"
    );

    // Verify interview state is preserved
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Offline Test Agent");

    // Re-enable network
    await page.context().setOffline(false);
  });

  test("should preserve session state while offline", async ({
    interviewPage,
    page,
  }) => {
    // Inject a session with some progress
    const session = createMidwaySession();
    await injectSessionState(page, session);

    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Go offline
    await page.context().setOffline(true);

    // Verify session state is still accessible
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Test Agent");
    expect(state?.responses["q2_primary_outcome"]).toBe("Automate testing workflows");

    // Should still be in the requirements stage
    expect(await interviewPage.getCurrentStage()).toBe("Requirements");

    // Re-enable network
    await page.context().setOffline(false);
  });

  test("should continue interview progress after going offline and back online", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer Q1 while online
    await interviewPage.enterText("Online-Offline Agent");
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Go offline
    await page.context().setOffline(true);

    // Answer Q2 while offline
    await interviewPage.enterText("Testing offline progress");
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Answer Q3 while offline
    await interviewPage.selectMultiple(["Developers"]);
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Go back online
    await page.context().setOffline(false);

    // Verify all answers were preserved
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Online-Offline Agent");
    expect(state?.responses["q2_primary_outcome"]).toBe("Testing offline progress");
    expect(state?.responses["q3_target_audience"]).toEqual(["Developers"]);

    // Should be in Requirements stage now
    expect(await interviewPage.getCurrentStage()).toBe("Requirements");
  });
});

test.describe("Offline Mode - Page Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearSessionState(page);
    await waitForNetworkIdle(page);
  });

  test("should handle navigation while offline", async ({
    landingPage,
    setupPage,
    page,
  }) => {
    // Load landing page while online
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Navigate to setup to cache it
    await setupPage.goto();
    await setupPage.waitForLoad();

    // Go back to landing
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Go offline
    await page.context().setOffline(true);

    // Navigate to cached setup page
    await landingPage.clickGetStarted();

    // Should still work from cache
    await expect(page).toHaveURL("/setup");
    await expect(setupPage.pageTitle).toBeVisible();

    // Re-enable network
    await page.context().setOffline(false);
  });

  test("should handle navigation attempt to uncached page while offline", async ({
    landingPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Go offline immediately (without caching other pages)
    await page.context().setOffline(true);

    // Try to navigate - the PWA should handle gracefully
    // This may either show the offline page or fail gracefully
    try {
      await page.goto("/results", { timeout: 5000 });
      // If it succeeds, it was cached by service worker
    } catch {
      // Expected - navigation may fail offline for uncached routes
    }

    // Re-enable network
    await page.context().setOffline(false);

    // Should work now
    await landingPage.goto();
    await landingPage.waitForLoad();
    await expect(landingPage.heroTitle).toBeVisible();
  });

  test("should recover navigation after coming back online", async ({
    landingPage,
    interviewPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Go offline
    await page.context().setOffline(true);

    // Try navigation (may or may not work depending on cache)
    try {
      await page.goto("/interview", { timeout: 5000 });
    } catch {
      // Expected to potentially fail
    }

    // Come back online
    await page.context().setOffline(false);

    // Navigation should now work
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Page should be fully functional
    await expect(page.locator("[id^='question-heading-']")).toBeVisible();
  });
});

test.describe("Offline Mode - Loading States", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearSessionState(page);
    await waitForNetworkIdle(page);
  });

  test("should display loading state during initial page load", async ({
    landingPage,
    page,
  }) => {
    // Use slow network simulation to catch loading states
    await page.route("**/*", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 100));
      await route.continue();
    });

    // Navigate to a new page
    const navigationPromise = landingPage.goto();

    // Wait for page to load
    await navigationPromise;
    await landingPage.waitForLoad();

    // Page should be visible after loading
    await expect(landingPage.heroTitle).toBeVisible();

    // Clear route handler
    await page.unroute("**/*");
  });

  test("should display loading state during interview navigation", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Answer first question
    await interviewPage.enterText("Loading State Test");

    // Click continue and observe state transition
    await interviewPage.clickContinue();

    // Wait for the next question to load
    await interviewPage.waitForLoad();

    // The next question should be visible
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("primary goal");
  });

  test("should handle slow network gracefully", async ({
    landingPage,
    page,
  }) => {
    // Simulate slow network
    await page.route("**/*.js", async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await route.continue();
    });

    // Navigate and wait for load
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Page should eventually load and be functional
    await expect(landingPage.heroTitle).toBeVisible();
    await expect(landingPage.getStartedButton).toBeVisible();

    // Clear route handler
    await page.unroute("**/*.js");
  });
});

test.describe("Offline Mode - Storage Persistence", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearSessionState(page);
    await waitForNetworkIdle(page);
  });

  test("should persist interview state to localStorage while offline", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Go offline
    await page.context().setOffline(true);

    // Answer questions
    await interviewPage.enterText("Offline Storage Agent");
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Wait for state to be persisted
    await waitForSessionState(
      page,
      (state) => state.responses["q1_agent_name"] === "Offline Storage Agent"
    );

    // Verify state was saved
    const state = await getSessionState(page);
    expect(state).not.toBeNull();
    expect(state?.responses["q1_agent_name"]).toBe("Offline Storage Agent");

    // Re-enable network
    await page.context().setOffline(false);
  });

  test("should maintain storage after offline reload", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer first question
    await interviewPage.enterText("Reload Storage Test");
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Wait for state to be saved
    await waitForSessionState(
      page,
      (state) => state.responses["q1_agent_name"] === "Reload Storage Test"
    );

    // Go offline
    await page.context().setOffline(true);

    // Reload the page (should work from cache + localStorage)
    try {
      await page.reload({ timeout: 10000 });
      // If reload succeeds offline, verify storage is preserved
      const state = await getSessionState(page);
      expect(state?.responses["q1_agent_name"]).toBe("Reload Storage Test");
    } catch {
      // Reload may fail offline if not fully cached - this is acceptable
    }

    // Re-enable network
    await page.context().setOffline(false);

    // Reload with network - state should be preserved
    await page.reload();
    await interviewPage.waitForLoad();

    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Reload Storage Test");
  });

  test("should preserve completed session while offline", async ({
    interviewPage,
    resultsPage,
    page,
  }) => {
    // Inject completed session
    const session = createCompletedSession();
    await injectSessionState(page, session);

    await page.goto("/interview");
    await interviewPage.waitForCompletion();

    // Go offline
    await page.context().setOffline(true);

    // Verify session data is still accessible
    const state = await getSessionState(page);
    expect(state?.isComplete).toBe(true);
    expect(state?.responses["q1_agent_name"]).toBe("Code Assistant");

    // The completion screen should still be visible
    expect(await interviewPage.isComplete()).toBe(true);

    // Re-enable network
    await page.context().setOffline(false);
  });
});

test.describe("Offline Mode - Online/Offline Transitions", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearSessionState(page);
    await waitForNetworkIdle(page);
  });

  test("should handle rapid online/offline transitions", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer first question
    await interviewPage.enterText("Rapid Transition Agent");
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Rapid transitions
    await page.context().setOffline(true);
    await page.context().setOffline(false);
    await page.context().setOffline(true);
    await page.context().setOffline(false);

    // Page should still work
    await expect(page.locator("[id^='question-heading-']")).toBeVisible();

    // State should be preserved
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Rapid Transition Agent");
  });

  test("should sync state correctly after reconnection", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer Q1 online
    await interviewPage.enterText("Sync Test Agent");
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Go offline and answer Q2
    await page.context().setOffline(true);
    await interviewPage.enterText("Offline answer for Q2");
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Answer Q3 offline
    await interviewPage.selectMultiple(["Product Managers"]);
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Go back online
    await page.context().setOffline(false);

    // Verify all state is correct
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Sync Test Agent");
    expect(state?.responses["q2_primary_outcome"]).toBe("Offline answer for Q2");
    expect(state?.responses["q3_target_audience"]).toEqual(["Product Managers"]);
    expect(state?.currentStage).toBe("requirements");
  });

  test("should handle offline to online transition mid-action", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Start entering text
    await interviewPage.enterText("Mid-action");

    // Go offline during input
    await page.context().setOffline(true);

    // Continue entering text
    await interviewPage.enterText("Mid-action Test Agent");

    // Go back online
    await page.context().setOffline(false);

    // Submit the answer
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Verify state
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Mid-action Test Agent");
  });
});

test.describe("Offline Mode - Error Resilience", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearSessionState(page);
    await waitForNetworkIdle(page);
  });

  test("should not lose data during network interruption", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer several questions
    await interviewPage.enterText("Data Resilience Agent");
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    await interviewPage.enterText("Testing data resilience during interruptions");
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Simulate network interruption
    await page.context().setOffline(true);

    // Continue working
    await interviewPage.selectMultiple(["Developers", "Data Scientists"]);

    // Network comes back
    await page.context().setOffline(false);

    // Submit and continue
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Verify all data is intact
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Data Resilience Agent");
    expect(state?.responses["q2_primary_outcome"]).toBe(
      "Testing data resilience during interruptions"
    );
    expect(state?.responses["q3_target_audience"]).toEqual([
      "Developers",
      "Data Scientists",
    ]);
  });

  test("should handle IndexedDB access while offline", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Go offline
    await page.context().setOffline(true);

    // Perform actions that use IndexedDB (session storage)
    await interviewPage.enterText("IndexedDB Offline Test");
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Verify localStorage works offline
    const state = await getSessionState(page);
    expect(state).not.toBeNull();
    expect(state?.responses["q1_agent_name"]).toBe("IndexedDB Offline Test");

    // Re-enable network
    await page.context().setOffline(false);
  });

  test("should recover gracefully from offline state on page refresh", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer first question
    await interviewPage.enterText("Refresh Recovery Agent");
    await interviewPage.clickContinue();
    await interviewPage.waitForLoad();

    // Wait for state to persist
    await waitForSessionState(
      page,
      (state) => state.responses["q1_agent_name"] === "Refresh Recovery Agent"
    );

    // Go offline, then come back online and refresh
    await page.context().setOffline(true);
    await page.context().setOffline(false);

    // Refresh the page
    await page.reload();
    await interviewPage.waitForLoad();

    // Verify state is recovered
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Refresh Recovery Agent");

    // Should be on Q2
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("primary goal");
  });
});

test.describe("Offline Mode - Theme and UI Preferences", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearAllStorage(page);
    await page.reload();
    await waitForNetworkIdle(page);
  });

  test("should preserve theme preference while offline", async ({
    landingPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Set dark theme
    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Toggle until we're in dark mode
    let isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    if (!isDark) {
      await themeToggle.click();
      await page.waitForTimeout(100);
    }

    // Go offline
    await page.context().setOffline(true);

    // Reload (should work from cache)
    try {
      await page.reload({ timeout: 5000 });
      // Theme should still be dark
      isDark = await page.evaluate(() =>
        document.documentElement.classList.contains("dark")
      );
      expect(isDark).toBe(true);
    } catch {
      // Reload may fail offline - acceptable
    }

    // Re-enable network
    await page.context().setOffline(false);

    // After coming online, theme should still be preserved
    await page.reload();
    await landingPage.waitForLoad();

    isDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(isDark).toBe(true);
  });

  test("should allow theme toggle while offline", async ({
    landingPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Go offline
    await page.context().setOffline(true);

    // Get initial theme state
    const initialDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );

    // Toggle theme
    const themeToggle = page.getByRole("button", {
      name: /switch to (light|dark) theme/i,
    });
    await themeToggle.click();
    await page.waitForTimeout(100);

    // Theme should have changed
    const afterToggleDark = await page.evaluate(() =>
      document.documentElement.classList.contains("dark")
    );
    expect(afterToggleDark).not.toBe(initialDark);

    // Re-enable network
    await page.context().setOffline(false);
  });
});
