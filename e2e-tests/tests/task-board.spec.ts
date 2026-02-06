import { test, expect } from '@playwright/test';
import {
  ApiHelper,
  waitForAppReady,
  navigateToTasks,
  waitForLoading,
} from '../helpers';

test.describe('Task Board', () => {
  let api: ApiHelper;

  test.beforeEach(async ({ page, request }) => {
    api = new ApiHelper(request);
    await api.reset();
    await page.goto('/');
    await waitForAppReady(page);
    await navigateToTasks(page);
    await waitForLoading(page);
  });

  // ── 5. View task board with correct columns ─────────────────────────

  test('should display three Kanban columns', async ({ page }) => {
    // KanbanColumn components render h3 titles: "Pending", "In Progress", "Completed"
    await expect(page.locator('h3', { hasText: 'Pending' })).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('h3', { hasText: 'In Progress' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Completed' })).toBeVisible();

    // Three column divs in the grid
    const columns = page.locator('[data-testid="kanban-grid"] > div');
    await expect(columns).toHaveCount(3);
  });

  test('should show tasks in the correct column based on status', async ({ page }) => {
    // The "In Progress" column should contain "Implement JWT" (task #2, always in_progress)
    const inProgressCol = page.locator('[data-testid="kanban-grid"] > div').nth(1);
    await expect(inProgressCol.locator('text=Implement JWT')).toBeVisible({ timeout: 10_000 });

    // The "Completed" column should contain "Design authentication" (task #1, always completed)
    const completedCol = page.locator('[data-testid="kanban-grid"] > div').nth(2);
    await expect(completedCol.locator('text=Design authentication')).toBeVisible();

    // Each column should have at least one task card
    const pendingCol = page.locator('[data-testid="kanban-grid"] > div').nth(0);
    await expect(pendingCol.locator('.cursor-pointer').first()).toBeVisible();
  });

  test('should display task owner on cards', async ({ page }) => {
    // Task cards show owner name with a User icon, e.g. "backend-dev"
    await expect(page.locator('text=backend-dev').first()).toBeVisible({ timeout: 10_000 });
  });

  test('should show blocked badge on tasks with dependencies', async ({ page }) => {
    // Tasks with blockedBy show a red "Blocked" badge
    await expect(page.locator('text=Blocked').first()).toBeVisible({ timeout: 10_000 });
  });

  // ── 6. Create a new task ────────────────────────────────────────────

  test('should create a new task via the dialog', async ({ page }) => {
    // Click "Create Task" button
    await page.getByRole('button', { name: /Create Task/i }).click();

    // CreateTaskDialog should appear
    const dialog = page.locator('[role="dialog"]');
    await dialog.waitFor({ state: 'visible' });

    // Fill in subject (label: "Subject", placeholder: "Task title")
    await dialog.locator('#task-subject').fill('E2E Test Task');

    // Fill in description
    await dialog.locator('#task-desc').fill('Created by e2e test');

    // Submit
    await dialog.getByRole('button', { name: /Create Task/i }).click();

    // Dialog should close
    await dialog.waitFor({ state: 'hidden', timeout: 10_000 });
  });

  // ── 7. Update task status via detail panel ──────────────────────────

  test('should open task detail panel and show status change buttons', async ({ page }) => {
    // Click on any task to open its detail panel
    await page.locator('text=Design authentication database schema').click();

    // TaskDetailPanel should appear as a side panel
    const detailPanel = page.locator('[data-testid="task-detail-panel"]');
    await detailPanel.waitFor({ state: 'visible', timeout: 10_000 });

    // Should show the task subject
    await expect(detailPanel.locator('h3')).toContainText('Design authentication database schema');

    // Task #1 is "completed", so it should show "Reopen" button
    await expect(detailPanel.getByRole('button', { name: 'Reopen' })).toBeVisible();
  });

  test('should change task status via the Start button in detail panel', async ({ page }) => {
    // Click on a pending task in the "Pending" column
    const pendingCol = page.locator('[data-testid="kanban-grid"] > div').nth(0);
    const firstPendingCard = pendingCol.locator('.cursor-pointer').first();
    await expect(firstPendingCard).toBeVisible({ timeout: 10_000 });
    await firstPendingCard.click();

    const detailPanel = page.locator('[data-testid="task-detail-panel"]');
    await detailPanel.waitFor({ state: 'visible', timeout: 10_000 });

    // For a pending task, should show "Start" button
    await detailPanel.getByRole('button', { name: 'Start' }).click();

    // The task's status badge in the detail panel should now show "In Progress"
    await expect(detailPanel.locator('text=In Progress')).toBeVisible({ timeout: 10_000 });
  });

  // ── 8. View task details ────────────────────────────────────────────

  test('should display task description in detail panel', async ({ page }) => {
    // Click on the first visible task
    await page.locator('text=Design authentication database schema').click();

    const detailPanel = page.locator('[data-testid="task-detail-panel"]');
    await detailPanel.waitFor({ state: 'visible', timeout: 10_000 });

    // Should show description heading and content
    await expect(detailPanel.locator('text=Description')).toBeVisible();
    await expect(detailPanel.locator('text=Create the database schema')).toBeVisible();
  });

  test('should display dependency information in detail panel', async ({ page }) => {
    // Click task #5 which is blocked by task #2
    await page.locator('text=Write authentication middleware').click();

    const detailPanel = page.locator('[data-testid="task-detail-panel"]');
    await detailPanel.waitFor({ state: 'visible', timeout: 10_000 });

    // Dependencies section should be visible
    await expect(detailPanel.locator('text=Dependencies')).toBeVisible();
    await expect(detailPanel.locator('text=Blocked by')).toBeVisible();

    // Should show the blocking task ID
    await expect(detailPanel.locator('text=#2')).toBeVisible();
  });

  test('should show task owner in detail panel', async ({ page }) => {
    // Click task #2 which has owner "backend-dev"
    await page.locator('text=Implement JWT token').click();

    const detailPanel = page.locator('[data-testid="task-detail-panel"]');
    await detailPanel.waitFor({ state: 'visible', timeout: 10_000 });

    // Owner section should show "backend-dev"
    await expect(detailPanel.locator('text=Owner')).toBeVisible();
    await expect(detailPanel.locator('text=backend-dev')).toBeVisible();
  });

  test('should close detail panel with the X button', async ({ page }) => {
    await page.locator('text=Design authentication database schema').click();

    const detailPanel = page.locator('[data-testid="task-detail-panel"]');
    await detailPanel.waitFor({ state: 'visible', timeout: 10_000 });

    // Click the close (X) button in the panel header
    // The X button is in the header area of the detail panel
    await detailPanel.locator('button:has(svg)').last().click();

    await detailPanel.waitFor({ state: 'hidden', timeout: 5_000 });
  });
});
