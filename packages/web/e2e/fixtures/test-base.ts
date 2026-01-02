import { test as base } from "@playwright/test";
import { LandingPage } from "../pages/landing.page";
import { SetupPage } from "../pages/setup.page";
import { InterviewPage } from "../pages/interview.page";
import { ResultsPage } from "../pages/results.page";

/**
 * Custom fixture types for page objects
 *
 * These fixtures provide pre-instantiated page objects for each page
 * in the Agent Advisor application, enabling cleaner and more
 * maintainable E2E tests.
 */
type PageFixtures = {
  /** Page Object for the Landing page (/) */
  landingPage: LandingPage;
  /** Page Object for the Setup page (/setup) */
  setupPage: SetupPage;
  /** Page Object for the Interview page (/interview) */
  interviewPage: InterviewPage;
  /** Page Object for the Results page (/results) */
  resultsPage: ResultsPage;
};

/**
 * Extended Playwright test with page object fixtures
 *
 * Usage:
 * ```typescript
 * import { test, expect } from "./fixtures/test-base";
 *
 * test("example test", async ({ landingPage }) => {
 *   await landingPage.goto();
 *   await expect(landingPage.heroTitle).toBeVisible();
 * });
 * ```
 *
 * Each page object fixture is lazily instantiated when accessed,
 * so tests only create the page objects they actually need.
 */
export const test = base.extend<PageFixtures>({
  landingPage: async ({ page }, use) => {
    await use(new LandingPage(page));
  },

  setupPage: async ({ page }, use) => {
    await use(new SetupPage(page));
  },

  interviewPage: async ({ page }, use) => {
    await use(new InterviewPage(page));
  },

  resultsPage: async ({ page }, use) => {
    await use(new ResultsPage(page));
  },
});

/**
 * Re-export expect from Playwright for convenience
 *
 * This allows tests to import both `test` and `expect` from
 * a single location:
 *
 * ```typescript
 * import { test, expect } from "./fixtures/test-base";
 * ```
 */
export { expect } from "@playwright/test";
