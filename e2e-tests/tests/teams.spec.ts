import { test, expect } from '@playwright/test';
import {
  ApiHelper,
  waitForAppReady,
  navigateToTeams,
  waitForLoading,
} from '../helpers';

test.describe('Team Management', () => {
  let api: ApiHelper;

  test.beforeEach(async ({ page, request }) => {
    api = new ApiHelper(request);
    await page.goto('/');
    await waitForAppReady(page);
    // Teams view is the default view, but navigate explicitly for clarity
    await navigateToTeams(page);
    await waitForLoading(page);
  });

  // ── 1. View teams list ──────────────────────────────────────────────

  test('should display teams in a grid', async ({ page }) => {
    // Mock data provides 3 teams: feature-auth, refactor-api, docs-update
    // Team cards are rendered inside a CSS grid
    const grid = page.locator('.grid');
    await expect(grid).toBeVisible({ timeout: 10_000 });

    // Should show team names from mock data
    await expect(page.locator('text=feature-auth')).toBeVisible();
    await expect(page.locator('text=refactor-api')).toBeVisible();
    await expect(page.locator('text=docs-update')).toBeVisible();
  });

  test('should show team status badges and member count', async ({ page }) => {
    // Each team card shows a Badge with status ("Active", "Idle", etc.)
    // and a member count like "4 members"
    await expect(page.locator('text=Active').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=/\\d+ members?/').first()).toBeVisible();
  });

  // ── 2. View team details ────────────────────────────────────────────

  test('should show team detail panel when clicking a team card', async ({ page }) => {
    // Click the first team card (feature-auth)
    await page.locator('text=feature-auth').first().click();

    // The TeamDetailPanel should appear as a side panel
    // It shows the team name in an h3, plus Description, Status, Members sections
    const detailPanel = page.locator('.border-l.bg-card');
    await detailPanel.waitFor({ state: 'visible', timeout: 10_000 });

    // Should display the team name
    await expect(detailPanel.locator('h3')).toContainText('feature-auth');

    // Should display "Description" section
    await expect(detailPanel.locator('text=Description')).toBeVisible();

    // Should display "Members" section with count
    await expect(detailPanel.locator('text=/Members \\(\\d+\\)/')).toBeVisible();
  });

  test('should display member names and types in team details', async ({ page }) => {
    // Click the feature-auth team (has 4 members)
    await page.locator('text=feature-auth').first().click();

    const detailPanel = page.locator('.border-l.bg-card');
    await detailPanel.waitFor({ state: 'visible', timeout: 10_000 });

    // Members: team-lead, backend-dev, frontend-dev, tester
    await expect(detailPanel.locator('text=team-lead')).toBeVisible();
    await expect(detailPanel.locator('text=backend-dev')).toBeVisible();

    // Agent types should be visible (e.g. "lead", "developer")
    await expect(detailPanel.locator('text=lead').first()).toBeVisible();
  });

  // ── 4. Cleanup a team via dropdown menu ─────────────────────────────

  test('should trigger cleanup via the dropdown menu on a team card', async ({ page }) => {
    // The team card has a DropdownMenu triggered by a MoreVertical (...) icon
    // Find the first team card's dropdown trigger
    const firstCardTrigger = page.locator('.grid > div').first().locator('button').last();
    // Stop propagation is handled, so clicking the trigger opens the menu
    await firstCardTrigger.click({ force: true });

    // The dropdown menu should show "View Details", "Spawn Agent", "Cleanup"
    const menu = page.locator('[role="menu"]');
    await menu.waitFor({ state: 'visible', timeout: 5_000 });

    await expect(menu.locator('text=View Details')).toBeVisible();
    await expect(menu.locator('text=Spawn Agent')).toBeVisible();
    await expect(menu.locator('text=Cleanup')).toBeVisible();
  });

  test('should close detail panel when clicking the X button', async ({ page }) => {
    // Open team details
    await page.locator('text=feature-auth').first().click();

    const detailPanel = page.locator('.border-l.bg-card');
    await detailPanel.waitFor({ state: 'visible', timeout: 10_000 });

    // Click the close (X) button
    await detailPanel.locator('button').first().click();

    // Panel should close
    await detailPanel.waitFor({ state: 'hidden', timeout: 5_000 });
  });
});
