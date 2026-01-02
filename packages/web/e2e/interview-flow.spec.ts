import { test, expect } from "./fixtures/test-base";
import { clearSessionState, getSessionState } from "./fixtures/storage";

/**
 * Interview Flow E2E Tests
 *
 * Tests the complete user journey from landing page to results page,
 * including all 15 interview questions. Validates:
 * - Navigation flow: Landing → Setup → Interview → Results
 * - All question types: text, choice, multiselect, boolean
 * - Progress tracking across all stages
 * - Session persistence and state management
 * - Completion screen and recommendations navigation
 */
test.describe("Interview Flow - Complete User Journey", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session state before each test
    await page.goto("/");
    await clearSessionState(page);
  });

  test("should navigate from landing page to setup page", async ({
    landingPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Verify landing page elements
    await expect(landingPage.heroTitle).toBeVisible();
    await expect(landingPage.getStartedButton).toBeVisible();
    await expect(landingPage.browseTemplatesButton).toBeVisible();

    // Click Get Started to navigate to setup
    await landingPage.clickGetStarted();

    // Verify navigation to setup page
    await expect(page).toHaveURL("/setup");
  });

  test("should skip setup and start interview", async ({
    setupPage,
    interviewPage,
    page,
  }) => {
    await setupPage.goto();
    await setupPage.waitForLoad();

    // Verify setup page elements
    await expect(setupPage.pageTitle).toBeVisible();

    // Skip setup for now
    await setupPage.clickSkipForNow();

    // Verify navigation to interview page
    await expect(page).toHaveURL("/interview");

    // Wait for interview to load
    await interviewPage.waitForLoad();

    // Verify first question is displayed
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("name of your agent");
  });

  test("should complete discovery stage questions (Q1-Q3)", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Verify initial state
    expect(await interviewPage.getProgressPercentage()).toBe(0);
    expect(await interviewPage.getCurrentStage()).toBe("Discovery");

    // Q1: Agent Name (text input)
    const q1Text = await interviewPage.getQuestionText();
    expect(q1Text).toContain("name of your agent");
    await interviewPage.enterText("Test Automation Agent");
    await interviewPage.clickContinue();

    // Q2: Primary Outcome (text input)
    await interviewPage.waitForLoad();
    const q2Text = await interviewPage.getQuestionText();
    expect(q2Text).toContain("primary outcome");
    await interviewPage.enterText("Automate testing workflows for developers");
    await interviewPage.clickContinue();

    // Q3: Target Audience (multiselect)
    await interviewPage.waitForLoad();
    const q3Text = await interviewPage.getQuestionText();
    expect(q3Text).toContain("target users");
    await interviewPage.selectMultiple(["Developers", "Data Scientists"]);
    await interviewPage.clickContinue();

    // Verify we moved to Requirements stage
    await interviewPage.waitForLoad();
    expect(await interviewPage.getCurrentStage()).toBe("Requirements");

    // Verify session state was saved
    const state = await getSessionState(page);
    expect(state).not.toBeNull();
    expect(state?.responses["q1_agent_name"]).toBe("Test Automation Agent");
  });

  test("should complete requirements stage questions (Q4-Q6)", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Complete discovery stage first
    await interviewPage.enterText("Test Agent");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test primary goal");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Developers"]);
    await interviewPage.clickContinue();

    // Now at Requirements stage
    await interviewPage.waitForLoad();

    // Q4: Interaction Style (choice)
    const q4Text = await interviewPage.getQuestionText();
    expect(q4Text).toContain("interaction style");
    await interviewPage.selectChoice("task-focused");
    await interviewPage.clickContinue();

    // Q5: Delivery Channels (multiselect)
    await interviewPage.waitForLoad();
    const q5Text = await interviewPage.getQuestionText();
    expect(q5Text).toContain("channels");
    await interviewPage.selectMultiple(["CLI", "IDE Extension"]);
    await interviewPage.clickContinue();

    // Q6: Success Metrics (multiselect)
    await interviewPage.waitForLoad();
    const q6Text = await interviewPage.getQuestionText();
    expect(q6Text).toContain("success");
    await interviewPage.selectMultiple(["Task completion rate"]);
    await interviewPage.clickContinue();

    // Verify we moved to Architecture stage
    await interviewPage.waitForLoad();
    expect(await interviewPage.getCurrentStage()).toBe("Architecture");
  });

  test("should complete architecture stage with boolean questions (Q7-Q12)", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Complete discovery and requirements stages quickly
    await interviewPage.enterText("Test Agent"); // Q1
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test goal"); // Q2
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Developers"]); // Q3
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectChoice("collaborative"); // Q4
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Web Application"]); // Q5
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["User satisfaction scores"]); // Q6
    await interviewPage.clickContinue();

    // Now at Architecture stage
    await interviewPage.waitForLoad();
    expect(await interviewPage.getCurrentStage()).toBe("Architecture");

    // Q7: Memory Needs (choice)
    const q7Text = await interviewPage.getQuestionText();
    expect(q7Text).toContain("memory");
    await interviewPage.selectChoice("short-term");
    await interviewPage.clickContinue();

    // Q8: File Access (boolean)
    await interviewPage.waitForLoad();
    const q8Text = await interviewPage.getQuestionText();
    expect(q8Text).toContain("file");
    await interviewPage.selectYes();
    await interviewPage.clickContinue();

    // Q9: Web Access (boolean)
    await interviewPage.waitForLoad();
    const q9Text = await interviewPage.getQuestionText();
    expect(q9Text).toContain("web");
    await interviewPage.selectYes();
    await interviewPage.clickContinue();

    // Q10: Code Execution (boolean)
    await interviewPage.waitForLoad();
    const q10Text = await interviewPage.getQuestionText();
    expect(q10Text).toContain("code");
    await interviewPage.selectYes();
    await interviewPage.clickContinue();

    // Q11: Data Analysis (boolean)
    await interviewPage.waitForLoad();
    const q11Text = await interviewPage.getQuestionText();
    expect(q11Text).toContain("data analysis");
    await interviewPage.selectNo();
    await interviewPage.clickContinue();

    // Q12: Tool Integrations (text - optional)
    await interviewPage.waitForLoad();
    const q12Text = await interviewPage.getQuestionText();
    expect(q12Text).toContain("tools");
    await interviewPage.enterText("GitHub, Jira, Slack");
    await interviewPage.clickContinue();

    // Verify we moved to Output stage
    await interviewPage.waitForLoad();
    expect(await interviewPage.getCurrentStage()).toBe("Output");
  });

  test("should complete full interview with all 15 questions and reach results", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // =====================
    // DISCOVERY STAGE (Q1-Q3)
    // =====================

    // Q1: Agent Name (text)
    await interviewPage.enterText("Full Test Agent");
    await interviewPage.clickContinue();

    // Q2: Primary Outcome (text)
    await interviewPage.waitForLoad();
    await interviewPage.enterText("Comprehensive automation for all workflows");
    await interviewPage.clickContinue();

    // Q3: Target Audience (multiselect)
    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Developers", "Product Managers"]);
    await interviewPage.clickContinue();

    // =====================
    // REQUIREMENTS STAGE (Q4-Q6)
    // =====================

    // Q4: Interaction Style (choice)
    await interviewPage.waitForLoad();
    await interviewPage.selectChoice("collaborative");
    await interviewPage.clickContinue();

    // Q5: Delivery Channels (multiselect)
    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["CLI", "Web Application", "API"]);
    await interviewPage.clickContinue();

    // Q6: Success Metrics (multiselect)
    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple([
      "Task completion rate",
      "User satisfaction scores",
      "Response accuracy",
    ]);
    await interviewPage.clickContinue();

    // =====================
    // ARCHITECTURE STAGE (Q7-Q12)
    // =====================

    // Q7: Memory Needs (choice)
    await interviewPage.waitForLoad();
    await interviewPage.selectChoice("long-term");
    await interviewPage.clickContinue();

    // Q8: File Access (boolean)
    await interviewPage.waitForLoad();
    await interviewPage.selectYes();
    await interviewPage.clickContinue();

    // Q9: Web Access (boolean)
    await interviewPage.waitForLoad();
    await interviewPage.selectYes();
    await interviewPage.clickContinue();

    // Q10: Code Execution (boolean)
    await interviewPage.waitForLoad();
    await interviewPage.selectYes();
    await interviewPage.clickContinue();

    // Q11: Data Analysis (boolean)
    await interviewPage.waitForLoad();
    await interviewPage.selectYes();
    await interviewPage.clickContinue();

    // Q12: Tool Integrations (text - optional but we fill it)
    await interviewPage.waitForLoad();
    await interviewPage.enterText("GitHub, Jira, Confluence, Slack");
    await interviewPage.clickContinue();

    // =====================
    // OUTPUT STAGE (Q13-Q15)
    // =====================

    // Q13: Runtime Preference (choice)
    await interviewPage.waitForLoad();
    await interviewPage.selectChoice("hybrid");
    await interviewPage.clickContinue();

    // Q14: Constraints (text - optional but we fill it)
    await interviewPage.waitForLoad();
    await interviewPage.enterText("Must comply with SOC2 requirements");
    await interviewPage.clickContinue();

    // Q15: Additional Notes (text - optional but we fill it)
    await interviewPage.waitForLoad();
    await interviewPage.enterText(
      "Focus on enterprise security and scalability"
    );
    await interviewPage.clickContinue();

    // =====================
    // COMPLETION SCREEN
    // =====================

    // Wait for completion screen to appear
    await interviewPage.waitForCompletion();

    // Verify completion state
    expect(await interviewPage.isComplete()).toBe(true);

    // Verify completion screen elements
    await expect(interviewPage.completionTitle).toBeVisible();
    await expect(interviewPage.generateRecommendationsButton).toBeVisible();

    // Verify session state shows complete
    const state = await getSessionState(page);
    expect(state?.isComplete).toBe(true);
    expect(Object.keys(state?.responses || {}).length).toBeGreaterThanOrEqual(
      12
    ); // At least 12 required questions answered

    // Navigate to results
    await interviewPage.clickGenerateRecommendations();

    // Verify navigation to results page
    await expect(page).toHaveURL("/results");
  });

  test("should allow back navigation during interview", async ({
    interviewPage,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer first question
    await interviewPage.enterText("Navigation Test Agent");
    await interviewPage.clickContinue();

    // Verify on second question
    await interviewPage.waitForLoad();
    const q2Text = await interviewPage.getQuestionText();
    expect(q2Text).toContain("primary outcome");

    // Verify back button is visible
    expect(await interviewPage.canGoBack()).toBe(true);

    // Go back
    await interviewPage.clickBack();

    // Verify we're back on first question with preserved answer
    await interviewPage.waitForLoad();
    const q1Text = await interviewPage.getQuestionText();
    expect(q1Text).toContain("name of your agent");

    // Verify the answer is preserved
    const preservedValue = await interviewPage.getTextValue();
    expect(preservedValue).toBe("Navigation Test Agent");
  });

  test("should track progress correctly through all stages", async ({
    interviewPage,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Initial progress
    expect(await interviewPage.getProgressPercentage()).toBe(0);

    // Answer Q1
    await interviewPage.enterText("Progress Test Agent");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    let progress = await interviewPage.getProgressPercentage();
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThanOrEqual(10);

    // Answer Q2
    await interviewPage.enterText("Test progress tracking");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    progress = await interviewPage.getProgressPercentage();
    expect(progress).toBeGreaterThan(5);

    // Answer Q3
    await interviewPage.selectMultiple(["Developers"]);
    await interviewPage.clickContinue();

    // Should now be in Requirements stage
    await interviewPage.waitForLoad();
    expect(await interviewPage.getCurrentStage()).toBe("Requirements");
    progress = await interviewPage.getProgressPercentage();
    expect(progress).toBe(20);
  });

  test("should show question count correctly", async ({ interviewPage }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Initial count
    let count = await interviewPage.getQuestionCount();
    expect(count).toContain("0 of 15");

    // Answer first question
    await interviewPage.enterText("Count Test Agent");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    count = await interviewPage.getQuestionCount();
    expect(count).toContain("1 of 15");

    // Answer second question
    await interviewPage.enterText("Test counting");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    count = await interviewPage.getQuestionCount();
    expect(count).toContain("2 of 15");
  });

  test("should handle optional questions with skip button", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Answer all required questions up to Q12 (first optional question)
    // Q1-Q3 Discovery
    await interviewPage.enterText("Skip Test Agent");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test skipping optional");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Developers"]);
    await interviewPage.clickContinue();

    // Q4-Q6 Requirements
    await interviewPage.waitForLoad();
    await interviewPage.selectChoice("task-focused");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["CLI"]);
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Task completion rate"]);
    await interviewPage.clickContinue();

    // Q7-Q11 Architecture (required)
    await interviewPage.waitForLoad();
    await interviewPage.selectChoice("none");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectNo();
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectNo();
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectNo();
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectNo();
    await interviewPage.clickContinue();

    // Q12: Tool Integrations (optional) - verify skip is available
    await interviewPage.waitForLoad();
    const canSkip = await interviewPage.canSkip();
    expect(canSkip).toBe(true);

    // Skip this optional question
    await interviewPage.clickSkip();

    // Q13 Runtime (required)
    await interviewPage.waitForLoad();
    await interviewPage.selectChoice("local");
    await interviewPage.clickContinue();

    // Q14: Constraints (optional) - skip
    await interviewPage.waitForLoad();
    expect(await interviewPage.canSkip()).toBe(true);
    await interviewPage.clickSkip();

    // Q15: Additional Notes (optional) - skip
    await interviewPage.waitForLoad();
    expect(await interviewPage.canSkip()).toBe(true);
    await interviewPage.clickSkip();

    // Should reach completion
    await interviewPage.waitForCompletion();
    expect(await interviewPage.isComplete()).toBe(true);
  });

  test("should require answers for required questions", async ({
    interviewPage,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Verify continue button is disabled without answer
    expect(await interviewPage.isContinueEnabled()).toBe(false);

    // Verify skip is not available for required question
    expect(await interviewPage.canSkip()).toBe(false);

    // Enter an answer
    await interviewPage.enterText("Required Test Agent");

    // Now continue should be enabled
    expect(await interviewPage.isContinueEnabled()).toBe(true);
  });

  test("should display stage indicators correctly", async ({
    interviewPage,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // All stage labels should be visible
    await expect(interviewPage.discoveryStage).toBeVisible();
    await expect(interviewPage.requirementsStage).toBeVisible();
    await expect(interviewPage.architectureStage).toBeVisible();
    await expect(interviewPage.outputStage).toBeVisible();
  });
});

test.describe("Interview Flow - Edge Cases", () => {
  test("should handle page refresh during interview", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Answer first question
    await interviewPage.enterText("Refresh Test Agent");
    await interviewPage.clickContinue();

    // Answer second question
    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test refresh persistence");
    await interviewPage.clickContinue();

    // Refresh the page
    await page.reload();
    await interviewPage.waitForLoad();

    // Should be on Q3 with previous answers preserved
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Refresh Test Agent");
    expect(state?.responses["q2_primary_outcome"]).toBe(
      "Test refresh persistence"
    );
  });

  test("should start fresh interview when no session exists", async ({
    interviewPage,
    page,
  }) => {
    // Clear storage and navigate
    await page.goto("/interview");
    await clearSessionState(page);
    await page.reload();
    await interviewPage.waitForLoad();

    // Should be on first question
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("name of your agent");

    // Progress should be 0
    expect(await interviewPage.getProgressPercentage()).toBe(0);
  });

  test("should navigate to interview from setup via skip button", async ({
    landingPage,
    setupPage,
    interviewPage,
    page,
  }) => {
    await landingPage.goto();
    await landingPage.clickGetStarted();

    await setupPage.waitForLoad();
    await setupPage.clickSkipForNow();

    // Should be on interview page
    await expect(page).toHaveURL("/interview");
    await interviewPage.waitForLoad();

    // First question should be visible
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("name of your agent");
  });
});
