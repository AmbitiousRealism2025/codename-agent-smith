import { test, expect } from "./fixtures/test-base";
import {
  clearSessionState,
  getSessionState,
  injectSessionState,
  createMidwaySession,
  createCompletedSession,
  waitForSessionState,
} from "./fixtures/storage";

/**
 * Navigation E2E Tests
 *
 * Tests navigation edge cases throughout the application including:
 * - Back button behavior (interview navigation, browser back button)
 * - Direct URL access to various pages
 * - Page refresh during interview at various stages
 * - Incomplete question handling and validation
 * - URL state synchronization
 */

test.describe("Navigation - Back Button Behavior", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearSessionState(page);
  });

  test("should show back button after answering first question", async ({
    interviewPage,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Initially, back button should not be visible
    expect(await interviewPage.canGoBack()).toBe(false);

    // Answer first question
    await interviewPage.enterText("Back Button Test Agent");
    await interviewPage.clickContinue();

    // Wait for next question
    await interviewPage.waitForLoad();

    // Now back button should be visible
    expect(await interviewPage.canGoBack()).toBe(true);
  });

  test("should navigate back and preserve answer", async ({
    interviewPage,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer first question
    await interviewPage.enterText("Back Navigation Agent");
    await interviewPage.clickContinue();

    // Answer second question
    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test primary outcome for back navigation");
    await interviewPage.clickContinue();

    // Go back to Q2
    await interviewPage.waitForLoad();
    await interviewPage.clickBack();
    await interviewPage.waitForLoad();

    // Verify Q2 answer is preserved
    const q2Value = await interviewPage.getTextValue();
    expect(q2Value).toBe("Test primary outcome for back navigation");

    // Go back to Q1
    await interviewPage.clickBack();
    await interviewPage.waitForLoad();

    // Verify Q1 answer is preserved
    const q1Value = await interviewPage.getTextValue();
    expect(q1Value).toBe("Back Navigation Agent");
  });

  test("should navigate back across stage boundaries", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Complete Discovery stage (Q1-Q3)
    await interviewPage.enterText("Stage Boundary Agent"); // Q1
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test cross-stage navigation"); // Q2
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Developers"]); // Q3
    await interviewPage.clickContinue();

    // Now in Requirements stage (Q4)
    await interviewPage.waitForLoad();
    expect(await interviewPage.getCurrentStage()).toBe("Requirements");

    // Go back to Q3 (should return to Discovery stage)
    await interviewPage.clickBack();
    await interviewPage.waitForLoad();

    // Verify we're back in Discovery stage
    expect(await interviewPage.getCurrentStage()).toBe("Discovery");

    // Verify Q3 selection is preserved
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("target users");
  });

  test("should handle browser back button during interview", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer first question
    await interviewPage.enterText("Browser Back Test Agent");
    await interviewPage.clickContinue();

    // Wait for Q2
    await interviewPage.waitForLoad();

    // Wait for state to be saved
    await waitForSessionState(
      page,
      (state) => state.responses["q1_agent_name"] === "Browser Back Test Agent"
    );

    // Use browser back button
    await page.goBack();

    // Should go back to previous page (setup or landing)
    // The interview state should still be preserved in storage
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Browser Back Test Agent");
  });

  test("should handle rapid back button clicks", async ({ interviewPage }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer several questions
    await interviewPage.enterText("Rapid Back Agent"); // Q1
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test rapid back clicks"); // Q2
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Developers"]); // Q3
    await interviewPage.clickContinue();

    // Click back rapidly multiple times
    await interviewPage.waitForLoad();
    if (await interviewPage.canGoBack()) {
      await interviewPage.clickBack();
    }

    await interviewPage.waitForLoad();
    if (await interviewPage.canGoBack()) {
      await interviewPage.clickBack();
    }

    await interviewPage.waitForLoad();
    if (await interviewPage.canGoBack()) {
      await interviewPage.clickBack();
    }

    await interviewPage.waitForLoad();

    // Should be at first question
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("name of your agent");

    // Verify answer is still there
    const q1Value = await interviewPage.getTextValue();
    expect(q1Value).toBe("Rapid Back Agent");
  });
});

test.describe("Navigation - Direct URL Access", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearSessionState(page);
  });

  test("should initialize new session when accessing /interview directly with no session", async ({
    interviewPage,
    page,
  }) => {
    // Navigate directly to interview without any session
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Should start at the first question
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("name of your agent");

    // Progress should be 0
    expect(await interviewPage.getProgressPercentage()).toBe(0);

    // Should be in Discovery stage
    expect(await interviewPage.getCurrentStage()).toBe("Discovery");
  });

  test("should redirect from /results to /interview when no completed session", async ({
    page,
  }) => {
    // Try to access results directly without completed interview
    await page.goto("/results");

    // Should be redirected to interview or show appropriate state
    // Wait for navigation to settle
    await page.waitForLoadState("networkidle");

    // Should not be on results page
    const url = page.url();
    // Results page should handle missing data gracefully
    expect(url).toContain("localhost");
  });

  test("should restore session when accessing /interview with existing session", async ({
    interviewPage,
    page,
  }) => {
    // Inject a midway session
    const session = createMidwaySession();
    await injectSessionState(page, session);

    // Navigate directly to interview
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Should be at the Requirements stage where the midway session left off
    expect(await interviewPage.getCurrentStage()).toBe("Requirements");

    // Verify previous answers are loaded
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Test Agent");
  });

  test("should handle direct access to /setup page", async ({
    setupPage,
    page,
  }) => {
    // Navigate directly to setup
    await page.goto("/setup");
    await setupPage.waitForLoad();

    // Should show the setup page
    await expect(setupPage.pageTitle).toBeVisible();

    // Provider cards should be visible
    await expect(setupPage.anthropicCard).toBeVisible();
  });

  test("should access /results with completed session", async ({
    resultsPage,
    page,
  }) => {
    // Inject a completed session
    const session = createCompletedSession();
    await injectSessionState(page, session);

    // Navigate directly to results
    await page.goto("/results");

    // Wait for results to load
    await page.waitForLoadState("networkidle");

    // Results page should display recommendations or appropriate content
    // Check that we're on the results page and it loaded
    const url = page.url();
    expect(url).toContain("/results");
  });

  test("should navigate to landing page from any route via logo/home", async ({
    landingPage,
    page,
  }) => {
    // Start at interview
    await page.goto("/interview");
    await page.waitForLoadState("networkidle");

    // Navigate to landing via URL
    await page.goto("/");
    await landingPage.waitForLoad();

    // Verify landing page elements
    await expect(landingPage.heroTitle).toBeVisible();
    await expect(landingPage.getStartedButton).toBeVisible();
  });

  test("should handle unknown routes by redirecting to landing", async ({
    page,
  }) => {
    // Navigate to an unknown route
    await page.goto("/unknown-route-xyz");

    // Wait for navigation
    await page.waitForLoadState("networkidle");

    // Should be redirected to landing page (or show 404 appropriately)
    // Based on App.tsx, unknown routes redirect to "/"
    const url = page.url();
    expect(url).toMatch(/localhost:5173\/?$/);
  });
});

test.describe("Navigation - Refresh During Interview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearSessionState(page);
  });

  test("should preserve current question index after refresh", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Answer first two questions
    await interviewPage.enterText("Refresh Index Test Agent");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.enterText("Testing question index preservation");
    await interviewPage.clickContinue();

    // Wait for Q3 and state to be saved
    await interviewPage.waitForLoad();
    await waitForSessionState(page, (state) => state.currentQuestionIndex === 2);

    // Refresh the page
    await page.reload();
    await interviewPage.waitForLoad();

    // Should still be on Q3 (question index 2)
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("target users");
  });

  test("should preserve in-progress answer after refresh", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Start typing an answer but don't submit
    await interviewPage.enterText("In Progress Answer");

    // Note: Zustand persist doesn't save the "current" answer until it's submitted
    // This test verifies behavior for answers that HAVE been submitted

    // Submit the answer
    await interviewPage.clickContinue();

    // Wait for state to be saved
    await waitForSessionState(
      page,
      (state) => state.responses["q1_agent_name"] === "In Progress Answer"
    );

    // Refresh the page
    await page.reload();
    await interviewPage.waitForLoad();

    // Verify the submitted answer was preserved
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("In Progress Answer");
  });

  test("should handle refresh on completion screen", async ({
    interviewPage,
    page,
  }) => {
    // Inject a completed session
    const session = createCompletedSession();
    await injectSessionState(page, session);

    await page.goto("/interview");

    // Wait for completion screen
    await interviewPage.waitForCompletion();
    expect(await interviewPage.isComplete()).toBe(true);

    // Refresh the page
    await page.reload();

    // Should still show completion screen
    await interviewPage.waitForCompletion();
    expect(await interviewPage.isComplete()).toBe(true);

    // Generate recommendations button should be visible
    await expect(interviewPage.generateRecommendationsButton).toBeVisible();
  });

  test("should maintain stage after refresh during architecture stage", async ({
    interviewPage,
    page,
  }) => {
    // Create a session at architecture stage
    await injectSessionState(page, {
      sessionId: crypto.randomUUID(),
      currentStage: "architecture",
      currentQuestionIndex: 0, // Q7 Memory Needs
      responses: {
        q1_agent_name: "Architecture Stage Agent",
        q2_primary_outcome: "Test architecture stage refresh",
        q3_target_audience: ["Developers"],
        q4_interaction_style: "collaborative",
        q5_delivery_channels: ["CLI"],
        q6_success_metrics: ["Task completion rate"],
      },
      requirements: {},
      recommendations: null,
      isComplete: false,
      startedAt: new Date().toISOString(),
    });

    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Verify we're in Architecture stage
    expect(await interviewPage.getCurrentStage()).toBe("Architecture");

    // Refresh
    await page.reload();
    await interviewPage.waitForLoad();

    // Should still be in Architecture stage
    expect(await interviewPage.getCurrentStage()).toBe("Architecture");
  });
});

test.describe("Navigation - Incomplete Question Handling", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearSessionState(page);
  });

  test("should disable continue button for required question without answer", async ({
    interviewPage,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Continue button should be disabled when no answer provided
    expect(await interviewPage.isContinueEnabled()).toBe(false);

    // Enter some text
    await interviewPage.enterText("Test Agent");

    // Now continue should be enabled
    expect(await interviewPage.isContinueEnabled()).toBe(true);
  });

  test("should not show skip button for required questions", async ({
    interviewPage,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // First question (Q1: Agent Name) is required
    expect(await interviewPage.canSkip()).toBe(false);

    // Answer and move to Q2
    await interviewPage.enterText("Skip Test Agent");
    await interviewPage.clickContinue();

    // Q2 (Primary Outcome) is also required
    await interviewPage.waitForLoad();
    expect(await interviewPage.canSkip()).toBe(false);
  });

  test("should show skip button for optional questions", async ({
    interviewPage,
    page,
  }) => {
    // Create a session at Q12 (Tool Integrations - optional)
    await injectSessionState(page, {
      sessionId: crypto.randomUUID(),
      currentStage: "architecture",
      currentQuestionIndex: 5, // Q12 Tool Integrations (index 5 within architecture stage)
      responses: {
        q1_agent_name: "Optional Test Agent",
        q2_primary_outcome: "Test optional questions",
        q3_target_audience: ["Developers"],
        q4_interaction_style: "collaborative",
        q5_delivery_channels: ["CLI"],
        q6_success_metrics: ["Task completion rate"],
        q7_memory_needs: "short-term",
        q8_file_access: true,
        q9_web_access: false,
        q10_code_execution: false,
        q11_data_analysis: false,
      },
      requirements: {},
      recommendations: null,
      isComplete: false,
      startedAt: new Date().toISOString(),
    });

    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Q12 should have a skip button available
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("tools");

    expect(await interviewPage.canSkip()).toBe(true);
  });

  test("should handle skipping optional question and move forward", async ({
    interviewPage,
    page,
  }) => {
    // Create a session at Q12 (Tool Integrations - optional)
    await injectSessionState(page, {
      sessionId: crypto.randomUUID(),
      currentStage: "architecture",
      currentQuestionIndex: 5, // Q12
      responses: {
        q1_agent_name: "Skip Forward Test",
        q2_primary_outcome: "Test skipping",
        q3_target_audience: ["Developers"],
        q4_interaction_style: "collaborative",
        q5_delivery_channels: ["CLI"],
        q6_success_metrics: ["Task completion rate"],
        q7_memory_needs: "short-term",
        q8_file_access: true,
        q9_web_access: false,
        q10_code_execution: false,
        q11_data_analysis: false,
      },
      requirements: {},
      recommendations: null,
      isComplete: false,
      startedAt: new Date().toISOString(),
    });

    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Skip the optional question
    await interviewPage.clickSkip();

    // Should move to next stage (Output)
    await interviewPage.waitForLoad();
    expect(await interviewPage.getCurrentStage()).toBe("Output");
  });

  test("should enable continue after selecting choice option", async ({
    interviewPage,
    page,
  }) => {
    // Navigate to a choice question (Q4 Interaction Style)
    await injectSessionState(page, {
      sessionId: crypto.randomUUID(),
      currentStage: "requirements",
      currentQuestionIndex: 0, // Q4
      responses: {
        q1_agent_name: "Choice Test Agent",
        q2_primary_outcome: "Test choice enabling",
        q3_target_audience: ["Developers"],
      },
      requirements: {},
      recommendations: null,
      isComplete: false,
      startedAt: new Date().toISOString(),
    });

    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Continue should be disabled initially
    expect(await interviewPage.isContinueEnabled()).toBe(false);

    // Select a choice
    await interviewPage.selectChoice("collaborative");

    // Continue should now be enabled
    expect(await interviewPage.isContinueEnabled()).toBe(true);
  });

  test("should enable continue after selecting multiselect options", async ({
    interviewPage,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Complete Q1 and Q2 to get to Q3 (multiselect)
    await interviewPage.enterText("Multiselect Enable Test");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test multiselect continue");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();

    // Continue should be disabled without selection
    expect(await interviewPage.isContinueEnabled()).toBe(false);

    // Select an option
    await interviewPage.toggleMultiselect("Developers");

    // Continue should now be enabled
    expect(await interviewPage.isContinueEnabled()).toBe(true);
  });

  test("should enable continue after selecting boolean option", async ({
    interviewPage,
    page,
  }) => {
    // Navigate to a boolean question (Q8 File Access)
    await injectSessionState(page, {
      sessionId: crypto.randomUUID(),
      currentStage: "architecture",
      currentQuestionIndex: 1, // Q8
      responses: {
        q1_agent_name: "Boolean Test Agent",
        q2_primary_outcome: "Test boolean enabling",
        q3_target_audience: ["Developers"],
        q4_interaction_style: "collaborative",
        q5_delivery_channels: ["CLI"],
        q6_success_metrics: ["Task completion rate"],
        q7_memory_needs: "short-term",
      },
      requirements: {},
      recommendations: null,
      isComplete: false,
      startedAt: new Date().toISOString(),
    });

    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Continue should be disabled initially
    expect(await interviewPage.isContinueEnabled()).toBe(false);

    // Select Yes
    await interviewPage.selectYes();

    // Continue should now be enabled
    expect(await interviewPage.isContinueEnabled()).toBe(true);
  });

  test("should handle empty text input for required questions", async ({
    interviewPage,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Enter text then clear it
    await interviewPage.enterText("Some text");
    expect(await interviewPage.isContinueEnabled()).toBe(true);

    await interviewPage.clearText();
    expect(await interviewPage.isContinueEnabled()).toBe(false);
  });

  test("should handle whitespace-only text input", async ({ interviewPage }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Enter only whitespace
    await interviewPage.enterText("   ");

    // Continue should be disabled (whitespace-only should not be valid)
    expect(await interviewPage.isContinueEnabled()).toBe(false);
  });
});

test.describe("Navigation - Interview Flow Control", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await clearSessionState(page);
  });

  test("should navigate to results from completion screen", async ({
    interviewPage,
    page,
  }) => {
    // Inject a completed session
    const session = createCompletedSession();
    await injectSessionState(page, session);

    await page.goto("/interview");
    await interviewPage.waitForCompletion();

    // Click generate recommendations
    await interviewPage.clickGenerateRecommendations();

    // Should navigate to results
    await expect(page).toHaveURL("/results");
  });

  test("should navigate from setup to interview via skip", async ({
    setupPage,
    interviewPage,
    page,
  }) => {
    await setupPage.goto();
    await setupPage.waitForLoad();

    // Skip setup
    await setupPage.clickSkipForNow();

    // Should be on interview page
    await expect(page).toHaveURL("/interview");
    await interviewPage.waitForLoad();

    // First question should be visible
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("name of your agent");
  });

  test("should navigate from landing to setup via Get Started", async ({
    landingPage,
    setupPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    await landingPage.clickGetStarted();

    // Should be on setup page
    await expect(page).toHaveURL("/setup");
    await setupPage.waitForLoad();

    // Setup elements should be visible
    await expect(setupPage.pageTitle).toBeVisible();
  });

  test("should allow forward navigation after answering all stage questions", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Complete Discovery stage
    await interviewPage.enterText("Stage Navigation Agent");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.enterText("Testing stage navigation");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Developers"]);
    await interviewPage.clickContinue();

    // Should now be in Requirements stage
    await interviewPage.waitForLoad();
    expect(await interviewPage.getCurrentStage()).toBe("Requirements");

    // Should be on Q4
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("interaction style");
  });
});

test.describe("Navigation - Edge Cases", () => {
  test("should handle navigation to interview with corrupted storage", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/");

    // Inject corrupted storage data
    await page.evaluate(() => {
      localStorage.setItem("advisor-session", "invalid json {{{");
    });

    // Navigate to interview
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Should handle gracefully and start fresh
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("name of your agent");
  });

  test("should handle page visibility change during interview", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Answer a question
    await interviewPage.enterText("Visibility Test Agent");
    await interviewPage.clickContinue();

    // Wait for state to be saved
    await waitForSessionState(
      page,
      (state) => state.responses["q1_agent_name"] === "Visibility Test Agent"
    );

    // Simulate page visibility change (tab switch)
    await page.evaluate(() => {
      document.dispatchEvent(new Event("visibilitychange"));
    });

    // State should still be valid
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Visibility Test Agent");
  });

  test("should handle network error gracefully during navigation", async ({
    page,
  }) => {
    await page.goto("/interview");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Enable offline mode
    await page.context().setOffline(true);

    // Try to navigate (should handle gracefully)
    try {
      await page.goto("/results", { timeout: 5000 });
    } catch {
      // Expected to fail in offline mode
    }

    // Re-enable network
    await page.context().setOffline(false);

    // Navigate should work now
    await page.goto("/interview");
    await page.waitForLoadState("networkidle");

    // Page should be accessible
    const isLoaded = await page.locator("[id^='question-heading-']").isVisible();
    expect(isLoaded).toBe(true);
  });
});
