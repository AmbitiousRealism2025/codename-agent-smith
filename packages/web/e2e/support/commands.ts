import type { Page, Route, Request, Response } from "@playwright/test";

/**
 * E2E Test Support Commands
 *
 * Utility helpers for common test operations including:
 * - Navigation helpers
 * - Storage management
 * - API mocking
 * - Wait utilities
 * - Visual helpers
 */

// ============================================================================
// Navigation Helpers
// ============================================================================

/**
 * Wait for navigation to complete to a specific URL pattern
 *
 * @param page - Playwright page instance
 * @param urlPattern - URL string or RegExp to match
 * @param options - Navigation options
 */
export async function waitForNavigation(
  page: Page,
  urlPattern: string | RegExp,
  options: { timeout?: number } = {}
): Promise<void> {
  const { timeout = 10000 } = options;

  await page.waitForURL(urlPattern, { timeout });
}

/**
 * Navigate to a page and wait for it to be fully loaded
 *
 * @param page - Playwright page instance
 * @param url - URL to navigate to
 * @param options - Navigation options
 */
export async function navigateAndWait(
  page: Page,
  url: string,
  options: { waitForSelector?: string; timeout?: number } = {}
): Promise<void> {
  const { waitForSelector, timeout = 30000 } = options;

  await page.goto(url, { waitUntil: "networkidle", timeout });

  if (waitForSelector) {
    await page.waitForSelector(waitForSelector, { timeout });
  }
}

/**
 * Wait for the app to be fully hydrated (React mounted)
 *
 * @param page - Playwright page instance
 * @param timeout - Maximum wait time in ms
 */
export async function waitForAppReady(
  page: Page,
  timeout = 10000
): Promise<void> {
  // Wait for the React app root to be present
  await page.waitForSelector("#root", { timeout });

  // Wait for any loading states to complete
  await page.waitForFunction(
    () => {
      const root = document.getElementById("root");
      return root && root.children.length > 0;
    },
    { timeout }
  );
}

/**
 * Wait for page to reach idle state (no pending network requests)
 *
 * @param page - Playwright page instance
 * @param timeout - Maximum wait time in ms
 */
export async function waitForNetworkIdle(
  page: Page,
  timeout = 10000
): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout });
}

// ============================================================================
// Storage Management
// ============================================================================

/**
 * Theme storage key used by next-themes
 */
export const THEME_STORAGE_KEY = "theme";

/**
 * Provider storage key for API keys
 */
export const PROVIDER_STORAGE_KEY = "provider-config";

/**
 * Clear all localStorage data
 *
 * @param page - Playwright page instance
 */
export async function clearAllStorage(page: Page): Promise<void> {
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

/**
 * Clear specific localStorage keys
 *
 * @param page - Playwright page instance
 * @param keys - Array of storage keys to clear
 */
export async function clearStorageKeys(
  page: Page,
  keys: string[]
): Promise<void> {
  await page.evaluate((storageKeys) => {
    storageKeys.forEach((key) => {
      localStorage.removeItem(key);
      sessionStorage.removeItem(key);
    });
  }, keys);
}

/**
 * Clear theme preference from storage
 *
 * @param page - Playwright page instance
 */
export async function clearThemePreference(page: Page): Promise<void> {
  await clearStorageKeys(page, [THEME_STORAGE_KEY]);
}

/**
 * Get a value from localStorage
 *
 * @param page - Playwright page instance
 * @param key - Storage key to retrieve
 * @returns Parsed value or null if not found
 */
export async function getStorageValue<T>(
  page: Page,
  key: string
): Promise<T | null> {
  const result = await page.evaluate((storageKey) => {
    const value = localStorage.getItem(storageKey);
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }, key);

  return result as T | null;
}

/**
 * Set a value in localStorage
 *
 * @param page - Playwright page instance
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified if object)
 */
export async function setStorageValue(
  page: Page,
  key: string,
  value: unknown
): Promise<void> {
  await page.evaluate(
    ({ storageKey, storageValue }) => {
      const valueToStore =
        typeof storageValue === "string"
          ? storageValue
          : JSON.stringify(storageValue);
      localStorage.setItem(storageKey, valueToStore);
    },
    { storageKey: key, storageValue: value }
  );
}

/**
 * Set theme preference
 *
 * @param page - Playwright page instance
 * @param theme - Theme to set ("light", "dark", or "system")
 */
export async function setThemePreference(
  page: Page,
  theme: "light" | "dark" | "system"
): Promise<void> {
  await setStorageValue(page, THEME_STORAGE_KEY, theme);
}

/**
 * Clear IndexedDB databases
 *
 * @param page - Playwright page instance
 * @param dbNames - Optional array of database names to clear (clears all if not provided)
 */
export async function clearIndexedDB(
  page: Page,
  dbNames?: string[]
): Promise<void> {
  await page.evaluate(async (names) => {
    if (names && names.length > 0) {
      // Clear specific databases
      for (const name of names) {
        await new Promise<void>((resolve, reject) => {
          const request = indexedDB.deleteDatabase(name);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    } else {
      // Get all database names and clear them
      const databases = await indexedDB.databases();
      for (const db of databases) {
        if (db.name) {
          await new Promise<void>((resolve, reject) => {
            const request = indexedDB.deleteDatabase(db.name!);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
          });
        }
      }
    }
  }, dbNames);
}

// ============================================================================
// API Mocking
// ============================================================================

/**
 * Mock response configuration
 */
export interface MockResponseConfig {
  /** HTTP status code */
  status?: number;
  /** Response body (will be JSON stringified if object) */
  body?: unknown;
  /** Response headers */
  headers?: Record<string, string>;
  /** Delay before responding in ms */
  delay?: number;
}

/**
 * Setup a mock API response for a specific URL pattern
 *
 * @param page - Playwright page instance
 * @param urlPattern - URL pattern to match (string or RegExp)
 * @param response - Mock response configuration
 * @returns Cleanup function to remove the route handler
 */
export async function mockApiResponse(
  page: Page,
  urlPattern: string | RegExp,
  response: MockResponseConfig
): Promise<() => Promise<void>> {
  const { status = 200, body = {}, headers = {}, delay = 0 } = response;

  const handler = async (route: Route) => {
    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    const contentType =
      headers["Content-Type"] ??
      headers["content-type"] ??
      "application/json";

    const responseBody =
      typeof body === "string" ? body : JSON.stringify(body);

    await route.fulfill({
      status,
      contentType,
      headers,
      body: responseBody,
    });
  };

  await page.route(urlPattern, handler);

  return async () => {
    await page.unroute(urlPattern, handler);
  };
}

/**
 * Mock a network error for a specific URL pattern
 *
 * @param page - Playwright page instance
 * @param urlPattern - URL pattern to match
 * @returns Cleanup function to remove the route handler
 */
export async function mockNetworkError(
  page: Page,
  urlPattern: string | RegExp
): Promise<() => Promise<void>> {
  const handler = async (route: Route) => {
    await route.abort("failed");
  };

  await page.route(urlPattern, handler);

  return async () => {
    await page.unroute(urlPattern, handler);
  };
}

/**
 * Mock a network timeout for a specific URL pattern
 *
 * @param page - Playwright page instance
 * @param urlPattern - URL pattern to match
 * @param timeout - Time to wait before timing out in ms
 * @returns Cleanup function to remove the route handler
 */
export async function mockNetworkTimeout(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 30000
): Promise<() => Promise<void>> {
  const handler = async (route: Route) => {
    await new Promise((resolve) => setTimeout(resolve, timeout));
    await route.abort("timedout");
  };

  await page.route(urlPattern, handler);

  return async () => {
    await page.unroute(urlPattern, handler);
  };
}

/**
 * Capture network requests matching a pattern
 *
 * @param page - Playwright page instance
 * @param urlPattern - URL pattern to match
 * @returns Object with captured requests array and cleanup function
 */
export function captureRequests(
  page: Page,
  urlPattern: string | RegExp
): {
  requests: Request[];
  cleanup: () => void;
} {
  const requests: Request[] = [];

  const handler = (request: Request) => {
    if (typeof urlPattern === "string") {
      if (request.url().includes(urlPattern)) {
        requests.push(request);
      }
    } else if (urlPattern.test(request.url())) {
      requests.push(request);
    }
  };

  page.on("request", handler);

  return {
    requests,
    cleanup: () => {
      page.off("request", handler);
    },
  };
}

/**
 * Capture network responses matching a pattern
 *
 * @param page - Playwright page instance
 * @param urlPattern - URL pattern to match
 * @returns Object with captured responses array and cleanup function
 */
export function captureResponses(
  page: Page,
  urlPattern: string | RegExp
): {
  responses: Response[];
  cleanup: () => void;
} {
  const responses: Response[] = [];

  const handler = (response: Response) => {
    if (typeof urlPattern === "string") {
      if (response.url().includes(urlPattern)) {
        responses.push(response);
      }
    } else if (urlPattern.test(response.url())) {
      responses.push(response);
    }
  };

  page.on("response", handler);

  return {
    responses,
    cleanup: () => {
      page.off("response", handler);
    },
  };
}

// ============================================================================
// Wait Utilities
// ============================================================================

/**
 * Wait for an element to be visible and stable
 *
 * @param page - Playwright page instance
 * @param selector - Element selector
 * @param timeout - Maximum wait time in ms
 */
export async function waitForElementStable(
  page: Page,
  selector: string,
  timeout = 10000
): Promise<void> {
  const element = page.locator(selector);
  await element.waitFor({ state: "visible", timeout });

  // Wait for element position to stabilize (no animations)
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      if (!el) return false;

      const rect1 = el.getBoundingClientRect();
      return new Promise<boolean>((resolve) => {
        requestAnimationFrame(() => {
          const rect2 = el.getBoundingClientRect();
          resolve(
            rect1.x === rect2.x &&
              rect1.y === rect2.y &&
              rect1.width === rect2.width &&
              rect1.height === rect2.height
          );
        });
      });
    },
    selector,
    { timeout }
  );
}

/**
 * Retry an action until it succeeds or times out
 *
 * @param action - Async action to retry
 * @param options - Retry options
 * @returns Result of the action
 */
export async function retry<T>(
  action: () => Promise<T>,
  options: { maxRetries?: number; retryDelay?: number; timeout?: number } = {}
): Promise<T> {
  const { maxRetries = 3, retryDelay = 500, timeout = 30000 } = options;

  const startTime = Date.now();
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Retry timeout exceeded after ${timeout}ms`);
    }

    try {
      return await action();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  throw lastError ?? new Error("Retry failed");
}

/**
 * Wait for a condition to be true
 *
 * @param condition - Async condition function
 * @param options - Wait options
 */
export async function waitForCondition(
  condition: () => Promise<boolean> | boolean,
  options: { timeout?: number; pollInterval?: number; message?: string } = {}
): Promise<void> {
  const { timeout = 10000, pollInterval = 100, message = "Condition not met" } = options;

  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, pollInterval));
  }

  throw new Error(`${message} after ${timeout}ms`);
}

// ============================================================================
// Visual Helpers
// ============================================================================

/**
 * Check if an element has a specific CSS class
 *
 * @param page - Playwright page instance
 * @param selector - Element selector
 * @param className - CSS class name to check
 * @returns True if element has the class
 */
export async function hasClass(
  page: Page,
  selector: string,
  className: string
): Promise<boolean> {
  const element = page.locator(selector);
  const classes = await element.getAttribute("class");
  return classes?.split(" ").includes(className) ?? false;
}

/**
 * Get computed style property of an element
 *
 * @param page - Playwright page instance
 * @param selector - Element selector
 * @param property - CSS property name
 * @returns Computed style value
 */
export async function getComputedStyle(
  page: Page,
  selector: string,
  property: string
): Promise<string> {
  return page.evaluate(
    ({ sel, prop }) => {
      const element = document.querySelector(sel);
      if (!element) return "";
      return window.getComputedStyle(element).getPropertyValue(prop);
    },
    { sel: selector, prop: property }
  );
}

/**
 * Check if the current theme is dark mode
 *
 * @param page - Playwright page instance
 * @returns True if dark mode is active
 */
export async function isDarkMode(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return document.documentElement.classList.contains("dark");
  });
}

/**
 * Check if the current theme is light mode
 *
 * @param page - Playwright page instance
 * @returns True if light mode is active
 */
export async function isLightMode(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    return (
      !document.documentElement.classList.contains("dark") ||
      document.documentElement.classList.contains("light")
    );
  });
}

// ============================================================================
// Console Helpers
// ============================================================================

/**
 * Captured console message
 */
export interface CapturedConsoleMessage {
  type: "log" | "error" | "warning" | "info" | "debug";
  text: string;
  args: string[];
}

/**
 * Capture console messages during test execution
 *
 * @param page - Playwright page instance
 * @param types - Optional array of message types to capture
 * @returns Object with captured messages array and cleanup function
 */
export function captureConsoleMessages(
  page: Page,
  types: Array<"log" | "error" | "warning" | "info" | "debug"> = [
    "log",
    "error",
    "warning",
    "info",
    "debug",
  ]
): {
  messages: CapturedConsoleMessage[];
  cleanup: () => void;
} {
  const messages: CapturedConsoleMessage[] = [];

  const handler = (msg: { type: () => string; text: () => string; args: () => { toString: () => string }[] }) => {
    const msgType = msg.type() as CapturedConsoleMessage["type"];
    if (types.includes(msgType)) {
      messages.push({
        type: msgType,
        text: msg.text(),
        args: msg.args().map((arg) => arg.toString()),
      });
    }
  };

  page.on("console", handler);

  return {
    messages,
    cleanup: () => {
      page.off("console", handler);
    },
  };
}

/**
 * Assert no console errors occurred
 *
 * @param page - Playwright page instance
 * @param action - Async action to perform
 * @param allowedErrors - Optional array of error patterns to ignore
 */
export async function assertNoConsoleErrors(
  page: Page,
  action: () => Promise<void>,
  allowedErrors: (string | RegExp)[] = []
): Promise<void> {
  const { messages, cleanup } = captureConsoleMessages(page, ["error"]);

  try {
    await action();
  } finally {
    cleanup();
  }

  const unexpectedErrors = messages.filter((msg) => {
    return !allowedErrors.some((pattern) => {
      if (typeof pattern === "string") {
        return msg.text.includes(pattern);
      }
      return pattern.test(msg.text);
    });
  });

  if (unexpectedErrors.length > 0) {
    throw new Error(
      `Unexpected console errors:\n${unexpectedErrors.map((m) => m.text).join("\n")}`
    );
  }
}

// ============================================================================
// Keyboard Navigation Helpers
// ============================================================================

/**
 * Press Tab key to move focus forward
 *
 * @param page - Playwright page instance
 * @param count - Number of times to press Tab
 */
export async function tabForward(page: Page, count = 1): Promise<void> {
  for (let i = 0; i < count; i++) {
    await page.keyboard.press("Tab");
  }
}

/**
 * Press Shift+Tab to move focus backward
 *
 * @param page - Playwright page instance
 * @param count - Number of times to press Shift+Tab
 */
export async function tabBackward(page: Page, count = 1): Promise<void> {
  for (let i = 0; i < count; i++) {
    await page.keyboard.press("Shift+Tab");
  }
}

/**
 * Press Enter on the currently focused element
 *
 * @param page - Playwright page instance
 */
export async function pressEnter(page: Page): Promise<void> {
  await page.keyboard.press("Enter");
}

/**
 * Press Space on the currently focused element
 *
 * @param page - Playwright page instance
 */
export async function pressSpace(page: Page): Promise<void> {
  await page.keyboard.press("Space");
}

/**
 * Press Escape key
 *
 * @param page - Playwright page instance
 */
export async function pressEscape(page: Page): Promise<void> {
  await page.keyboard.press("Escape");
}

/**
 * Get the currently focused element's selector or description
 *
 * @param page - Playwright page instance
 * @returns Description of the focused element
 */
export async function getFocusedElement(page: Page): Promise<{
  tagName: string;
  id: string;
  className: string;
  textContent: string;
  testId: string | null;
}> {
  return page.evaluate(() => {
    const el = document.activeElement;
    if (!el) {
      return {
        tagName: "",
        id: "",
        className: "",
        textContent: "",
        testId: null,
      };
    }
    return {
      tagName: el.tagName.toLowerCase(),
      id: el.id,
      className: el.className,
      textContent: el.textContent?.slice(0, 100) ?? "",
      testId: el.getAttribute("data-testid"),
    };
  });
}
