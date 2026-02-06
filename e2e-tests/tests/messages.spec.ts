import { test, expect } from '@playwright/test';
import {
  ApiHelper,
  waitForAppReady,
  navigateToMessages,
  waitForLoading,
} from '../helpers';

test.describe('Messages', () => {
  let api: ApiHelper;

  test.beforeEach(async ({ page, request }) => {
    api = new ApiHelper(request);
    await page.goto('/');
    await waitForAppReady(page);
    await navigateToMessages(page);
    await waitForLoading(page);
  });

  // ── Initial state ───────────────────────────────────────────────────

  test('should show team selection prompt before loading messages', async ({ page }) => {
    // When no team is selected, it shows "Select a team to view messages"
    await expect(page.locator('text=Select a team to view messages')).toBeVisible({
      timeout: 10_000,
    });
  });

  // ── 11. View message history ────────────────────────────────────────

  test('should display messages after selecting a team', async ({ page }) => {
    // Select the "feature-auth" team from the team filter dropdown
    const teamSelect = page.locator('select').first();
    await expect(teamSelect).toBeVisible({ timeout: 10_000 });
    await teamSelect.selectOption({ label: 'feature-auth' });
    await waitForLoading(page);

    // Messages should now be visible
    // Mock data has messages from team-lead, frontend-dev, backend-dev
    await expect(page.locator('text=team-lead').first()).toBeVisible({ timeout: 10_000 });
  });

  test('should show sender names on messages', async ({ page }) => {
    const teamSelect = page.locator('select').first();
    await teamSelect.selectOption({ label: 'feature-auth' });
    await waitForLoading(page);

    // MessageBubble shows sender name in a span with font-medium class
    // Mock messages have senders: team-lead, frontend-dev, backend-dev
    await expect(page.locator('text=team-lead').first()).toBeVisible({ timeout: 10_000 });
    await expect(page.locator('text=backend-dev').first()).toBeVisible();
  });

  test('should show message content', async ({ page }) => {
    const teamSelect = page.locator('select').first();
    await teamSelect.selectOption({ label: 'feature-auth' });
    await waitForLoading(page);

    // Check for actual message content from mock data
    await expect(
      page.locator('text=database schema looks good').first(),
    ).toBeVisible({ timeout: 10_000 });
  });

  test('should visually distinguish broadcast messages', async ({ page }) => {
    const teamSelect = page.locator('select').first();
    await teamSelect.selectOption({ label: 'feature-auth' });
    await waitForLoading(page);

    // Broadcast messages show a "Broadcast" badge
    await expect(page.locator('text=Broadcast').first()).toBeVisible({ timeout: 10_000 });
  });

  // ── 12. Send a message via composer ─────────────────────────────────

  test('should show message composer after selecting a team', async ({ page }) => {
    const teamSelect = page.locator('select').first();
    await teamSelect.selectOption({ label: 'feature-auth' });
    await waitForLoading(page);

    // The MessageComposer should be visible at the bottom
    // It has a broadcast checkbox, recipient select, textarea, and send button
    const composer = page.locator('.border-t.border-border.p-3');
    await expect(composer).toBeVisible({ timeout: 10_000 });

    // Should have a textarea placeholder
    await expect(page.getByPlaceholder(/Type a message/i)).toBeVisible();
  });

  test('should send a direct message to a selected recipient', async ({ page }) => {
    const teamSelect = page.locator('select').first();
    await teamSelect.selectOption({ label: 'feature-auth' });
    await waitForLoading(page);

    // Wait for the composer to render
    const textarea = page.getByPlaceholder(/Type a message/i);
    await expect(textarea).toBeVisible({ timeout: 10_000 });

    // Select a recipient from the recipient dropdown (the select within the composer)
    // The composer has a checkbox and a select for recipients
    const allSelects = page.locator('select');
    // The recipient select is the second select (first is team filter)
    const recipientSelect = allSelects.nth(1);
    await expect(recipientSelect).toBeVisible({ timeout: 5_000 });
    await recipientSelect.selectOption({ index: 1 });

    // Type a message
    await textarea.fill('Hello from e2e test!');

    // Click the send button (button next to the textarea)
    await page.locator('button:has(svg.lucide-send)').click();

    // The message should appear in the message list (optimistic update)
    await expect(page.locator('text=Hello from e2e test!')).toBeVisible({ timeout: 10_000 });

    // Input should be cleared after sending
    await expect(textarea).toHaveValue('');
  });

  test('should send a broadcast message', async ({ page }) => {
    const teamSelect = page.locator('select').first();
    await teamSelect.selectOption({ label: 'feature-auth' });
    await waitForLoading(page);

    // Check the broadcast checkbox
    const broadcastCheckbox = page.locator('.border-t input[type="checkbox"]');
    await expect(broadcastCheckbox).toBeVisible({ timeout: 10_000 });
    await broadcastCheckbox.check();

    // When broadcast is checked, the recipient select should be hidden
    const recipientSelect = page.locator('.border-t select');
    await expect(recipientSelect).toBeHidden();

    // Placeholder should change to broadcast variant
    await expect(page.getByPlaceholder(/broadcast/i)).toBeVisible();

    // Type and send the message
    await page.getByPlaceholder(/broadcast/i).fill('Broadcast from e2e test!');
    await page.locator('button:has(svg.lucide-send)').click();

    // Should appear in the list
    await expect(page.locator('text=Broadcast from e2e test!')).toBeVisible({ timeout: 10_000 });
  });
});
