import { type Page, type Locator } from "@playwright/test";

/**
 * Page Object Model for the Results Page
 *
 * Represents the results page (/results) of the Agent Advisor application.
 * Contains selectors and methods for interacting with the recommendation card,
 * implementation steps, system prompt preview, and export functionality.
 */
export class ResultsPage {
  readonly page: Page;

  // Main content elements
  readonly mainContent: Locator;
  readonly skipToResultsLink: Locator;

  // Page header elements
  readonly pageTitle: Locator;
  readonly backButton: Locator;

  // Loading state
  readonly loadingIndicator: Locator;
  readonly loadingText: Locator;

  // Recommendation card elements
  readonly recommendationCard: Locator;
  readonly agentTypeName: Locator;
  readonly agentTypeId: Locator;
  readonly confidenceScoreLabel: Locator;
  readonly confidenceScoreValue: Locator;
  readonly confidenceProgressBar: Locator;
  readonly matchedCapabilitiesSection: Locator;
  readonly matchedCapabilitiesTags: Locator;
  readonly missingCapabilitiesSection: Locator;
  readonly missingCapabilitiesTags: Locator;
  readonly recommendationNotes: Locator;

  // Implementation steps card
  readonly implementationStepsCard: Locator;
  readonly implementationStepsTitle: Locator;
  readonly implementationStepsList: Locator;
  readonly implementationStepItems: Locator;

  // System prompt preview card
  readonly systemPromptCard: Locator;
  readonly systemPromptToggle: Locator;
  readonly systemPromptContent: Locator;
  readonly systemPromptPreview: Locator;

  // Document export card (from DocumentExport component)
  readonly documentExportCard: Locator;
  readonly documentExportTitle: Locator;
  readonly documentPreview: Locator;
  readonly copyDocumentButton: Locator;
  readonly downloadDocumentButton: Locator;

  // Action buttons (bottom of page)
  readonly copySystemPromptButton: Locator;
  readonly startOverButton: Locator;

  // Theme toggle
  readonly themeToggle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main content elements
    this.mainContent = page.locator("#results-content");
    this.skipToResultsLink = page.getByRole("link", {
      name: /skip to results/i,
    });

    // Page header elements
    this.pageTitle = page.getByRole("heading", {
      name: /your agent recommendations/i,
    });
    this.backButton = page.getByRole("button", { name: /back/i });

    // Loading state elements
    this.loadingIndicator = page.locator(".animate-pulse");
    this.loadingText = page.getByText(/analyzing requirements/i);

    // Recommendation card - first card with CardTitle containing template name
    this.recommendationCard = page.locator(".mb-6").first();
    this.agentTypeName = page
      .locator(".mb-6")
      .first()
      .getByRole("heading")
      .first();
    this.agentTypeId = page
      .locator(".mb-6")
      .first()
      .locator(".text-muted-foreground")
      .first();
    this.confidenceScoreLabel = page.getByText("Confidence Score");
    this.confidenceScoreValue = page.getByText(/^\d+%$/);
    this.confidenceProgressBar = page.getByRole("progressbar");
    this.matchedCapabilitiesSection = page
      .getByText("Matched Capabilities")
      .locator("..");
    this.matchedCapabilitiesTags = page.locator(
      ".bg-green-100, .dark\\:bg-green-900\\/30"
    );
    this.missingCapabilitiesSection = page
      .getByText("Missing Capabilities")
      .locator("..");
    this.missingCapabilitiesTags = page.locator(
      ".bg-orange-100, .dark\\:bg-orange-900\\/30"
    );
    this.recommendationNotes = page
      .locator(".border-t")
      .locator(".text-muted-foreground");

    // Implementation steps card
    this.implementationStepsCard = page
      .locator(".mb-6")
      .filter({ has: page.getByRole("heading", { name: /implementation steps/i }) });
    this.implementationStepsTitle = page.getByRole("heading", {
      name: /implementation steps/i,
    });
    this.implementationStepsList = this.implementationStepsCard.locator("ol");
    this.implementationStepItems = this.implementationStepsCard.locator(
      "ol > li"
    );

    // System prompt preview card
    this.systemPromptCard = page
      .locator(".mb-6")
      .filter({ has: page.getByRole("heading", { name: /system prompt preview/i }) });
    this.systemPromptToggle = page.getByRole("button", {
      name: /system prompt preview/i,
    });
    this.systemPromptContent = page.locator("#system-prompt-content");
    this.systemPromptPreview = this.systemPromptContent.locator("pre");

    // Document export card (from DocumentExport component)
    this.documentExportCard = page
      .locator(".border-border\\/50")
      .filter({ has: page.getByText("Planning Document") });
    this.documentExportTitle = page.getByRole("heading", {
      name: /planning document/i,
    });
    this.documentPreview = this.documentExportCard.locator("pre");
    this.copyDocumentButton = page.getByRole("button", {
      name: /copy to clipboard|copied!/i,
    });
    this.downloadDocumentButton = page.getByRole("button", {
      name: /download as markdown/i,
    });

    // Action buttons (bottom of page)
    this.copySystemPromptButton = page.getByRole("button", {
      name: /copy system prompt|copied!/i,
    });
    this.startOverButton = page.getByRole("button", { name: /start over/i });

    // Theme toggle button
    this.themeToggle = page.getByRole("button", { name: /toggle theme/i });
  }

  /**
   * Navigate to the results page
   */
  async goto() {
    await this.page.goto("/results");
  }

  /**
   * Wait for the page to be fully loaded (recommendations displayed)
   */
  async waitForLoad() {
    await this.pageTitle.waitFor({ state: "visible" });
  }

  /**
   * Wait for the loading state to complete
   */
  async waitForLoadingComplete() {
    await this.loadingText.waitFor({ state: "hidden" });
    await this.pageTitle.waitFor({ state: "visible" });
  }

  /**
   * Check if the page is in loading state
   */
  async isLoading(): Promise<boolean> {
    return this.loadingText.isVisible();
  }

  /**
   * Check if the page is loaded by verifying the page title is visible
   */
  async isLoaded(): Promise<boolean> {
    return this.pageTitle.isVisible();
  }

  /**
   * Get the recommended agent type name
   */
  async getAgentTypeName(): Promise<string> {
    return (await this.agentTypeName.textContent()) || "";
  }

  /**
   * Get the recommended agent type ID
   */
  async getAgentTypeId(): Promise<string> {
    return (await this.agentTypeId.textContent()) || "";
  }

  /**
   * Get the confidence score as a number
   */
  async getConfidenceScore(): Promise<number> {
    const text = await this.confidenceScoreValue.textContent();
    const match = text?.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get all matched capabilities as an array of strings
   */
  async getMatchedCapabilities(): Promise<string[]> {
    const tags = this.matchedCapabilitiesTags;
    const count = await tags.count();
    const capabilities: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await tags.nth(i).textContent();
      if (text) capabilities.push(text.trim());
    }
    return capabilities;
  }

  /**
   * Get all missing capabilities as an array of strings
   */
  async getMissingCapabilities(): Promise<string[]> {
    const tags = this.missingCapabilitiesTags;
    const count = await tags.count();
    const capabilities: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await tags.nth(i).textContent();
      if (text) capabilities.push(text.trim());
    }
    return capabilities;
  }

  /**
   * Get the recommendation notes text
   */
  async getRecommendationNotes(): Promise<string> {
    return (await this.recommendationNotes.textContent()) || "";
  }

  /**
   * Get the number of implementation steps
   */
  async getImplementationStepsCount(): Promise<number> {
    return this.implementationStepItems.count();
  }

  /**
   * Get all implementation steps as an array of strings
   */
  async getImplementationSteps(): Promise<string[]> {
    const items = this.implementationStepItems;
    const count = await items.count();
    const steps: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await items.nth(i).textContent();
      if (text) {
        // Remove the step number from the beginning
        const cleanText = text.replace(/^\d+/, "").trim();
        steps.push(cleanText);
      }
    }
    return steps;
  }

  /**
   * Check if the system prompt section is expanded
   */
  async isSystemPromptExpanded(): Promise<boolean> {
    const ariaExpanded = await this.systemPromptToggle.getAttribute(
      "aria-expanded"
    );
    return ariaExpanded === "true";
  }

  /**
   * Toggle the system prompt preview expansion
   */
  async toggleSystemPrompt() {
    await this.systemPromptToggle.click();
  }

  /**
   * Expand the system prompt preview if not already expanded
   */
  async expandSystemPrompt() {
    const isExpanded = await this.isSystemPromptExpanded();
    if (!isExpanded) {
      await this.toggleSystemPrompt();
    }
  }

  /**
   * Collapse the system prompt preview if currently expanded
   */
  async collapseSystemPrompt() {
    const isExpanded = await this.isSystemPromptExpanded();
    if (isExpanded) {
      await this.toggleSystemPrompt();
    }
  }

  /**
   * Get the system prompt content (must be expanded first)
   */
  async getSystemPromptContent(): Promise<string> {
    await this.expandSystemPrompt();
    await this.systemPromptContent.waitFor({ state: "visible" });
    return (await this.systemPromptPreview.textContent()) || "";
  }

  /**
   * Get the document preview content
   */
  async getDocumentPreview(): Promise<string> {
    return (await this.documentPreview.textContent()) || "";
  }

  /**
   * Click the "Copy to Clipboard" button for the planning document
   */
  async clickCopyDocument() {
    await this.copyDocumentButton.click();
  }

  /**
   * Click the "Download as Markdown" button
   */
  async clickDownloadDocument() {
    await this.downloadDocumentButton.click();
  }

  /**
   * Click the "Copy System Prompt" button
   */
  async clickCopySystemPrompt() {
    await this.copySystemPromptButton.click();
  }

  /**
   * Click the "Start Over" button to restart the interview
   */
  async clickStartOver() {
    await this.startOverButton.click();
  }

  /**
   * Click the "Back" button to return to the interview
   */
  async clickBack() {
    await this.backButton.click();
  }

  /**
   * Activate the skip link for accessibility testing
   */
  async activateSkipLink() {
    await this.skipToResultsLink.focus();
    await this.skipToResultsLink.click();
  }

  /**
   * Toggle the theme (light/dark mode)
   */
  async toggleTheme() {
    await this.themeToggle.click();
  }

  /**
   * Check if the document export section is visible
   */
  async hasDocumentExport(): Promise<boolean> {
    return this.documentExportCard.isVisible();
  }

  /**
   * Check if the implementation steps section is visible
   */
  async hasImplementationSteps(): Promise<boolean> {
    return this.implementationStepsTitle.isVisible();
  }

  /**
   * Check if the recommendation card is visible
   */
  async hasRecommendation(): Promise<boolean> {
    return this.confidenceScoreLabel.isVisible();
  }

  /**
   * Wait for a download to be initiated and return the download promise
   * Useful for verifying the download functionality
   */
  async waitForDownload() {
    const downloadPromise = this.page.waitForEvent("download");
    await this.clickDownloadDocument();
    return downloadPromise;
  }

  /**
   * Verify all main sections are present on the page
   */
  async verifyAllSectionsPresent(): Promise<{
    recommendation: boolean;
    implementationSteps: boolean;
    systemPrompt: boolean;
    documentExport: boolean;
  }> {
    return {
      recommendation: await this.hasRecommendation(),
      implementationSteps: await this.hasImplementationSteps(),
      systemPrompt: await this.systemPromptToggle.isVisible(),
      documentExport: await this.hasDocumentExport(),
    };
  }
}
