import { Liveblocks } from "@liveblocks/node";

declare global {
  // eslint-disable-next-line no-var
  var liveblocksGlobal: Liveblocks | undefined;
}

// Cache the Liveblocks client singleton in development to prevent connection fatigue
export const liveblocks =
  globalThis.liveblocksGlobal ||
  new Liveblocks({
    secret: process.env.LIVEBLOCKS_SECRET_KEY!,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.liveblocksGlobal = liveblocks;
}

// A sleek palette of dark-mode-friendly colors for collaborators' carets/cursors
const COLOR_PALETTE = [
  "#F43F5E", // Rose
  "#EC4899", // Pink
  "#8B5CF6", // Violet
  "#3B82F6", // Blue
  "#06B6D4", // Cyan
  "#10B981", // Emerald
  "#F59E0B", // Amber
  "#EF4444", // Red
];

/**
 * Deterministically map a user ID to a consistent cursor color from a fixed palette.
 */
export function getUserColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLOR_PALETTE.length;
  return COLOR_PALETTE[index];
}
