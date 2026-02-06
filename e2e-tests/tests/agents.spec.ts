import { test, expect } from '@playwright/test';
import {
  waitForAppReady,
  navigateToAgents,
  waitForLoading,
} from '../helpers';

test.describe('Agent Monitor', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForAppReady(page);
    await navigateToAgents(page);
    await waitForLoading(page);
  });

  // ── 9. View agent list with status indicators ───────────────────────

  test('should display agents derived from team members', async ({ page }) => {
    // Agents are derived from team members across all teams
    // Mock data has: team-lead, backend-dev, frontend-dev, tester (feature-auth)
    //               architect, dev-1, dev-2 (refactor-api)
    //               writer, reviewer (docs-update)

    // Wait for agent cards to render (CSS grid of cards)
    const agentCards = page.locator('.grid .cursor-pointer');
    await expect(agentCards.first()).toBeVisible({ timeout: 10_000 });

    // Should have 9 agents total from mock data
    const count = await agentCards.count();
    expect(count).toBe(9);
  });

  test('should show agent name and status badge', async ({ page }) => {
    // Each AgentCard shows the agent name and a status Badge
    await expect(page.locator('text=team-lead').first()).toBeVisible({ timeout: 10_000 });

    // Status badges show text like "Active", "Idle", "Error"
    // The badge variant is determined by the agent status
    const badges = page.locator('.rounded-full.border');
    await expect(badges.first()).toBeVisible();
  });

  test('should show agent type and team name', async ({ page }) => {
    // Each agent card shows agentType and teamName separated by "|"
    // e.g. "lead | feature-auth"
    // Need to look within card content, not the filter <option> elements
    const agentCards = page.locator('.grid .cursor-pointer');
    await expect(agentCards.first()).toBeVisible({ timeout: 10_000 });

    // The first card should contain the team name somewhere in its text
    const cardWithTeamName = agentCards.filter({ hasText: 'feature-auth' });
    await expect(cardWithTeamName.first()).toBeVisible();
  });

  test('should show summary counts in the page header', async ({ page }) => {
    // The AgentsPage header shows "X agents across Y teams"
    await expect(page.locator('text=/\\d+ agents? across \\d+ teams?/')).toBeVisible({
      timeout: 10_000,
    });
  });

  // ── 10. Filter agents by team ───────────────────────────────────────

  test('should filter agents by team using the select dropdown', async ({ page }) => {
    // Wait for agents to load
    const agentCards = page.locator('.grid .cursor-pointer');
    await expect(agentCards.first()).toBeVisible({ timeout: 10_000 });
    const totalBefore = await agentCards.count();

    // The team filter is a native <select> element
    // Find it by looking for the select that contains "All Teams" option
    const teamSelect = page.locator('select').first();
    await expect(teamSelect).toBeVisible();

    // Select "feature-auth" team (has 4 members)
    await teamSelect.selectOption({ label: 'feature-auth' });
    await waitForLoading(page);

    // After filtering, should show only 4 agents
    const filteredCount = await agentCards.count();
    expect(filteredCount).toBe(4);
    expect(filteredCount).toBeLessThan(totalBefore);

    // The filtered agents should all belong to feature-auth
    await expect(page.locator('text=team-lead').first()).toBeVisible();
    await expect(page.locator('text=backend-dev').first()).toBeVisible();
  });

  test('should reset filter when selecting All Teams', async ({ page }) => {
    const agentCards = page.locator('.grid .cursor-pointer');
    await expect(agentCards.first()).toBeVisible({ timeout: 10_000 });

    const teamSelect = page.locator('select').first();

    // Filter to a specific team first
    await teamSelect.selectOption({ label: 'feature-auth' });
    await waitForLoading(page);

    const filteredCount = await agentCards.count();

    // Reset to "All Teams"
    await teamSelect.selectOption({ label: 'All Teams' });
    await waitForLoading(page);

    const resetCount = await agentCards.count();
    expect(resetCount).toBeGreaterThan(filteredCount);
  });

  test('should have Agents and Activity Feed tabs', async ({ page }) => {
    // The AgentsPage uses Tabs with "Agents" and "Activity Feed" triggers
    await expect(page.locator('text=Agents').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=Activity Feed')).toBeVisible();
  });
});
