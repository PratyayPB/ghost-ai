# Stop/Terminate Design Agent

## Problem

When the design agent is running, there is no way for the user to abort it. The send button simply shows a spinner and the user must wait for the full task to complete (or for the 120s safety timeout to fire). The user wants to be able to click a stop button to immediately cancel the run, remove any partially-drawn nodes/edges from the canvas, and see a "Terminating..." loader until cleanup is done.

## Current Behavior (Preserved)

The following behavior will remain **unchanged**:

- **Chat messages**: The existing chat feed, message rendering, and all Liveblocks storage integration.
- **Design agent trigger**: `handleSend` → `POST /api/ai/design` → Trigger.dev `design-agent` task → Liveblocks `ai-add-node` / `ai-add-edge` events → canvas `addNodes` / `addEdges`.
- **Run completion handler**: The `useEffect` that watches `run.status` for `COMPLETED`, `FAILED`, `CANCELED` transitions remains the same — it already handles `CANCELED` status correctly (sends "AI Generation was canceled." message and clears state).
- **Spec generation**: Completely untouched.
- **Canvas autosave**: The `useCanvasAutosave` hook (5s debounce → `PUT /api/projects/[projectId]/canvas`) continues working normally.
- **All timeout/fallback safety mechanisms**: 120s overall timeout, 15s queue timeout, Liveblocks `ai-complete`/`ai-error` event fallback — all preserved.

## Architecture Understanding

When the design agent runs, it generates nodes/edges in-memory via the LLM and incrementally broadcasts them as Liveblocks events (`ai-add-node`, `ai-add-edge`). The "leader" client (lowest `connectionId`) receives these events and calls `addNodes()` / `addEdges()` to add them to the ReactFlow/Liveblocks canvas state. The autosave hook then persists the full canvas to Vercel Blob after 5 seconds of inactivity.

> [!IMPORTANT]
> **"Design files" in this context are not separate blob files.** They are nodes and edges that get incrementally added to the live canvas state. To "delete generated data," the frontend needs to remove any nodes/edges that were added during the current run from the ReactFlow state. There is no separate backend file to delete — the canvas blob is a single snapshot of the entire canvas.

## Proposed Changes

### 1. Backend — Cancel API Route

#### [NEW] [route.ts](file:///d:/Courses/Web%20Dev/Projects/Portfolio/ghost-ai/app/api/ai/design/cancel/route.ts)

A `POST` handler at `/api/ai/design/cancel` that:
1. Accepts `{ runId }` in the request body.
2. Authenticates and authorizes the user.
3. Calls `runs.cancel(runId)` from `@trigger.dev/sdk` to terminate the background task.
4. Returns `200 OK` with `{ success: true }`.

This is simple because the actual node cleanup happens on the frontend — the backend just needs to stop the Trigger.dev task.

---

### 2. Frontend — Stop button + cancellation state

#### [MODIFY] [ai-chat-sidebar.tsx](file:///d:/Courses/Web%20Dev/Projects/Portfolio/ghost-ai/components/editor/ai-chat-sidebar.tsx)

**New state:**
- `isCanceling: boolean` — tracks whether we're in the process of canceling (shows "Terminating..." loader).
- `preRunNodeIds: Set<string>` — snapshot of existing node IDs taken **before** the design agent starts, so we know which nodes were added by the AI during this run.

**New import:**
- `StopCircle` from `lucide-react` for the stop button icon.

**Changes to `handleSend`:**
- Just before triggering the design API, snapshot the current canvas node IDs: `setPreRunNodeIds(new Set(getNodes().map(n => n.id)))`.

**New `handleCancel` function:**
1. Set `isCanceling = true`.
2. Call `POST /api/ai/design/cancel` with the current `runId`.
3. Wait for the response.
4. Remove AI-generated nodes from the canvas: call `setNodes(prev => prev.filter(n => preRunNodeIds.has(n.id)))` and `setEdges(prev => prev.filter(e => preRunNodeIds.has(e.source) && preRunNodeIds.has(e.target)))` via `useReactFlow`.
5. Send a chat message: "Design generation was terminated."
6. Clear all run state (`runId`, `publicToken`, `runType`, `preRunNodeIds`).
7. Set `isCanceling = false`.

**Send/Stop button swap (L476-493):**
- When `runType === "design"` and `isRunActive` is true: render the **Stop button** (red `StopCircle` icon, or a spinning `Loader2` if `isCanceling` is true).
- Otherwise: render the existing **Send button** (unchanged).

**Status bar text update (L453-461):**
- When `isCanceling` is true: show "Terminating request..." instead of the normal status text.

**Existing `CANCELED` handler guard:**
- The existing `useEffect` at L168 already handles `run.status === "CANCELED"`. Add a guard so it doesn't double-fire a message if `handleCancel` already cleaned up (check `isCanceling` or `runId` being null).

> [!NOTE]
> The `setNodes` and `setEdges` functions from `useReactFlow` work directly with the Liveblocks-synced canvas state (via `useLiveblocksFlow`). Removing nodes this way will correctly propagate to all connected clients and trigger the autosave hook to persist the cleaned-up canvas.

---

## Summary of Files Changed

| File | Change |
|------|--------|
| `app/api/ai/design/cancel/route.ts` | **[NEW]** Cancel API route |
| `components/editor/ai-chat-sidebar.tsx` | **[MODIFY]** Add stop button, cancellation logic, node snapshot |

## Verification Plan

### Manual Verification
1. Start a design agent run via the Chat tab with a complex prompt.
2. While nodes are being drawn on the canvas, click the Stop button.
3. Verify:
   - The "Terminating request..." loader appears briefly.
   - All AI-drawn nodes/edges disappear from the canvas.
   - A "Design generation was terminated." message appears in chat.
   - The send button returns to its normal state.
4. After cancellation, type a new prompt and verify the design agent works normally end-to-end.
5. Switch to the Specs tab and verify spec generation still works independently.
