import { type Page, type Locator } from "@playwright/test";

/**
 * Page Object Model for the Setup Page
 *
 * Represents the setup page (/setup) of the Agent Advisor application.
 * Contains selectors and methods for interacting with provider selection,
 * API key configuration, and navigation elements.
 */
export class SetupPage {
  readonly page: Page;

  // Header elements
  readonly pageTitle: Locator;
  readonly pageDescription: Locator;

  // Provider selection - using role="radiogroup" from ProviderSelector
  readonly providerRadioGroup: Locator;
  readonly anthropicCard: Locator;
  readonly openRouterCard: Locator;
  readonly miniMaxCard: Locator;

  // API key input section
  readonly apiKeyLabel: Locator;
  readonly apiKeyInput: Locator;
  readonly keySavedIndicator: Locator;
  readonly clearKeyButton: Locator;

  // Validation and status messages
  readonly validationError: Locator;
  readonly validatedMessage: Locator;

  // Action buttons
  readonly saveAndContinueButton: Locator;
  readonly continueToInterviewButton: Locator;
  readonly skipForNowButton: Locator;

  // Accessibility elements
  readonly skipToSetupFormLink: Locator;
  readonly mainContent: Locator;

  // Theme toggle
  readonly themeToggle: Locator;

  // Warning message
  readonly providerRequiredWarning: Locator;

  constructor(page: Page) {
    this.page = page;

    // Header elements
    this.pageTitle = page.getByRole("heading", { name: /agent advisor/i });
    this.pageDescription = page.getByText(
      /before we begin, select your ai provider/i
    );

    // Provider selection cards - using role and aria attributes
    this.providerRadioGroup = page.getByRole("radiogroup", {
      name: /ai provider selection/i,
    });
    this.anthropicCard = page.getByRole("radio", { name: /anthropic/i });
    this.openRouterCard = page.getByRole("radio", { name: /openrouter/i });
    this.miniMaxCard = page.getByRole("radio", { name: /minimax/i });

    // API key input section
    this.apiKeyLabel = page.getByText(/api key|bearer token|jwt token/i);
    this.apiKeyInput = page.locator("#apiKey");
    this.keySavedIndicator = page.getByText("Key saved");
    this.clearKeyButton = page.getByRole("button", {
      name: /clear saved api key/i,
    });

    // Validation and status messages
    this.validationError = page.locator(".text-destructive");
    this.validatedMessage = page.getByText("API key validated");

    // Action buttons - using accessible button roles
    this.saveAndContinueButton = page.getByRole("button", {
      name: /save & continue|saving/i,
    });
    this.continueToInterviewButton = page.getByRole("button", {
      name: /continue to interview/i,
    });
    this.skipForNowButton = page.getByRole("button", {
      name: /skip for now/i,
    });

    // Accessibility elements
    this.skipToSetupFormLink = page.getByRole("link", {
      name: /skip to setup form/i,
    });
    this.mainContent = page.locator("#setup-content");

    // Theme toggle button
    this.themeToggle = page.getByRole("button", { name: /toggle theme/i });

    // Warning message
    this.providerRequiredWarning = page.getByText(
      /document generation requires a configured provider/i
    );
  }

  /**
   * Navigate to the setup page
   */
  async goto() {
    await this.page.goto("/setup");
  }

  /**
   * Select a provider by clicking its card
   * @param provider - The provider to select: 'anthropic', 'openrouter', or 'minimax'
   */
  async selectProvider(provider: "anthropic" | "openrouter" | "minimax") {
    switch (provider) {
      case "anthropic":
        await this.anthropicCard.click();
        break;
      case "openrouter":
        await this.openRouterCard.click();
        break;
      case "minimax":
        await this.miniMaxCard.click();
        break;
    }
  }

  /**
   * Get the provider card locator by provider ID
   * @param provider - The provider ID
   */
  getProviderCard(
    provider: "anthropic" | "openrouter" | "minimax"
  ): Locator {
    switch (provider) {
      case "anthropic":
        return this.anthropicCard;
      case "openrouter":
        return this.openRouterCard;
      case "minimax":
        return this.miniMaxCard;
    }
  }

  /**
   * Enter an API key in the input field
   * @param apiKey - The API key to enter
   */
  async enterApiKey(apiKey: string) {
    await this.apiKeyInput.fill(apiKey);
  }

  /**
   * Clear the API key input field
   */
  async clearApiKeyInput() {
    await this.apiKeyInput.clear();
  }

  /**
   * Click the Save & Continue button
   */
  async clickSaveAndContinue() {
    await this.saveAndContinueButton.click();
  }

  /**
   * Click the Continue to Interview button (visible when provider is configured)
   */
  async clickContinueToInterview() {
    await this.continueToInterviewButton.click();
  }

  /**
   * Click the Skip for now button to bypass setup
   */
  async clickSkipForNow() {
    await this.skipForNowButton.click();
  }

  /**
   * Click the clear saved API key button
   */
  async clickClearKey() {
    await this.clearKeyButton.click();
  }

  /**
   * Complete the full setup flow: select provider, enter key, and save
   * @param provider - The provider to select
   * @param apiKey - The API key to enter
   */
  async completeSetup(
    provider: "anthropic" | "openrouter" | "minimax",
    apiKey: string
  ) {
    await this.selectProvider(provider);
    await this.enterApiKey(apiKey);
    await this.clickSaveAndContinue();
  }

  /**
   * Activate the skip link for accessibility testing
   */
  async activateSkipLink() {
    await this.skipToSetupFormLink.focus();
    await this.skipToSetupFormLink.click();
  }

  /**
   * Toggle the theme (light/dark mode)
   */
  async toggleTheme() {
    await this.themeToggle.click();
  }

  /**
   * Check if the page is loaded by verifying the page title is visible
   */
  async isLoaded(): Promise<boolean> {
    return this.pageTitle.isVisible();
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForLoad() {
    await this.pageTitle.waitFor({ state: "visible" });
  }

  /**
   * Check if a specific provider is selected
   * @param provider - The provider to check
   */
  async isProviderSelected(
    provider: "anthropic" | "openrouter" | "minimax"
  ): Promise<boolean> {
    const card = this.getProviderCard(provider);
    const ariaChecked = await card.getAttribute("aria-checked");
    return ariaChecked === "true";
  }

  /**
   * Check if the API key has been saved (key saved indicator visible)
   */
  async hasStoredKey(): Promise<boolean> {
    return this.keySavedIndicator.isVisible();
  }

  /**
   * Check if there are validation errors displayed
   */
  async hasValidationErrors(): Promise<boolean> {
    return this.validationError.isVisible();
  }

  /**
   * Check if the API key has been validated successfully
   */
  async isKeyValidated(): Promise<boolean> {
    return this.validatedMessage.isVisible();
  }

  /**
   * Get the validation error text
   */
  async getValidationErrorText(): Promise<string> {
    return this.validationError.textContent() || "";
  }
}
