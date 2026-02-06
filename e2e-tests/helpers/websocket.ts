import { Page } from '@playwright/test';

/**
 * WebSocket helpers for e2e tests.
 * The status bar in the actual app shows "Connected" / "Disconnected".
 */

/** Wait for the WebSocket connection to be established via the status bar. */
export async function waitForWebSocketConnected(page: Page): Promise<void> {
  await page.locator('footer', { hasText: 'Connected' }).waitFor({
    state: 'visible',
    timeout: 15_000,
  });
}

/**
 * Wait for a specific Socket.io event to arrive.
 * Requires the app to expose the socket on window.__TEST_SOCKET__.
 */
export async function waitForSocketEvent<T = unknown>(
  page: Page,
  event: string,
  timeoutMs = 10_000,
): Promise<T> {
  return page.evaluate(
    ({ event, timeoutMs }) => {
      return new Promise<T>((resolve, reject) => {
        const timeout = setTimeout(
          () => reject(new Error(`Timed out waiting for socket event: ${event}`)),
          timeoutMs,
        );
        const socket = (window as any).__TEST_SOCKET__;
        if (!socket) {
          clearTimeout(timeout);
          reject(new Error('Socket.io instance not found on window.__TEST_SOCKET__'));
          return;
        }
        socket.once(event, (data: T) => {
          clearTimeout(timeout);
          resolve(data);
        });
      });
    },
    { event, timeoutMs },
  );
}

/** Subscribe to a team channel via WebSocket. */
export async function subscribeToTeam(page: Page, teamName: string): Promise<void> {
  await page.evaluate(
    ({ teamName }) => {
      const socket = (window as any).__TEST_SOCKET__;
      if (socket) {
        socket.emit('subscribe:team', { teamName });
      }
    },
    { teamName },
  );
}
