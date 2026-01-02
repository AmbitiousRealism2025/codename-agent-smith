import { test, expect } from "./fixtures/test-base";
import {
  clearSessionState,
  injectSessionState,
  createCompletedSession,
} from "./fixtures/storage";

/**
 * Document Generation E2E Tests
 *
 * Tests the recommendations display and export functionality on the Results page.
 * Validates:
 * - Recommendations card display (agent type, confidence score, capabilities)
 * - Implementation steps display
 * - System prompt preview expand/collapse
 * - Document export: copy to clipboard, download as markdown
 * - Navigation from results back to interview
 * - Protection against accessing results without completing interview
 */
test.describe("Document Generation - Recommendations Display", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page first to access localStorage
    await page.goto("/");

    // Inject a completed session state
    const completedSession = createCompletedSession();
    await injectSessionState(page, completedSession);
  });

  test("should display recommendations card with agent type and confidence score", async ({
    resultsPage,
    page,
  }) => {
    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Verify the page loaded correctly
    await expect(resultsPage.pageTitle).toBeVisible();
    await expect(resultsPage.pageTitle).toHaveText("Your Agent Recommendations");

    // Verify recommendation card is visible
    expect(await resultsPage.hasRecommendation()).toBe(true);

    // Verify confidence score is displayed
    await expect(resultsPage.confidenceScoreLabel).toBeVisible();
    const confidenceScore = await resultsPage.getConfidenceScore();
    expect(confidenceScore).toBeGreaterThan(0);
    expect(confidenceScore).toBeLessThanOrEqual(100);

    // Verify progress bar is visible
    await expect(resultsPage.confidenceProgressBar).toBeVisible();
  });

  test("should display matched and missing capabilities", async ({
    resultsPage,
    page,
  }) => {
    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Verify capabilities sections are visible
    await expect(resultsPage.matchedCapabilitiesSection).toBeVisible();
    await expect(resultsPage.missingCapabilitiesSection).toBeVisible();

    // Both sections should exist (may show "None" if no capabilities)
    const matchedSection = page.getByText("Matched Capabilities");
    const missingSection = page.getByText("Missing Capabilities");
    await expect(matchedSection).toBeVisible();
    await expect(missingSection).toBeVisible();
  });

  test("should display implementation steps", async ({ resultsPage, page }) => {
    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Verify implementation steps section exists
    expect(await resultsPage.hasImplementationSteps()).toBe(true);
    await expect(resultsPage.implementationStepsTitle).toBeVisible();

    // Verify we have implementation steps
    const stepCount = await resultsPage.getImplementationStepsCount();
    expect(stepCount).toBeGreaterThan(0);

    // Verify steps are numbered (have step numbers visible)
    await expect(resultsPage.implementationStepsList).toBeVisible();
  });

  test("should display system prompt preview with expand/collapse functionality", async ({
    resultsPage,
    page,
  }) => {
    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Verify system prompt toggle is visible
    await expect(resultsPage.systemPromptToggle).toBeVisible();

    // Initially collapsed
    const initiallyExpanded = await resultsPage.isSystemPromptExpanded();
    expect(initiallyExpanded).toBe(false);

    // Expand the system prompt
    await resultsPage.expandSystemPrompt();

    // Verify it's now expanded
    expect(await resultsPage.isSystemPromptExpanded()).toBe(true);

    // Verify content is visible
    await expect(resultsPage.systemPromptContent).toBeVisible();

    // Get the prompt content
    const promptContent = await resultsPage.getSystemPromptContent();
    expect(promptContent.length).toBeGreaterThan(0);

    // Collapse it
    await resultsPage.collapseSystemPrompt();

    // Verify it's collapsed
    expect(await resultsPage.isSystemPromptExpanded()).toBe(false);
  });

  test("should display all main sections on results page", async ({
    resultsPage,
    page,
  }) => {
    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Verify all sections are present
    const sections = await resultsPage.verifyAllSectionsPresent();

    expect(sections.recommendation).toBe(true);
    expect(sections.implementationSteps).toBe(true);
    expect(sections.systemPrompt).toBe(true);
    expect(sections.documentExport).toBe(true);
  });
});

test.describe("Document Generation - Export Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    const completedSession = createCompletedSession();
    await injectSessionState(page, completedSession);
  });

  test("should display document export section with preview", async ({
    resultsPage,
    page,
  }) => {
    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Verify document export section exists
    expect(await resultsPage.hasDocumentExport()).toBe(true);
    await expect(resultsPage.documentExportTitle).toBeVisible();

    // Verify preview is visible
    await expect(resultsPage.documentPreview).toBeVisible();

    // Get preview content
    const previewContent = await resultsPage.getDocumentPreview();
    expect(previewContent.length).toBeGreaterThan(0);

    // Verify preview is truncated (ends with ...)
    expect(previewContent).toContain("...");
  });

  test("should have copy to clipboard button", async ({
    resultsPage,
    page,
  }) => {
    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Verify copy button is visible
    await expect(resultsPage.copyDocumentButton).toBeVisible();
    await expect(resultsPage.copyDocumentButton).toContainText(/copy to clipboard/i);
  });

  test("should have download as markdown button", async ({
    resultsPage,
    page,
  }) => {
    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Verify download button is visible
    await expect(resultsPage.downloadDocumentButton).toBeVisible();
    await expect(resultsPage.downloadDocumentButton).toContainText(/download as markdown/i);
  });

  test("should copy document to clipboard", async ({ resultsPage, page }) => {
    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Grant clipboard permissions
    await page.context().grantPermissions(["clipboard-write", "clipboard-read"]);

    // Click copy button
    await resultsPage.clickCopyDocument();

    // Button should change to "Copied!"
    await expect(resultsPage.copyDocumentButton).toContainText(/copied!/i);

    // Wait for button to return to normal state
    await page.waitForTimeout(2500);
    await expect(resultsPage.copyDocumentButton).toContainText(/copy to clipboard/i);
  });

  test("should download document as markdown file", async ({
    resultsPage,
    page,
  }) => {
    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Set up download listener
    const downloadPromise = page.waitForEvent("download");

    // Click download button
    await resultsPage.clickDownloadDocument();

    // Wait for download to be initiated
    const download = await downloadPromise;

    // Verify download file name contains the agent name and markdown extension
    const fileName = download.suggestedFilename();
    expect(fileName).toMatch(/\.md$/);
    expect(fileName).toContain("code-assistant"); // From createCompletedSession
  });

  test("should have copy system prompt button", async ({
    resultsPage,
    page,
  }) => {
    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Verify copy system prompt button is visible
    await expect(resultsPage.copySystemPromptButton).toBeVisible();
  });

  test("should copy system prompt to clipboard", async ({
    resultsPage,
    page,
  }) => {
    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Expand system prompt first to make sure content is available
    await resultsPage.expandSystemPrompt();

    // Grant clipboard permissions
    await page.context().grantPermissions(["clipboard-write", "clipboard-read"]);

    // Click copy system prompt button
    await resultsPage.clickCopySystemPrompt();

    // Button should change to "Copied!"
    await expect(resultsPage.copySystemPromptButton).toContainText(/copied!/i);
  });
});

test.describe("Document Generation - Navigation", () => {
  test("should navigate back to interview from results", async ({
    resultsPage,
    interviewPage,
    page,
  }) => {
    // Set up completed session
    await page.goto("/");
    const completedSession = createCompletedSession();
    await injectSessionState(page, completedSession);

    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Click back button
    await resultsPage.clickBack();

    // Verify navigation to interview page
    await expect(page).toHaveURL("/interview");
    await interviewPage.waitForLoad();
  });

  test("should start over and navigate to fresh interview", async ({
    resultsPage,
    interviewPage,
    page,
  }) => {
    // Set up completed session
    await page.goto("/");
    const completedSession = createCompletedSession();
    await injectSessionState(page, completedSession);

    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Click start over button
    await resultsPage.clickStartOver();

    // Verify navigation to interview page
    await expect(page).toHaveURL("/interview");
    await interviewPage.waitForLoad();

    // Verify it's a fresh interview (first question)
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("name of your agent");

    // Progress should be reset to 0
    expect(await interviewPage.getProgressPercentage()).toBe(0);
  });
});

test.describe("Document Generation - Edge Cases", () => {
  test("should redirect to interview when accessing results without completing interview", async ({
    page,
  }) => {
    // Clear any existing session
    await page.goto("/");
    await clearSessionState(page);

    // Try to navigate directly to results
    await page.goto("/results");

    // Should redirect to interview page
    await expect(page).toHaveURL("/interview");
  });

  test("should show loading state while analyzing requirements", async ({
    page,
  }) => {
    // Set up completed session
    await page.goto("/");
    const completedSession = createCompletedSession();
    await injectSessionState(page, completedSession);

    // Navigate to results - should show loading briefly
    await page.goto("/results");

    // Loading state might be very quick, but the page should eventually load
    await page.waitForSelector('[data-testid="results-page"], [data-testid="results-loading"]', {
      timeout: 5000,
    });
  });

  test("should display theme toggle on results page", async ({
    resultsPage,
    page,
  }) => {
    // Set up completed session
    await page.goto("/");
    const completedSession = createCompletedSession();
    await injectSessionState(page, completedSession);

    await page.goto("/results");
    await resultsPage.waitForLoadingComplete();

    // Theme toggle should be visible
    await expect(resultsPage.themeToggle).toBeVisible();

    // Should be able to toggle theme
    await resultsPage.toggleTheme();

    // Page should still be functional after theme toggle
    await expect(resultsPage.pageTitle).toBeVisible();
  });
});

test.describe("Document Generation - Complete Flow Integration", () => {
  test("should complete interview and view recommendations", async ({
    landingPage,
    setupPage,
    interviewPage,
    resultsPage,
    page,
  }) => {
    // Start fresh
    await page.goto("/");
    await clearSessionState(page);

    // Navigate through the full flow
    await landingPage.goto();
    await landingPage.clickGetStarted();

    await setupPage.waitForLoad();
    await setupPage.clickSkipForNow();

    await interviewPage.waitForLoad();

    // Complete all 15 questions
    // Discovery Stage (Q1-Q3)
    await interviewPage.enterText("Integration Test Agent");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test the complete document generation flow");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Developers"]);
    await interviewPage.clickContinue();

    // Requirements Stage (Q4-Q6)
    await interviewPage.waitForLoad();
    await interviewPage.selectChoice("collaborative");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["CLI"]);
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Task completion rate"]);
    await interviewPage.clickContinue();

    // Architecture Stage (Q7-Q12)
    await interviewPage.waitForLoad();
    await interviewPage.selectChoice("short-term");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectYes();
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectNo();
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectYes();
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectNo();
    await interviewPage.clickContinue();

    // Q12 - optional, skip
    await interviewPage.waitForLoad();
    await interviewPage.clickSkip();

    // Output Stage (Q13-Q15)
    await interviewPage.waitForLoad();
    await interviewPage.selectChoice("local");
    await interviewPage.clickContinue();

    // Q14 - optional, skip
    await interviewPage.waitForLoad();
    await interviewPage.clickSkip();

    // Q15 - optional, skip
    await interviewPage.waitForLoad();
    await interviewPage.clickSkip();

    // Wait for completion
    await interviewPage.waitForCompletion();
    expect(await interviewPage.isComplete()).toBe(true);

    // Navigate to results
    await interviewPage.clickGenerateRecommendations();
    await expect(page).toHaveURL("/results");

    // Verify results page is fully functional
    await resultsPage.waitForLoadingComplete();

    // All sections should be present
    const sections = await resultsPage.verifyAllSectionsPresent();
    expect(sections.recommendation).toBe(true);
    expect(sections.implementationSteps).toBe(true);
    expect(sections.systemPrompt).toBe(true);
    expect(sections.documentExport).toBe(true);

    // Confidence score should be valid
    const score = await resultsPage.getConfidenceScore();
    expect(score).toBeGreaterThan(0);

    // Implementation steps should exist
    const stepCount = await resultsPage.getImplementationStepsCount();
    expect(stepCount).toBeGreaterThan(0);

    // Document export should work
    await expect(resultsPage.copyDocumentButton).toBeVisible();
    await expect(resultsPage.downloadDocumentButton).toBeVisible();
  });
});
