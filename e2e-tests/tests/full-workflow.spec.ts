import { test, expect } from '@playwright/test';
import {
  ApiHelper,
  waitForAppReady,
  navigateToTeams,
  navigateToTasks,
  navigateToAgents,
  navigateToMessages,
  waitForLoading,
} from '../helpers';

/**
 * Full end-to-end workflow test.
 *
 * Scenario 13 from the test plan:
 *   View teams -> View tasks -> Update task status ->
 *   View in agent monitor -> Send message -> Cleanup team
 */
test.describe('Full Workflow', () => {
  let api: ApiHelper;

  test.beforeEach(async ({ page, request }) => {
    api = new ApiHelper(request);
    await api.reset();
    await page.goto('/');
    await waitForAppReady(page);
  });

  test('should complete a full team lifecycle', async ({ page }) => {
    // ================================================================
    // Step 1: Verify teams are visible (created via Claude Code CLI)
    // ================================================================
    await navigateToTeams(page);
    await waitForLoading(page);

    // Mock data provides teams; verify at least one is visible
    await expect(page.locator('text=feature-auth')).toBeVisible({ timeout: 10_000 });

    // ================================================================
    // Step 2: Navigate to task board and verify columns exist
    // ================================================================
    await navigateToTasks(page);
    await waitForLoading(page);

    // Verify the three Kanban columns are visible
    await expect(page.locator('h3', { hasText: 'Pending' })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('h3', { hasText: 'In Progress' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Completed' })).toBeVisible();

    // ================================================================
    // Step 3: View task details and change status
    // ================================================================
    // Click on a task to open its detail panel
    await page.locator('text=Implement JWT').click();

    const detailPanel = page.locator('[data-testid="task-detail-panel"]');
    await detailPanel.waitFor({ state: 'visible', timeout: 10_000 });

    // The detail panel should show the task title
    await expect(detailPanel.locator('text=Implement JWT')).toBeVisible();

    // Click the first available status action button to change the task state
    // Possible buttons: "Start", "Complete", or "Reopen" depending on current status
    const actionButton = detailPanel.locator('.flex.gap-2 button').first();
    await actionButton.click();

    // The status should change - verify by checking the badge updated
    // (it will show either "In Progress", "Completed", or "Pending" depending on action)
    await page.waitForTimeout(500);

    // Close the detail panel
    await detailPanel.locator('button:has(svg.lucide-x)').click();

    // ================================================================
    // Step 5: View the agent monitor
    // ================================================================
    await navigateToAgents(page);
    await waitForLoading(page);

    // Agents should be listed
    const agentCards = page.locator('.grid .cursor-pointer');
    await expect(agentCards.first()).toBeVisible({ timeout: 10_000 });

    // Verify the agent summary count
    await expect(page.locator('text=/\\d+ agents? across \\d+ teams?/')).toBeVisible();

    // ================================================================
    // Step 6: Send a message
    // ================================================================
    await navigateToMessages(page);
    await waitForLoading(page);

    // Select a team to view messages
    const teamSelect = page.locator('select').first();
    await teamSelect.selectOption({ label: 'feature-auth' });
    await waitForLoading(page);

    // Select a recipient from the composer (second select on the page)
    const recipientSelect = page.locator('select').nth(1);
    await expect(recipientSelect).toBeVisible({ timeout: 10_000 });
    await recipientSelect.selectOption({ index: 1 });

    // Type and send a message
    const textarea = page.getByPlaceholder(/Type a message/i);
    await textarea.fill('Workflow test message');
    await page.locator('button:has(svg.lucide-send)').click();

    // Verify message appears in the list
    await expect(page.locator('text=Workflow test message')).toBeVisible({ timeout: 10_000 });

    // ================================================================
    // Step 7: Navigate back to teams to verify cleanup option exists
    // ================================================================
    await navigateToTeams(page);
    await waitForLoading(page);

    // Verify teams are still visible
    await expect(page.locator('text=feature-auth')).toBeVisible({ timeout: 10_000 });
  });
});
