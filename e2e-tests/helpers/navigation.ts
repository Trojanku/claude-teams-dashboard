import { Page, expect } from '@playwright/test';

/**
 * Navigation and common UI helpers for e2e tests.
 * Adapted to the actual frontend implementation which uses
 * Zustand-based view switching (no URL routing).
 */

/** Wait for the app to fully load (header and sidebar visible). */
export async function waitForAppReady(page: Page): Promise<void> {
  // Header contains "Claude Teams UI" text
  await page.locator('header').waitFor({ state: 'visible', timeout: 15_000 });
  // Sidebar nav with navigation buttons
  await page.locator('aside nav').waitFor({ state: 'visible', timeout: 10_000 });
}

/** Navigate to the Teams view via the sidebar button. */
export async function navigateToTeams(page: Page): Promise<void> {
  await page.locator('aside nav button', { hasText: 'Teams' }).click();
  // Wait for the Teams heading to appear
  await page.locator('h2', { hasText: 'Teams' }).waitFor({ state: 'visible', timeout: 10_000 });
}

/** Navigate to the Task Board view via the sidebar button. */
export async function navigateToTasks(page: Page): Promise<void> {
  await page.locator('aside nav button', { hasText: 'Tasks' }).click();
  await page.locator('h2', { hasText: 'Task Board' }).waitFor({ state: 'visible', timeout: 10_000 });
}

/** Navigate to the Agent Monitor view via the sidebar button. */
export async function navigateToAgents(page: Page): Promise<void> {
  await page.locator('aside nav button', { hasText: 'Agents' }).click();
  await page.locator('h2', { hasText: 'Agent Monitor' }).waitFor({ state: 'visible', timeout: 10_000 });
}

/** Navigate to the Messages view via the sidebar button. */
export async function navigateToMessages(page: Page): Promise<void> {
  await page.locator('aside nav button', { hasText: 'Messages' }).click();
  await page.locator('h2', { hasText: 'Messages' }).waitFor({ state: 'visible', timeout: 10_000 });
}

/** Wait for loading spinners (animate-spin) to disappear. */
export async function waitForLoading(page: Page): Promise<void> {
  const loader = page.locator('.animate-spin');
  if (await loader.first().isVisible({ timeout: 1000 }).catch(() => false)) {
    await loader.first().waitFor({ state: 'hidden', timeout: 15_000 });
  }
}
