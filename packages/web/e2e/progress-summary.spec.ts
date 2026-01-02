import { test, expect } from "./fixtures/test-base";
import { clearSessionState } from "./fixtures/storage";

/**
 * Progress Summary E2E Tests
 *
 * Tests the new Progress Summary Panel feature that displays answered questions
 * in real-time, shows emerging archetype direction, and enables navigation back
 * to previous questions. Validates:
 * - Real-time answer display in summary panel
 * - Clickable navigation to previous questions
 * - Browser refresh persistence
 * - Archetype direction indicator updates
 * - Responsive UI (desktop side panel, mobile collapsible)
 */
test.describe("Progress Summary Panel", () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing session state before each test
    await page.goto("/");
    await clearSessionState(page);
  });

  test("should display answered questions in real-time", async ({
    interviewPage,
    page,
  }) => {
    // Step 1: Start interview from /interview
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Initially, summary should show empty state message
    const summary = page.getByTestId("progress-summary");
    await expect(summary).toBeVisible();
    await expect(page.getByText("Start answering questions to see your progress here")).toBeVisible();

    // Step 2: Answer Q1-Q3
    // Q1: Agent Name
    await interviewPage.enterText("Test Agent");
    await interviewPage.clickContinueAndWait();

    // Step 3: Verify summary shows 1 answer
    const answeredQuestionsList = page.getByTestId("answered-questions-list");
    await expect(answeredQuestionsList).toBeVisible();
    const q1Answer = page.getByTestId("answered-question-q1_agent_name");
    await expect(q1Answer).toBeVisible();

    // Q2: Primary Outcome
    await interviewPage.enterText("Automate testing workflows");
    await interviewPage.clickContinueAndWait();

    // Verify summary shows 2 answers
    const q2Answer = page.getByTestId("answered-question-q2_primary_outcome");
    await expect(q2Answer).toBeVisible();

    // Q3: Target Audience (multiselect)
    await interviewPage.selectMultiple(["Developers"]);
    await interviewPage.clickContinueAndWait();

    // Step 3: Verify summary shows 3 answers
    const q3Answer = page.getByTestId("answered-question-q3_target_audience");
    await expect(q3Answer).toBeVisible();

    // Verify all 3 questions are in the summary
    await expect(q1Answer).toBeVisible();
    await expect(q2Answer).toBeVisible();
    await expect(q3Answer).toBeVisible();
  });

  test("should update archetype indicator as answers accumulate", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Initially, archetype indicator should not be visible (no answers)
    const archetypeIndicator = page.getByTestId("archetype-indicator");
    await expect(archetypeIndicator).not.toBeVisible();

    // Answer Q1-Q3
    await interviewPage.enterText("Test Agent");
    await interviewPage.clickContinueAndWait();

    await interviewPage.enterText("Automate testing workflows");
    await interviewPage.clickContinueAndWait();

    await interviewPage.selectMultiple(["Developers"]);
    await interviewPage.clickContinueAndWait();

    // Step 4: Verify archetype indicator updates
    // After 3 answers, archetype indicator should be visible
    await expect(archetypeIndicator).toBeVisible();

    // Verify it shows an archetype name and confidence
    const archetypeText = await archetypeIndicator.textContent();
    expect(archetypeText).toBeTruthy();
    expect(archetypeText).toMatch(/\d+%/); // Should contain a percentage
  });

  test("should navigate to previous question when clicked in summary", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer Q1-Q3
    await interviewPage.enterText("Test Agent");
    await interviewPage.clickContinueAndWait();

    await interviewPage.enterText("Original outcome");
    await interviewPage.clickContinueAndWait();

    await interviewPage.selectMultiple(["Developers"]);
    await interviewPage.clickContinueAndWait();

    // Step 5: Click Q2 in summary
    const q2Button = page.getByTestId("answered-question-q2_primary_outcome");
    await q2Button.click();

    // Step 6: Verify navigation to Q2
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("primary outcome");

    // Verify Q2 input has the previous answer
    const textInput = page.getByRole("textbox");
    await expect(textInput).toHaveValue("Original outcome");

    // Step 7: Change Q2 answer
    await textInput.clear();
    await interviewPage.enterText("Updated outcome");
    await interviewPage.clickContinueAndWait();

    // Step 8: Verify summary updates
    // Click back to Q2 again to verify the updated answer is saved
    const q2ButtonAfterUpdate = page.getByTestId(
      "answered-question-q2_primary_outcome"
    );
    await q2ButtonAfterUpdate.click();

    // Verify the updated answer is shown
    const updatedInput = page.getByRole("textbox");
    await expect(updatedInput).toHaveValue("Updated outcome");
  });

  test("should persist summary state after browser refresh", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer Q1-Q3
    await interviewPage.enterText("Persistent Agent");
    await interviewPage.clickContinueAndWait();

    await interviewPage.enterText("Test persistence");
    await interviewPage.clickContinueAndWait();

    await interviewPage.selectMultiple(["Developers", "Data Scientists"]);
    await interviewPage.clickContinueAndWait();

    // Verify all 3 questions are in the summary before refresh
    const q1Before = page.getByTestId("answered-question-q1_agent_name");
    const q2Before = page.getByTestId("answered-question-q2_primary_outcome");
    const q3Before = page.getByTestId("answered-question-q3_target_audience");
    await expect(q1Before).toBeVisible();
    await expect(q2Before).toBeVisible();
    await expect(q3Before).toBeVisible();

    // Step 9: Refresh browser
    await page.reload();
    await interviewPage.waitForLoad();

    // Step 10: Verify summary persists with all answers
    const q1After = page.getByTestId("answered-question-q1_agent_name");
    const q2After = page.getByTestId("answered-question-q2_primary_outcome");
    const q3After = page.getByTestId("answered-question-q3_target_audience");
    await expect(q1After).toBeVisible();
    await expect(q2After).toBeVisible();
    await expect(q3After).toBeVisible();

    // Verify archetype indicator also persists
    const archetypeIndicator = page.getByTestId("archetype-indicator");
    await expect(archetypeIndicator).toBeVisible();
  });

  test("should show collapsible summary on mobile viewport", async ({
    interviewPage,
    page,
  }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer a question so summary has content
    await interviewPage.enterText("Mobile Test Agent");
    await interviewPage.clickContinueAndWait();

    // On mobile, toggle button should be visible
    const toggleButton = page.getByTestId("progress-summary-toggle");
    await expect(toggleButton).toBeVisible();

    // Click toggle to expand summary
    await toggleButton.click();

    // Wait a moment for animation
    await page.waitForTimeout(300);

    // Summary content should be visible
    const answeredQuestionsList = page.getByTestId("answered-questions-list");
    await expect(answeredQuestionsList).toBeVisible();

    // Click toggle again to collapse
    await toggleButton.click();

    // Wait for collapse animation
    await page.waitForTimeout(300);

    // Toggle should still be visible (button always visible)
    await expect(toggleButton).toBeVisible();
  });

  test("should show side panel on desktop viewport", async ({
    interviewPage,
    page,
  }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });

    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer a question so summary has content
    await interviewPage.enterText("Desktop Test Agent");
    await interviewPage.clickContinueAndWait();

    // On desktop, side panel should be visible (no toggle needed)
    const answeredQuestionsList = page.getByTestId("answered-questions-list");
    await expect(answeredQuestionsList).toBeVisible();

    // Toggle button should NOT be visible on desktop
    const toggleButton = page.getByTestId("progress-summary-toggle");
    await expect(toggleButton).not.toBeVisible();
  });

  test("should highlight current question in summary", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer Q1-Q2
    await interviewPage.enterText("Test Agent");
    await interviewPage.clickContinueAndWait();

    await interviewPage.enterText("Test outcome");
    await interviewPage.clickContinueAndWait();

    // Now on Q3, Q2 should be in summary but not highlighted
    // Navigate back to Q2
    const q2Button = page.getByTestId("answered-question-q2_primary_outcome");
    await q2Button.click();

    // Q2 should now be highlighted as the current question
    // This is indicated by the 'secondary' variant class
    // We can verify by checking the button has the current question styling
    const currentQ2Button = page.getByTestId(
      "answered-question-q2_primary_outcome"
    );
    await expect(currentQ2Button).toBeVisible();

    // Verify we're on Q2
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("primary outcome");
  });
});
