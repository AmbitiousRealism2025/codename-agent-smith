import { test, expect } from "./fixtures/test-base";

/**
 * Error Handling E2E Tests
 *
 * Tests error handling scenarios throughout the application including:
 * - Invalid API key validation for all providers
 * - Validation error message display
 * - Error state clearing on input changes
 * - Provider-specific validation rules
 */

/**
 * Storage key used by Zustand persist middleware for provider store
 */
const PROVIDER_STORAGE_KEY = "advisor-provider";

/**
 * Clear provider state from localStorage
 */
async function clearProviderState(
  page: import("@playwright/test").Page
): Promise<void> {
  await page.evaluate((key) => {
    localStorage.removeItem(key);
  }, PROVIDER_STORAGE_KEY);
}

test.describe("Error Handling - API Key Validation", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to setup page and clear any existing state
    await page.goto("/setup");
    await clearProviderState(page);
    await page.reload();
  });

  test("should show error for empty API key on Anthropic", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Ensure Anthropic is selected (default)
    await setupPage.selectProvider("anthropic");

    // Try to save with empty key
    await setupPage.enterApiKey("");

    // The button should be disabled when no API key is entered
    await expect(setupPage.saveAndContinueButton).toBeDisabled();
  });

  test("should show error for invalid Anthropic API key format", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Select Anthropic provider
    await setupPage.selectProvider("anthropic");

    // Enter invalid key (doesn't start with sk-ant-)
    await setupPage.enterApiKey("invalid-key-12345678901234567890");
    await setupPage.clickSaveAndContinue();

    // Should show validation error
    await expect(setupPage.validationError).toBeVisible();
    const errorText = await setupPage.getValidationErrorText();
    expect(errorText).toContain('sk-ant-');
  });

  test("should show error for too short Anthropic API key", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Select Anthropic provider
    await setupPage.selectProvider("anthropic");

    // Enter key with correct prefix but too short
    await setupPage.enterApiKey("sk-ant-short");
    await setupPage.clickSaveAndContinue();

    // Should show validation error
    await expect(setupPage.validationError).toBeVisible();
    const errorText = await setupPage.getValidationErrorText();
    expect(errorText).toContain("too short");
  });

  test("should show error for invalid OpenRouter API key format", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Select OpenRouter provider
    await setupPage.selectProvider("openrouter");

    // Enter invalid key (doesn't start with sk-or-)
    await setupPage.enterApiKey("invalid-openrouter-key-123456789012345");
    await setupPage.clickSaveAndContinue();

    // Should show validation error
    await expect(setupPage.validationError).toBeVisible();
    const errorText = await setupPage.getValidationErrorText();
    expect(errorText).toContain("sk-or-");
  });

  test("should show error for too short OpenRouter API key", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Select OpenRouter provider
    await setupPage.selectProvider("openrouter");

    // Enter key with correct prefix but too short
    await setupPage.enterApiKey("sk-or-short");
    await setupPage.clickSaveAndContinue();

    // Should show validation error
    await expect(setupPage.validationError).toBeVisible();
    const errorText = await setupPage.getValidationErrorText();
    expect(errorText).toContain("too short");
  });

  test("should show error for invalid MiniMax JWT token format", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Select MiniMax provider
    await setupPage.selectProvider("minimax");

    // Enter invalid JWT (not 3 parts)
    await setupPage.enterApiKey(
      "invalid-jwt-token-without-dots-that-is-long-enough-to-pass-length-check-123456789012345678901234567890"
    );
    await setupPage.clickSaveAndContinue();

    // Should show validation error
    await expect(setupPage.validationError).toBeVisible();
    const errorText = await setupPage.getValidationErrorText();
    expect(errorText).toContain("3 parts");
  });

  test("should show error for too short MiniMax JWT token", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Select MiniMax provider
    await setupPage.selectProvider("minimax");

    // Enter valid format but too short JWT
    await setupPage.enterApiKey("header.payload.signature");
    await setupPage.clickSaveAndContinue();

    // Should show validation error
    await expect(setupPage.validationError).toBeVisible();
    const errorText = await setupPage.getValidationErrorText();
    expect(errorText).toContain("too short");
  });
});

test.describe("Error Handling - Error State Management", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/setup");
    await clearProviderState(page);
    await page.reload();
  });

  test("should clear error when user types in input", async ({ setupPage }) => {
    await setupPage.waitForLoad();

    // Select Anthropic provider
    await setupPage.selectProvider("anthropic");

    // Enter invalid key and trigger error
    await setupPage.enterApiKey("invalid-key-12345678901234567890");
    await setupPage.clickSaveAndContinue();

    // Verify error is shown
    await expect(setupPage.validationError).toBeVisible();

    // Clear and enter new text
    await setupPage.clearApiKeyInput();
    await setupPage.enterApiKey("sk-ant-new-key");

    // Error should be cleared
    await expect(setupPage.validationError).not.toBeVisible();
  });

  test("should clear error when switching providers", async ({ setupPage }) => {
    await setupPage.waitForLoad();

    // Select Anthropic and trigger error
    await setupPage.selectProvider("anthropic");
    await setupPage.enterApiKey("invalid-key-12345678901234567890");
    await setupPage.clickSaveAndContinue();

    // Verify error is shown
    await expect(setupPage.validationError).toBeVisible();

    // Switch to OpenRouter
    await setupPage.selectProvider("openrouter");

    // Error should be cleared
    await expect(setupPage.validationError).not.toBeVisible();
  });

  test("should not show success message when validation fails", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Select Anthropic provider
    await setupPage.selectProvider("anthropic");

    // Enter invalid key
    await setupPage.enterApiKey("invalid-key-12345678901234567890");
    await setupPage.clickSaveAndContinue();

    // Error should be visible, success should not
    await expect(setupPage.validationError).toBeVisible();
    await expect(setupPage.validatedMessage).not.toBeVisible();
  });
});

test.describe("Error Handling - Provider-Specific Validation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/setup");
    await clearProviderState(page);
    await page.reload();
  });

  test("should validate Anthropic key with correct prefix and length", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Select Anthropic provider
    await setupPage.selectProvider("anthropic");

    // Enter valid format key (correct prefix and length)
    await setupPage.enterApiKey(
      "sk-ant-api03-validkey1234567890123456789012345678901234567890"
    );
    await setupPage.clickSaveAndContinue();

    // Should show validated message or navigate away (no error)
    const hasError = await setupPage.hasValidationErrors();
    expect(hasError).toBe(false);
  });

  test("should validate OpenRouter key with correct prefix and length", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Select OpenRouter provider
    await setupPage.selectProvider("openrouter");

    // Enter valid format key
    await setupPage.enterApiKey(
      "sk-or-v1-validkey12345678901234567890123456789012345678901234567890"
    );
    await setupPage.clickSaveAndContinue();

    // Should not show error
    const hasError = await setupPage.hasValidationErrors();
    expect(hasError).toBe(false);
  });

  test("should validate MiniMax JWT with correct format and length", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Select MiniMax provider
    await setupPage.selectProvider("minimax");

    // Enter valid format JWT (3 parts, long enough)
    const validJwt =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    await setupPage.enterApiKey(validJwt);
    await setupPage.clickSaveAndContinue();

    // Should not show error
    const hasError = await setupPage.hasValidationErrors();
    expect(hasError).toBe(false);
  });
});

test.describe("Error Handling - Error Message Display", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/setup");
    await clearProviderState(page);
    await page.reload();
  });

  test("should display error with AlertCircle icon", async ({
    setupPage,
    page,
  }) => {
    await setupPage.waitForLoad();

    // Select Anthropic provider and trigger error
    await setupPage.selectProvider("anthropic");
    await setupPage.enterApiKey("invalid-key-12345678901234567890");
    await setupPage.clickSaveAndContinue();

    // Error container should be visible with destructive styling
    await expect(setupPage.validationError).toBeVisible();

    // Check that the error has the correct styling class
    const errorContainer = page.locator(".text-destructive");
    await expect(errorContainer).toBeVisible();
  });

  test("should display appropriate error message for each provider", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Test Anthropic error message
    await setupPage.selectProvider("anthropic");
    await setupPage.enterApiKey("wrong-format-key-123456789012345");
    await setupPage.clickSaveAndContinue();

    let errorText = await setupPage.getValidationErrorText();
    expect(errorText).toContain("Anthropic");

    // Clear and test OpenRouter
    await setupPage.selectProvider("openrouter");
    await setupPage.enterApiKey("wrong-format-key-123456789012345");
    await setupPage.clickSaveAndContinue();

    errorText = await setupPage.getValidationErrorText();
    expect(errorText).toContain("OpenRouter");

    // Clear and test MiniMax
    await setupPage.selectProvider("minimax");
    await setupPage.enterApiKey("wrong-format-without-dots-12345");
    await setupPage.clickSaveAndContinue();

    errorText = await setupPage.getValidationErrorText();
    expect(errorText).toContain("JWT");
  });

  test("should have accessible error messaging", async ({ setupPage, page }) => {
    await setupPage.waitForLoad();

    // Trigger validation error
    await setupPage.selectProvider("anthropic");
    await setupPage.enterApiKey("invalid-key-12345678901234567890");
    await setupPage.clickSaveAndContinue();

    // Error should be visible and contain descriptive text
    await expect(setupPage.validationError).toBeVisible();

    // The error text should be descriptive enough for accessibility
    const errorText = await setupPage.getValidationErrorText();
    expect(errorText.length).toBeGreaterThan(10);
    expect(errorText).not.toBe("");
  });
});

test.describe("Error Handling - Save Button State", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/setup");
    await clearProviderState(page);
    await page.reload();
  });

  test("should disable save button when input is empty", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // With empty input, button should be disabled
    await expect(setupPage.saveAndContinueButton).toBeDisabled();

    // Enter some text
    await setupPage.enterApiKey("some-text");

    // Button should now be enabled
    await expect(setupPage.saveAndContinueButton).toBeEnabled();

    // Clear the text
    await setupPage.clearApiKeyInput();

    // Button should be disabled again
    await expect(setupPage.saveAndContinueButton).toBeDisabled();
  });

  test("should enable save button when whitespace-only input is trimmed", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Enter only whitespace
    await setupPage.enterApiKey("   ");

    // Button should be disabled (whitespace-only should not enable)
    await expect(setupPage.saveAndContinueButton).toBeDisabled();
  });

  test("should enable save button after entering valid format", async ({
    setupPage,
  }) => {
    await setupPage.waitForLoad();

    // Select provider
    await setupPage.selectProvider("anthropic");

    // Enter valid format key
    await setupPage.enterApiKey(
      "sk-ant-api03-validkey1234567890123456789012345678901234567890"
    );

    // Button should be enabled
    await expect(setupPage.saveAndContinueButton).toBeEnabled();
  });
});
