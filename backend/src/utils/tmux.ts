import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

let cachedPaneIds: Set<string> | null = null;
let cacheTimestamp = 0;
const CACHE_TTL_MS = 5000;

export async function getActiveTmuxPanes(): Promise<Set<string>> {
  const now = Date.now();
  if (cachedPaneIds && now - cacheTimestamp < CACHE_TTL_MS) {
    return cachedPaneIds;
  }

  try {
    const { stdout } = await execFileAsync("tmux", [
      "list-panes",
      "-a",
      "-F",
      "#{pane_id}",
    ]);
    cachedPaneIds = new Set(stdout.trim().split("\n").filter(Boolean));
  } catch {
    // tmux not running or not installed — all panes are dead
    cachedPaneIds = new Set();
  }
  cacheTimestamp = now;
  return cachedPaneIds;
}

export async function isTmuxPaneAlive(paneId: string): Promise<boolean> {
  const panes = await getActiveTmuxPanes();
  return panes.has(paneId);
}
