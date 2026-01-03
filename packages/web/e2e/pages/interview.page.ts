import { type Page, type Locator } from "@playwright/test";

/**
 * Page Object Model for the Interview Page
 *
 * Represents the interview page (/interview) of the Agent Advisor application.
 * Contains selectors and methods for interacting with the 15-question interview,
 * including question cards, progress tracking, navigation, and all question types.
 */
export class InterviewPage {
  readonly page: Page;

  // Main content elements
  readonly mainContent: Locator;
  readonly skipToContentLink: Locator;

  // Question card elements
  readonly questionCard: Locator;
  readonly questionHeading: Locator;
  readonly questionHint: Locator;

  // Progress indicator elements
  readonly progressCard: Locator;
  readonly progressPercentage: Locator;
  readonly progressStageLabel: Locator;
  readonly progressQuestionCount: Locator;

  // Stage indicator elements
  readonly stageIndicator: Locator;
  readonly discoveryStage: Locator;
  readonly requirementsStage: Locator;
  readonly architectureStage: Locator;
  readonly outputStage: Locator;

  // Navigation buttons
  readonly backButton: Locator;
  readonly continueButton: Locator;
  readonly skipButton: Locator;

  // Text input (for 'text' type questions)
  readonly textInput: Locator;

  // Choice input (for 'choice' type questions - single select radio group)
  readonly choiceRadioGroup: Locator;

  // Boolean input (for 'boolean' type questions - yes/no radio buttons)
  readonly booleanYesOption: Locator;
  readonly booleanNoOption: Locator;

  // Completion screen elements
  readonly completionCard: Locator;
  readonly completionTitle: Locator;
  readonly completionSummary: Locator;
  readonly generateRecommendationsButton: Locator;

  // Loading state
  readonly loadingIndicator: Locator;

  // Theme toggle
  readonly themeToggle: Locator;

  constructor(page: Page) {
    this.page = page;

    // Main content elements
    this.mainContent = page.locator("#interview-content");
    this.skipToContentLink = page.getByRole("link", {
      name: /skip to current question/i,
    });

    // Question card - using Card component structure
    this.questionCard = page.locator("[class*='border-border']").first();
    this.questionHeading = page.locator("[id^='question-heading-']");
    this.questionHint = page.locator("[id^='hint-']");

    // Progress indicator elements - using the ProgressIndicator structure
    this.progressCard = page.locator(".lg\\:sticky").first();
    this.progressPercentage = page.getByText(/^\d+%$/);
    this.progressStageLabel = page.getByTestId("current-stage-label");
    this.progressQuestionCount = page.getByTestId("question-count");

    // Stage indicator elements - using text matching for stage labels
    this.stageIndicator = page.locator(".flex.items-center.justify-center");
    this.discoveryStage = page.getByText("Discovery", { exact: true });
    this.requirementsStage = page.getByText("Requirements", { exact: true });
    this.architectureStage = page.getByText("Architecture", { exact: true });
    this.outputStage = page.getByText("Output", { exact: true });

    // Navigation buttons
    this.backButton = page.getByTestId("interview-back-button");
    this.continueButton = page.getByTestId("continue-button");
    this.skipButton = page.getByTestId("skip-question-button");

    // Text input (Textarea for text questions)
    this.textInput = page.locator("textarea");

    // Choice radio group (for single-choice questions)
    this.choiceRadioGroup = page.getByRole("radiogroup");

    // Boolean yes/no options
    this.booleanYesOption = page.getByRole("radio", { name: /yes/i });
    this.booleanNoOption = page.getByRole("radio", { name: /no/i });

    // Completion screen elements
    this.completionCard = page.locator(".text-center").first();
    this.completionTitle = page.getByRole("heading", {
      name: /interview complete/i,
    });
    this.completionSummary = page.getByRole("heading", { name: /summary/i });
    this.generateRecommendationsButton = page.getByRole("button", {
      name: /generate recommendations/i,
    });

    // Loading indicator
    this.loadingIndicator = page.getByText(/loading/i);

    // Theme toggle button
    this.themeToggle = page.getByRole("button", { name: /toggle theme/i });
  }

  /**
   * Navigate to the interview page
   */
  async goto() {
    await this.page.goto("/interview");
  }

  /**
   * Wait for the page to be fully loaded (question card visible)
   */
  async waitForLoad() {
    await this.questionHeading.waitFor({ state: "visible" });
  }

  /**
   * Wait for a new question to appear (different from the current one)
   * Useful after clicking Continue to wait for the next question
   * @param previousQuestionText - The text of the previous question to wait for it to disappear
   */
  async waitForQuestionChange(previousQuestionText: string) {
    // Wait for the previous question to disappear or change
    await this.page.waitForFunction(
      (prevText) => {
        const heading = document.querySelector("[id^='question-heading-']");
        return heading && !heading.textContent?.includes(prevText.slice(0, 30));
      },
      previousQuestionText,
      { timeout: 10000 }
    );
    // Then wait for the new question heading to be stable
    await this.questionHeading.waitFor({ state: "visible" });
  }

  /**
   * Check if the page is loaded by verifying a question is visible
   */
  async isLoaded(): Promise<boolean> {
    return this.questionHeading.isVisible();
  }

  /**
   * Get the current question text
   */
  async getQuestionText(): Promise<string> {
    return (await this.questionHeading.textContent()) || "";
  }

  /**
   * Get the current question hint text if visible
   */
  async getQuestionHint(): Promise<string | null> {
    const isVisible = await this.questionHint.isVisible();
    if (!isVisible) return null;
    return await this.questionHint.textContent();
  }

  /**
   * Get the current progress percentage
   */
  async getProgressPercentage(): Promise<number> {
    const text = await this.progressPercentage.textContent();
    const match = text?.match(/(\d+)%/);
    return match ? parseInt(match[1], 10) : 0;
  }

  /**
   * Get the current stage name from the progress indicator
   */
  async getCurrentStage(): Promise<string> {
    // Try testid first, fall back to text matching
    const testIdLabel = this.page.getByTestId("current-stage-label");
    if (await testIdLabel.isVisible({ timeout: 2000 }).catch(() => false)) {
      return (await testIdLabel.textContent()) || "";
    }

    // Fallback: find the stage label in the progress card
    // The progress card has a structure with the stage name
    const progressCard = this.page.locator(".lg\\:sticky .text-sm.font-medium").first();
    return (await progressCard.textContent()) || "";
  }

  /**
   * Get the question count text (e.g., "3 of 15 questions")
   */
  async getQuestionCount(): Promise<string> {
    return (await this.progressQuestionCount.textContent()) || "";
  }

  // ============================================
  // TEXT QUESTION METHODS
  // ============================================

  /**
   * Enter text into a text-type question
   * @param text - The text to enter
   */
  async enterText(text: string) {
    await this.textInput.fill(text);
  }

  /**
   * Clear the text input
   */
  async clearText() {
    await this.textInput.clear();
  }

  /**
   * Get the current text value
   */
  async getTextValue(): Promise<string> {
    return (await this.textInput.inputValue()) || "";
  }

  // ============================================
  // CHOICE QUESTION METHODS (single-select radio)
  // ============================================

  /**
   * Get a radio option by its label text
   * @param optionText - The label text of the option
   */
  getChoiceOption(optionText: string): Locator {
    return this.page.getByRole("radio", { name: optionText });
  }

  /**
   * Select a choice option by its label text
   * @param optionText - The label text of the option to select
   */
  async selectChoice(optionText: string) {
    await this.getChoiceOption(optionText).click();
  }

  /**
   * Check if a choice option is selected
   * @param optionText - The label text of the option
   */
  async isChoiceSelected(optionText: string): Promise<boolean> {
    const option = this.getChoiceOption(optionText);
    return await option.isChecked();
  }

  /**
   * Get all visible choice options
   */
  async getChoiceOptions(): Promise<string[]> {
    const labels = this.page.locator("label").filter({
      has: this.page.locator("[type='radio']:not([value='yes']):not([value='no'])"),
    });
    const count = await labels.count();
    const options: string[] = [];
    for (let i = 0; i < count; i++) {
      const text = await labels.nth(i).textContent();
      if (text) options.push(text);
    }
    return options;
  }

  // ============================================
  // MULTISELECT QUESTION METHODS (checkboxes)
  // ============================================

  /**
   * Get a checkbox option by its label text
   * @param optionText - The label text of the option
   */
  getMultiselectOption(optionText: string): Locator {
    return this.page.getByRole("checkbox", { name: optionText });
  }

  /**
   * Toggle a multiselect option by its label text
   * @param optionText - The label text of the option to toggle
   */
  async toggleMultiselect(optionText: string) {
    await this.getMultiselectOption(optionText).click();
  }

  /**
   * Check a multiselect option (if not already checked)
   * @param optionText - The label text of the option
   */
  async checkMultiselect(optionText: string) {
    const option = this.getMultiselectOption(optionText);
    const isChecked = await option.isChecked();
    if (!isChecked) {
      await option.click();
    }
  }

  /**
   * Uncheck a multiselect option (if currently checked)
   * @param optionText - The label text of the option
   */
  async uncheckMultiselect(optionText: string) {
    const option = this.getMultiselectOption(optionText);
    const isChecked = await option.isChecked();
    if (isChecked) {
      await option.click();
    }
  }

  /**
   * Check if a multiselect option is selected
   * @param optionText - The label text of the option
   */
  async isMultiselectChecked(optionText: string): Promise<boolean> {
    const option = this.getMultiselectOption(optionText);
    return await option.isChecked();
  }

  /**
   * Select multiple options at once
   * @param options - Array of option labels to select
   */
  async selectMultiple(options: string[]) {
    for (const option of options) {
      await this.checkMultiselect(option);
    }
  }

  /**
   * Get all visible multiselect options
   */
  async getMultiselectOptions(): Promise<string[]> {
    const checkboxes = this.page.getByRole("checkbox");
    const count = await checkboxes.count();
    const options: string[] = [];
    for (let i = 0; i < count; i++) {
      const name = await checkboxes.nth(i).getAttribute("id");
      // Get the corresponding label
      const label = this.page.locator(`label[for="${name}"]`);
      const text = await label.textContent();
      if (text) options.push(text);
    }
    return options;
  }

  // ============================================
  // BOOLEAN QUESTION METHODS (yes/no)
  // ============================================

  /**
   * Select "Yes" for a boolean question
   */
  async selectYes() {
    await this.booleanYesOption.click();
  }

  /**
   * Select "No" for a boolean question
   */
  async selectNo() {
    await this.booleanNoOption.click();
  }

  /**
   * Check if "Yes" is currently selected
   */
  async isYesSelected(): Promise<boolean> {
    return await this.booleanYesOption.isChecked();
  }

  /**
   * Check if "No" is currently selected
   */
  async isNoSelected(): Promise<boolean> {
    return await this.booleanNoOption.isChecked();
  }

  // ============================================
  // NAVIGATION METHODS
  // ============================================

  /**
   * Click the Continue button to proceed to the next question
   */
  async clickContinue() {
    await this.continueButton.click();
  }

  /**
   * Click Continue and wait for the question to change
   * This handles the animation delay properly
   */
  async clickContinueAndWait() {
    const currentText = await this.getQuestionText();
    await this.continueButton.click();
    await this.waitForQuestionChange(currentText);
  }

  /**
   * Click the Back button to go to the previous question
   */
  async clickBack() {
    await this.backButton.click();
  }

  /**
   * Click the Skip button (only available for non-required questions)
   */
  async clickSkip() {
    await this.skipButton.click();
  }

  /**
   * Check if the Back button is visible (can go back)
   */
  async canGoBack(): Promise<boolean> {
    return await this.backButton.isVisible();
  }

  /**
   * Check if the Skip button is visible (question is optional)
   */
  async canSkip(): Promise<boolean> {
    return await this.skipButton.isVisible();
  }

  /**
   * Check if the Continue button is enabled
   */
  async isContinueEnabled(): Promise<boolean> {
    return await this.continueButton.isEnabled();
  }

  // ============================================
  // COMPLETION SCREEN METHODS
  // ============================================

  /**
   * Check if the interview is complete (completion screen visible)
   */
  async isComplete(): Promise<boolean> {
    return await this.completionTitle.isVisible();
  }

  /**
   * Wait for the completion screen to appear
   */
  async waitForCompletion() {
    await this.completionTitle.waitFor({ state: "visible" });
  }

  /**
   * Click the "Generate Recommendations" button on the completion screen
   */
  async clickGenerateRecommendations() {
    await this.generateRecommendationsButton.click();
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Answer a question and proceed to the next one
   * Automatically detects question type and uses appropriate method
   * @param answer - The answer value (string for text/choice, string[] for multiselect, boolean for boolean)
   */
  async answerAndContinue(answer: string | string[] | boolean) {
    if (typeof answer === "boolean") {
      if (answer) {
        await this.selectYes();
      } else {
        await this.selectNo();
      }
    } else if (Array.isArray(answer)) {
      await this.selectMultiple(answer);
    } else {
      // Try text input first, then choice
      const hasTextInput = await this.textInput.isVisible();
      if (hasTextInput) {
        await this.enterText(answer);
      } else {
        await this.selectChoice(answer);
      }
    }
    await this.clickContinue();
  }

  /**
   * Activate the skip link for accessibility testing
   */
  async activateSkipLink() {
    await this.skipToContentLink.focus();
    await this.skipToContentLink.click();
  }

  /**
   * Toggle the theme (light/dark mode)
   */
  async toggleTheme() {
    await this.themeToggle.click();
  }

  /**
   * Complete the entire interview with provided answers
   * @param answers - Array of answers in order of questions
   */
  async completeInterview(answers: (string | string[] | boolean)[]) {
    for (const answer of answers) {
      await this.answerAndContinue(answer);
      // Wait for the next question or completion screen
      await this.page.waitForTimeout(300); // Allow for animation
    }
  }

  /**
   * Get the current question type based on visible input elements
   */
  async getQuestionType(): Promise<
    "text" | "choice" | "multiselect" | "boolean" | "unknown"
  > {
    // Check for text input
    const hasTextInput = await this.textInput.isVisible();
    if (hasTextInput) return "text";

    // Check for boolean (yes/no specifically)
    const hasYesNo = await this.booleanYesOption.isVisible();
    if (hasYesNo) return "boolean";

    // Check for checkboxes (multiselect)
    const checkboxCount = await this.page.getByRole("checkbox").count();
    if (checkboxCount > 0) return "multiselect";

    // Check for radio group (choice)
    const radioCount = await this.page.getByRole("radio").count();
    if (radioCount > 0) return "choice";

    return "unknown";
  }
}
