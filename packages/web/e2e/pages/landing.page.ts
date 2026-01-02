import { type Page, type Locator } from "@playwright/test";

/**
 * Page Object Model for the Landing Page
 *
 * Represents the root page (/) of the Agent Advisor application.
 * Contains selectors and methods for interacting with the landing page elements.
 */
export class LandingPage {
  readonly page: Page;

  // Hero section elements
  readonly heroTitle: Locator;
  readonly heroTagline: Locator;
  readonly heroDescription: Locator;

  // Navigation buttons
  readonly getStartedButton: Locator;
  readonly browseTemplatesButton: Locator;

  // Accessibility elements
  readonly skipToMainLink: Locator;
  readonly mainActionsSection: Locator;

  // Theme toggle
  readonly themeToggle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Hero section - using semantic selectors
    this.heroTitle = page.getByRole("heading", { name: /agent advisor/i });
    this.heroTagline = page.getByText("Build Claude Agent SDK Apps");
    this.heroDescription = page.getByText(
      /a guided interview that helps you create custom/i
    );

    // Navigation buttons - using getByRole for resilient selectors
    this.getStartedButton = page.getByRole("link", { name: /get started/i });
    this.browseTemplatesButton = page.getByRole("link", {
      name: /browse templates/i,
    });

    // Accessibility elements
    this.skipToMainLink = page.getByRole("link", {
      name: /skip to main actions/i,
    });
    this.mainActionsSection = page.locator("#main-actions");

    // Theme toggle button
    this.themeToggle = page.getByRole("button", { name: /toggle theme/i });
  }

  /**
   * Navigate to the landing page
   */
  async goto() {
    await this.page.goto("/");
  }

  /**
   * Click the "Get Started" button to navigate to the setup page
   */
  async clickGetStarted() {
    await this.getStartedButton.click();
  }

  /**
   * Click the "Browse Templates" button to navigate to the templates page
   */
  async clickBrowseTemplates() {
    await this.browseTemplatesButton.click();
  }

  /**
   * Activate the skip link for accessibility testing
   */
  async activateSkipLink() {
    await this.skipToMainLink.focus();
    await this.skipToMainLink.click();
  }

  /**
   * Toggle the theme (light/dark mode)
   */
  async toggleTheme() {
    await this.themeToggle.click();
  }

  /**
   * Check if the page is loaded by verifying the hero title is visible
   */
  async isLoaded(): Promise<boolean> {
    return this.heroTitle.isVisible();
  }

  /**
   * Wait for the page to be fully loaded
   */
  async waitForLoad() {
    await this.heroTitle.waitFor({ state: "visible" });
  }
}
