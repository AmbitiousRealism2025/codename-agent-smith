import { test, expect } from "./fixtures/test-base";
import {
  clearSessionState,
  getSessionState,
  injectSessionState,
  createMidwaySession,
  createDiscoverySession,
  waitForSessionState,
} from "./fixtures/storage";

/**
 * Session Persistence E2E Tests
 *
 * Tests that interview answers and session state survive page refresh
 * and browser close scenarios. Validates:
 * - Session state persistence to localStorage via Zustand persist middleware
 * - Answers preserved after page refresh at various interview stages
 * - Session ID consistency across refreshes
 * - Progress and stage preservation
 * - Session restoration after browser close/reopen (simulated)
 */
test.describe("Session Persistence - Page Refresh", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to page first to access localStorage
    await page.goto("/");
    await clearSessionState(page);
  });

  test("should preserve answers after page refresh during discovery stage", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer first question
    await interviewPage.enterText("Persistence Test Agent");
    await interviewPage.clickContinue();

    // Wait for state to be saved
    await waitForSessionState(page, (state) => state.responses["q1_agent_name"] === "Persistence Test Agent");

    // Get session state before refresh
    const stateBefore = await getSessionState(page);
    expect(stateBefore?.sessionId).toBeTruthy();
    const sessionId = stateBefore?.sessionId;

    // Refresh the page
    await page.reload();
    await interviewPage.waitForLoad();

    // Verify state is preserved after refresh
    const stateAfter = await getSessionState(page);
    expect(stateAfter?.sessionId).toBe(sessionId);
    expect(stateAfter?.responses["q1_agent_name"]).toBe("Persistence Test Agent");
    expect(stateAfter?.currentQuestionIndex).toBe(1);
    expect(stateAfter?.currentStage).toBe("discovery");
  });

  test("should preserve multiple answers after page refresh", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer Q1: Agent Name
    await interviewPage.enterText("Multi-Answer Test Agent");
    await interviewPage.clickContinue();

    // Answer Q2: Primary Outcome
    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test persistence across multiple questions");
    await interviewPage.clickContinue();

    // Wait for state to be saved
    await waitForSessionState(page, (state) =>
      state.responses["q2_primary_outcome"] === "Test persistence across multiple questions"
    );

    // Get session state before refresh
    const stateBefore = await getSessionState(page);
    expect(Object.keys(stateBefore?.responses || {}).length).toBe(2);

    // Refresh the page
    await page.reload();
    await interviewPage.waitForLoad();

    // Verify all answers are preserved
    const stateAfter = await getSessionState(page);
    expect(stateAfter?.responses["q1_agent_name"]).toBe("Multi-Answer Test Agent");
    expect(stateAfter?.responses["q2_primary_outcome"]).toBe("Test persistence across multiple questions");
    expect(stateAfter?.currentQuestionIndex).toBe(2);
  });

  test("should preserve stage progression after page refresh", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Complete discovery stage (Q1-Q3)
    await interviewPage.enterText("Stage Test Agent"); // Q1
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test stage persistence"); // Q2
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Developers"]); // Q3
    await interviewPage.clickContinue();

    // Should now be in Requirements stage
    await interviewPage.waitForLoad();
    expect(await interviewPage.getCurrentStage()).toBe("Requirements");

    // Wait for state to be saved
    await waitForSessionState(page, (state) => state.currentStage === "requirements");

    // Refresh the page
    await page.reload();
    await interviewPage.waitForLoad();

    // Verify stage is preserved
    expect(await interviewPage.getCurrentStage()).toBe("Requirements");

    const stateAfter = await getSessionState(page);
    expect(stateAfter?.currentStage).toBe("requirements");
    expect(stateAfter?.currentQuestionIndex).toBe(0);
  });

  test("should preserve progress percentage after page refresh", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer first two questions
    await interviewPage.enterText("Progress Test Agent");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test progress persistence");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    const progressBefore = await interviewPage.getProgressPercentage();
    expect(progressBefore).toBeGreaterThan(0);

    // Wait for state to be saved
    await waitForSessionState(page, (state) => Object.keys(state.responses).length >= 2);

    // Refresh the page
    await page.reload();
    await interviewPage.waitForLoad();

    // Verify progress is preserved
    const progressAfter = await interviewPage.getProgressPercentage();
    expect(progressAfter).toBe(progressBefore);
  });

  test("should restore correct question after page refresh", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer Q1
    await interviewPage.enterText("Question Test Agent");
    await interviewPage.clickContinue();

    // Wait for Q2 to be visible
    await interviewPage.waitForLoad();
    const questionBefore = await interviewPage.getQuestionText();
    expect(questionBefore).toContain("primary outcome");

    // Wait for state to be saved
    await waitForSessionState(page, (state) => state.currentQuestionIndex === 1);

    // Refresh the page
    await page.reload();
    await interviewPage.waitForLoad();

    // Verify we're on the correct question
    const questionAfter = await interviewPage.getQuestionText();
    expect(questionAfter).toContain("primary outcome");
  });
});

test.describe("Session Persistence - Browser Close Simulation", () => {
  test("should restore session after browser context is recreated", async ({
    browser,
  }) => {
    // Create first context and complete some interview questions
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();

    await page1.goto("/interview");
    await page1.locator("textarea").fill("Browser Close Test Agent");
    await page1.getByRole("button", { name: /continue/i }).click();

    // Wait for Q2 to load
    await page1.locator("[id^='question-heading-']").waitFor({ state: "visible" });
    await page1.locator("textarea").fill("Test browser close recovery");
    await page1.getByRole("button", { name: /continue/i }).click();

    // Wait for state to be saved
    await waitForSessionState(page1, (state) =>
      state.responses["q2_primary_outcome"] === "Test browser close recovery"
    );

    // Get the session state to verify later
    const sessionState = await getSessionState(page1);
    const sessionId = sessionState?.sessionId;

    // Close the first context (simulates browser close)
    await context1.close();

    // Create a new context with the same storage state
    const context2 = await browser.newContext({
      storageState: {
        cookies: [],
        origins: [
          {
            origin: "http://localhost:5173",
            localStorage: [
              {
                name: "advisor-session",
                value: JSON.stringify({ state: sessionState, version: 0 }),
              },
            ],
          },
        ],
      },
    });
    const page2 = await context2.newPage();

    await page2.goto("/interview");
    await page2.locator("[id^='question-heading-']").waitFor({ state: "visible" });

    // Verify session was restored
    const restoredState = await getSessionState(page2);
    expect(restoredState?.sessionId).toBe(sessionId);
    expect(restoredState?.responses["q1_agent_name"]).toBe("Browser Close Test Agent");
    expect(restoredState?.responses["q2_primary_outcome"]).toBe("Test browser close recovery");

    await context2.close();
  });
});

test.describe("Session Persistence - Injected State", () => {
  test("should restore midway session from injected state", async ({
    interviewPage,
    page,
  }) => {
    // Navigate first to access localStorage
    await page.goto("/");

    // Inject a midway session (at requirements stage)
    const midwaySession = createMidwaySession();
    await injectSessionState(page, midwaySession);

    // Navigate to interview
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Verify we're at the requirements stage
    expect(await interviewPage.getCurrentStage()).toBe("Requirements");

    // Verify previous responses are preserved
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Test Agent");
    expect(state?.responses["q2_primary_outcome"]).toBe("Automate testing workflows");
    expect(state?.responses["q3_target_audience"]).toEqual(["Developers", "Data Scientists"]);
  });

  test("should restore discovery session from injected state", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/");

    // Inject a discovery session with one answer
    const discoverySession = createDiscoverySession({
      q1_agent_name: "Injected Agent",
    });
    await injectSessionState(page, discoverySession);

    // Navigate to interview
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Verify we're on the correct question (Q2)
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("primary outcome");

    // Verify the previous answer is in state
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Injected Agent");
  });

  test("should preserve injected state after page refresh", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/");

    // Inject a session
    const session = createMidwaySession();
    await injectSessionState(page, session);
    const originalSessionId = session.sessionId;

    // Navigate to interview
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Refresh the page
    await page.reload();
    await interviewPage.waitForLoad();

    // Verify state is still preserved
    const state = await getSessionState(page);
    expect(state?.sessionId).toBe(originalSessionId);
    expect(state?.currentStage).toBe("requirements");
  });
});

test.describe("Session Persistence - Navigation", () => {
  test("should preserve session when navigating away and back", async ({
    interviewPage,
    landingPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer a question
    await interviewPage.enterText("Navigation Test Agent");
    await interviewPage.clickContinue();

    // Wait for state to be saved
    await waitForSessionState(page, (state) => state.responses["q1_agent_name"] === "Navigation Test Agent");

    // Navigate away to landing page
    await landingPage.goto();
    await landingPage.waitForLoad();

    // Navigate back to interview
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Verify state is preserved
    const state = await getSessionState(page);
    expect(state?.responses["q1_agent_name"]).toBe("Navigation Test Agent");

    // Should be on Q2
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("primary outcome");
  });

  test("should preserve session when using back button after answering", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer first question
    await interviewPage.enterText("Back Button Test Agent");
    await interviewPage.clickContinue();

    // Answer second question
    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test back button persistence");
    await interviewPage.clickContinue();

    // Wait for state to be saved
    await waitForSessionState(page, (state) =>
      state.responses["q2_primary_outcome"] === "Test back button persistence"
    );

    // Go back to previous question
    await interviewPage.waitForLoad();
    await interviewPage.clickBack();

    // Verify we're back on Q2 with the answer preserved
    await interviewPage.waitForLoad();
    const q2Value = await interviewPage.getTextValue();
    expect(q2Value).toBe("Test back button persistence");

    // Go back to Q1
    await interviewPage.clickBack();

    // Verify Q1 answer is preserved
    await interviewPage.waitForLoad();
    const q1Value = await interviewPage.getTextValue();
    expect(q1Value).toBe("Back Button Test Agent");
  });
});

test.describe("Session Persistence - Edge Cases", () => {
  test("should handle empty session gracefully", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/");
    await clearSessionState(page);

    // Navigate to interview
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Should start fresh
    const questionText = await interviewPage.getQuestionText();
    expect(questionText).toContain("name of your agent");
    expect(await interviewPage.getProgressPercentage()).toBe(0);
  });

  test("should create new session ID when starting fresh", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/");
    await clearSessionState(page);

    // Navigate to interview
    await page.goto("/interview");
    await interviewPage.waitForLoad();

    // Answer first question to create session
    await interviewPage.enterText("Fresh Session Agent");
    await interviewPage.clickContinue();

    // Wait for state to be saved
    await waitForSessionState(page, (state) => state.sessionId !== null);

    // Verify session ID is created
    const state = await getSessionState(page);
    expect(state?.sessionId).toBeTruthy();
    expect(state?.sessionId).toMatch(/^[0-9a-f-]{36}$/); // UUID format
  });

  test("should persist boolean question responses", async ({
    interviewPage,
    page,
  }) => {
    await page.goto("/");

    // Inject session at architecture stage where boolean questions start (Q8)
    await injectSessionState(page, {
      sessionId: crypto.randomUUID(),
      currentStage: "architecture",
      currentQuestionIndex: 1, // Q8 File Access (boolean)
      responses: {
        q1_agent_name: "Boolean Test Agent",
        q2_primary_outcome: "Test boolean persistence",
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

    // Answer boolean question (Q8: File Access)
    await interviewPage.selectYes();
    await interviewPage.clickContinue();

    // Wait for state to be saved
    await waitForSessionState(page, (state) => state.responses["q8_file_access"] === true);

    // Refresh the page
    await page.reload();
    await interviewPage.waitForLoad();

    // Verify boolean response was persisted
    const state = await getSessionState(page);
    expect(state?.responses["q8_file_access"]).toBe(true);
  });

  test("should persist multiselect question responses", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Complete Q1 and Q2 to get to Q3 (multiselect)
    await interviewPage.enterText("Multiselect Test Agent");
    await interviewPage.clickContinue();

    await interviewPage.waitForLoad();
    await interviewPage.enterText("Test multiselect persistence");
    await interviewPage.clickContinue();

    // Answer Q3 (multiselect)
    await interviewPage.waitForLoad();
    await interviewPage.selectMultiple(["Developers", "Data Scientists", "Product Managers"]);
    await interviewPage.clickContinue();

    // Wait for state to be saved
    await waitForSessionState(page, (state) =>
      Array.isArray(state.responses["q3_target_audience"]) &&
      state.responses["q3_target_audience"].length === 3
    );

    // Refresh the page
    await page.reload();
    await interviewPage.waitForLoad();

    // Verify multiselect response was persisted
    const state = await getSessionState(page);
    expect(state?.responses["q3_target_audience"]).toEqual([
      "Developers",
      "Data Scientists",
      "Product Managers",
    ]);
  });

  test("should persist session across multiple rapid refreshes", async ({
    interviewPage,
    page,
  }) => {
    await interviewPage.goto();
    await interviewPage.waitForLoad();

    // Answer first question
    await interviewPage.enterText("Rapid Refresh Agent");
    await interviewPage.clickContinue();

    // Wait for state to be saved
    await waitForSessionState(page, (state) => state.responses["q1_agent_name"] === "Rapid Refresh Agent");

    const stateBefore = await getSessionState(page);
    const sessionId = stateBefore?.sessionId;

    // Perform multiple rapid refreshes
    await page.reload();
    await page.reload();
    await page.reload();
    await interviewPage.waitForLoad();

    // Verify state is still intact
    const stateAfter = await getSessionState(page);
    expect(stateAfter?.sessionId).toBe(sessionId);
    expect(stateAfter?.responses["q1_agent_name"]).toBe("Rapid Refresh Agent");
  });
});
