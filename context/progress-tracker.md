# Progress Tracker

Update this file whenever the current phase, active feature, or implementation state changes.

## Current Phase

Editor Workspace Setup

## Current Goal

Build editor canvas/workspace component for code editing and integrate Monaco or CodeMirror.

## Completed

- Installed and configured `shadcn` (Nova preset) and required packages (`lucide-react`, `class-variance-authority`, `tailwind-merge`, `tw-animate-css`).
- Generated shadcn UI primitives in `components/ui/` (button, card, dialog, input, tabs, textarea, scroll-area).
- Created `lib/utils.ts` with `cn()` helper.
- Applied dark theme default by enabling `dark` class in `app/layout.tsx` and updated `app/globals.css`.
- Verified project builds successfully (`npm run build`).
- Investigated hydration mismatch warning and confirmed the extra `<body>` attributes were injected by a browser extension rather than app code.
- Validated component imports across the app (all imports working correctly).
- Created comprehensive examples page at `/app/examples/page.tsx` showcasing all core UI components (buttons, cards, inputs, tabs, dialogs, scroll-area, dialog pattern).
- Implemented editor chrome components: `components/editor/editor-navbar.tsx`, `components/editor/project-sidebar.tsx`, `components/editor/dialog-pattern.tsx`.
- Verified all accessibility attributes are in place (aria-labels, keyboard navigation, WCAG AA color contrast).
- Installed Clerk CLI, authenticated with Clerk, and confirmed Clerk initialization for this Next.js project.
- Added sign-in/sign-up/user controls on the landing page and verified Clerk proxy matcher configuration.
- Installed `@clerk/ui` for Clerk theming.
- Applied Clerk's dark theme in `app/layout.tsx` with CSS variable mapping for `colorBackground`, `colorInputBackground`, `colorInputText`, `colorText`, `colorTextSecondary`, `colorPrimary`, `colorDanger`, and `borderRadius`.
- Updated `/` (home page) to redirect authenticated users to `/editor` and unauthenticated users to `/sign-in`.
- Added `UserButton` component to editor navbar right section for profile and logout controls.
- Updated auth pages to a minimal Clerk layout with a desktop two-panel feature summary and centered form on mobile, using only CSS variables and theme classes.
- Verified `proxy.ts` has `'/__clerk/:path*'` matcher and all routes protected except public auth paths.
- Fixed `proxy.ts` export for Next.js 16 (changed default export to named `proxy` export).
- Updated `proxy.ts` public route matching to use env vars `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL`.
- Refactored `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx` to be Server Components, removed redundant `"use client"` directives, removed extra card border/popover container wrappers, and let Clerk default to env vars.
- Fixed `baseTheme` warning/error in `app/layout.tsx` by renaming `baseTheme` to `theme` for Clerk v7 compatibility.
- Created `lib/hooks/use-project-dialogs.ts` to manage project list state, active dialogs, input name and slug updates.
- Created `components/editor/project-dialogs.tsx` component implementing Create Project, Rename Project, and Delete Project dialog overlays.
- Updated `components/editor/project-sidebar.tsx` with tabs for owned (My Projects) and collaborator (Shared) projects, adding actions to owned projects.
- Added a mobile backdrop scrim overlay and click-outside handler to close the sidebar.
- Refactored `app/editor/page.tsx` home screen layout with a minimal design to create/open projects and view the active workspace without card containers.
- Replaced next/font/google imports in layout.tsx with local system-font stack defined in globals.css to avoid Google Font download errors during offline compilation.
- Updated `package.json` with explicit Prisma dependencies (`@prisma/client`, `@prisma/adapter-pg`, `pg`, `prisma`, `@types/pg`).
- Created `prisma.config.ts` CLI config file to handle schema paths and environment variables.
- Configured split schema folder option and created `prisma/models/project.prisma` containing data models (`Project`, `ProjectCollaborator`, `ProjectStatus`).
- Created `lib/prisma.ts` singleton client manager branching on database URL (Accelerate direct OR `@prisma/adapter-pg` driver).
- Successfully executed first database migration (`npx prisma migrate dev --name init_project_models`) and generated client.
- Verified successful production build via `npm run build`.
- Completed Prisma database integration setup.
- Created `app/api/projects/route.ts` with `GET` (list user's projects) and `POST` (create project, default name "Untitled Project") endpoints.
- Created `app/api/projects/[projectId]/route.ts` with `PATCH` (rename, owner-only) and `DELETE` (delete, owner-only) endpoints.
- Enforced `401` for unauthenticated requests and `403` for non-owner mutations on all project API routes.
- Verified production build passes with all four project API routes registered.
- Converted `app/editor/page.tsx` from client to server component; fetches owned and shared projects server-side via `lib/data/projects.ts`.
- Created `lib/hooks/use-project-actions.ts` hook managing dialog state and real API mutations (create → POST, rename → PATCH, delete → DELETE) with navigation and router refresh.
- Created `components/editor/editor-home-client.tsx` client wrapper receiving server-fetched project data as props.
- Create dialog generates a room ID by slugifying the name + a short unique suffix.
- Rename dialog pre-fills the current name; delete dialog shows the project name and redirects to `/editor` if deleting the active workspace.
- Updated `project-sidebar.tsx` and `project-dialogs.tsx` imports to use the new `use-project-actions` hook types.
- Verified production build passes with `/editor` as dynamic server-rendered route.
- Created `lib/project-access.ts` with `getIdentity()` (Clerk userId + primary email) and `checkProjectAccess()` (owner or collaborator check) helpers.
- Created `components/editor/access-denied.tsx` with centered layout, lock icon, short message, and link back to `/editor`.
- Created `components/editor/workspace-shell.tsx` — full-viewport workspace layout with: top navbar showing project name, share button, AI sidebar toggle; left `ProjectSidebar` with current room highlighted; central canvas placeholder (dark bg + centered message); collapsible right AI chat sidebar placeholder.
- Created `app/editor/[roomId]/page.tsx` as a server component with auth redirect, access check via `checkProjectAccess`, and `AccessDenied` for unauthorized/missing projects.
- Verified production build passes with `/editor/[roomId]` registered as dynamic route.
- Implemented project sharing behavior (Share Dialog):
  - Created `/api/projects/[projectId]/collaborators` API endpoints supporting: GET (list with Clerk user profile enrichment), POST (invite collaborator by email, owner-only), DELETE (remove collaborator, owner-only).
  - Created `components/editor/share-dialog.tsx` component with clipboard link sharing, collaborator invitations, user profile avatars, and a read-only view for guest collaborators.
  - Wired the Share Dialog into the Workspace Shell and verified production build passes cleanly.
- Configured Liveblocks Realtime Collaboration Infrastructure (Liveblocks Setup):
  - Installed `@liveblocks/node@^3.20.0` package dependency.
  - Created root `liveblocks.config.ts` specifying global TypeScript `Presence` (cursor, isThinking) and `UserMeta` (id, info: name, avatar, color) definitions.
  - Created `lib/liveblocks.ts` backend client helper with connection caching for dev hot-reloads and a deterministic client-color mapper.
  - Implemented `/api/liveblocks-auth` POST authentication endpoint verifying Clerk sessions, validating workspace access rights, auto-provisioning room permissions, and attaching enriched user names, avatars, and colors to identified tokens.
  - Verified Next.js production build passes with dynamic auth matching.
- Implemented Realtime Collaborative React Flow Base Canvas (Base Canvas Setup):
  - Created `types/canvas.ts` declaring types `CanvasNodeShape`, `CanvasNodeData`, `CanvasNode`, and `CanvasEdge`.
  - Created `components/editor/collaborative-canvas.tsx` client component rendering `ReactFlow` with loose connections, fitView, dots background pattern, minimap, and multiplayer collaborator cursor overlays synced via `useLiveblocksFlow`.
  - Created `components/editor/collaborative-canvas-wrapper.tsx` managing `LiveblocksProvider`, `RoomProvider`, presence setup, loading suspense fallback, and a custom error boundary connection retry UI.
  - Mounted the wrapper in `components/editor/workspace-shell.tsx` and verified clean compilation.
- Implemented Shape Panel & Drag-to-Create (Shape Panel):
  - Extended `types/canvas.ts` with `pill`, `cylinder`, `hexagon` shapes, `SHAPE_DEFAULTS` dimension map, and `DEFAULT_NODE_COLOR`.
  - Created `components/editor/shape-panel.tsx` — floating pill-shaped toolbar at canvas bottom-center with 6 draggable Lucide icon buttons encoding shape + size in drag payload.
  - Created `components/editor/canvas-node.tsx` — custom `canvasNode` renderer handling shape-specific CSS/SVG structures for rectangles, circles, pills, diamonds, hexagons, and cylinders.
  - Updated `components/editor/collaborative-canvas.tsx` with `onDragOver`/`onDrop` handlers converting screen → flow coordinates via `useReactFlow`, `nodeTypes` registration, and unique ID generation (`shape-timestamp-counter`).
- Implemented Node Shape Visuals & Drag Preview:
  - Refactored `canvas-node.tsx` to export `BaseShapeRenderer` for reusable shape rendering without React Flow handles.
  - Updated `shape-panel.tsx` with `createPortal` to render a fixed-position cursor-following ghost preview of the shape matching the dragged dimensions.
  - Disabled the default browser HTML5 drag translucent ghost using an empty image via `e.dataTransfer.setDragImage()`.
- Implemented Node Editing & Resizing (Node Editing):
  - Integrated `@xyflow/react` `<NodeResizer />` to show resizing handles on selected nodes, preventing them from being resized below `60x36`.
  - Added inline text editing to nodes activated via double-click, displaying a `textarea` positioned absolutely over the label.
  - Connected the label edits to the existing `updateNodeData` sync flow from `useReactFlow`, persisting automatically on blur or `Enter`/`Escape`.
  - Suppressed canvas drag events while interacting with the textarea via `stopPropagation`.
- Implemented Node Colors Toolbar (Node Colors Toolbar):
  - Extracted the 8 predefined node color palettes from `ui-context.md` into `NODE_COLORS` in `types/canvas.ts`.
  - Updated `CanvasNodeData` to support tracking `textColor` alongside the background `color`.
  - Added `@xyflow/react` `<NodeToolbar>` to `CanvasNodeRenderer` that appears above selected nodes.
  - Rendered a swatch picker that updates both the node's background and text colors simultaneously via `updateNodeData`.
- Implemented Custom Edge Behavior (Edge Behavior):
  - Created `components/editor/canvas-edge.tsx` utilizing `EdgeLabelRenderer` and `getSmoothStepPath` for clean right-angle edge routing.
  - Added an invisible, thick SVG path layer to each edge, heavily improving hover and click accessibility without altering visual line thickness.
  - Implemented inline edge label editing on double-click, persisting to `edge.data.label` via `updateEdgeData`.
  - Added 4-sided connection handles (top, right, bottom, left) to `CanvasNodeRenderer` that smoothly fade in on node hover using `group-hover`.
  - Configured `defaultEdgeOptions` and intercepted `onConnect` in `collaborative-canvas.tsx` to ensure all new edges utilize the custom `canvasEdge` type with closed arrow markers.
- Implemented Canvas Ergonomics (Canvas Ergonomics):
  - Created `components/editor/canvas-controls.tsx` containing a pill-shaped toolbar positioned at the bottom left with Zoom In, Zoom Out, Fit View, Undo, and Redo buttons.
  - Wired zoom buttons directly into the React Flow instance via `useReactFlow()`.
  - Wired undo/redo buttons into Liveblocks room history using `useUndo`, `useRedo`, `useCanUndo`, and `useCanRedo` from `@liveblocks/react/suspense`, ensuring buttons visually dim when history is empty.
  - Created a global `useKeyboardShortcuts` hook bound to the window for handling `+`/`=`, `-`, `Ctrl/Cmd+Z`, and `Ctrl/Cmd+Shift+Z` / `Ctrl/Cmd+Y`, which safely ignores inputs when typing in text fields.
  - Removed the default React Flow `<MiniMap>` from the workspace bottom right.
- Implemented Starter Templates (Starter Templates):
  - Created `components/editor/starter-templates.ts` containing 3 built-in diagrams: Microservices Architecture, CI/CD Pipeline, and Event-Driven System.
  - Created `components/editor/starter-templates-modal.tsx` rendering a grid of templates with SVG-based lightweight previews.
  - Added a "Templates" button to the editor navbar utilizing a custom DOM event `open-templates-modal`.
  - Wired import flow in `collaborative-canvas.tsx` to completely replace the canvas nodes and edges using React Flow's state updates.
- Implemented Presence Avatars & Live Cursors:
  - Updated `liveblocks.config.ts` to type the `cursor` and `thinking` properties within `Presence`.
  - Created `presence-avatars.tsx` to render an overlapping stack of collaborator avatars fetched via `useOthers()`.
  - Rendered a duplicate Clerk `UserButton` within the avatar group to maintain visual consistency without altering the global navbar.
  - Broadcasted mouse coordinates within `collaborative-canvas.tsx` using `updateMyPresence` on pointer move and leave events, which feeds into `@liveblocks/react-flow`'s `<Cursors />` component.
- Implemented Trigger.dev Backend Flow for Design Generation:
  - Created Prisma `TaskRun` model with compound indexing for secure user-project run ownership.
  - Implemented `app/api/ai/design/route.ts` to trigger the `designAgent` and record task runs.
  - Implemented `app/api/ai/design/token/route.ts` to generate run-scoped read-only tokens for frontend status tracking.
  - Created minimal Trigger.dev background task `designAgent` via `@trigger.dev/sdk/v3` stubbing the AI execution phase.
- Implemented AI Design Agent Logic:
  - Created `AiStatusFeed` component to display real-time status and errors from the agent.
  - Implemented Liveblocks REST API `POST /v2/rooms/{roomId}/presence` inside the `trigger/design-agent.ts` background task to inject the agent into the room visually with a custom avatar and thinking cursor state.
  - Used `@ai-sdk/google` (`gemini-2.5-flash`) inside the background task with a strict `zod` schema to enforce structurally valid nodes and edges for the diagram.
  - Broadcasted custom `RoomEvent`s (`ai-add-node`, `ai-add-edge`, `ai-status`, `ai-complete`) iteratively to simulate a live-drawing experience.
  - Implemented deterministic leader election in `collaborative-canvas.tsx` using `useOthers` and `useSelf` to prevent duplicated node generation from multiple connected clients.
- Implemented AI Presence and Status Indicators:
  - Created `types/tasks.ts` to define the AI status message payload schema and runtime validation guards.
  - Created `hooks/use-ai-status.ts` shared hook to track real-time AI generation events from Liveblocks.
  - Created `components/editor/ai-chat-sidebar.tsx` with a rich AI chat UI, status indicator dot, active status bar, and disabled prompt input states.
  - Modified `components/editor/workspace-shell.tsx` to render the custom `AiChatSidebar` instead of the placeholder text.
  - Modified `components/editor/ai-status-feed.tsx` to utilize the shared `useAiStatus` hook.
  - Created `components/editor/custom-cursor.tsx` showing mouse pointer, user name badge, and custom thinking spinner.
  - Modified `components/editor/collaborative-canvas.tsx` to pass the `CustomCursor` component to `<Cursors />`.
  - Wrapped `WorkspaceShell` with `CollaborativeCanvasWrapper` in `app/editor/[roomId]/page.tsx` to expose Liveblocks hooks workspace-wide.
  - Verified Next.js production build compiles successfully (`npm run build`).
- Implemented Sidebar Chat Feed:
  - Created Zod validation schema and inferred TypeScript type `ChatMessage` in `types/tasks.ts` to validate all chat messages.
  - Added `chatMessages` as a `LiveList` within the `Storage` definition in `liveblocks.config.ts`.
  - Initialized `chatMessages` with an empty `LiveList` within the `initialStorage` prop on the `RoomProvider` in `collaborative-canvas-wrapper.tsx`.
  - Created `hooks/use-ai-chat.ts` to subscribe to the Liveblocks storage feed, expose validated messages, and supply a `sendMessage` mutation with automated error logging and error state tracking.
  - Rewired the `AiChatSidebar` panel in `components/editor/ai-chat-sidebar.tsx` to hook into `useAiChat`, rendering messages in user/assistant bubbles, formatting timestamps, auto-scrolling to the bottom, and handling sending failures gracefully.
  - Verified Next.js production build compiles successfully (`npm run build`).
- Implemented Design Agent Frontend Integration:
  - Updated `use-ai-chat` hook to handle optional assistant roles and system sender overrides.
  - Configured `AiChatSidebar` to call design trigger and token retrieval APIs sequentially on prompt submissions.
  - Integrated `@trigger.dev/react-hooks` `useRealtimeRun` to monitor active task execution in real time.
  - Disabled input fields, displayed a status strip above the input form using a dark base + green accent theme, and rendered a submit spinner during active runs.
  - Implemented automatic completion message posts and state cleanup on terminal task runs.
  - Styled user chat bubbles and submit buttons with the `#62C073` green accent.
  - Verified the Next.js production build compiles successfully without compilation or TypeScript errors.
- Implemented AI Spec Generation Flow (Backend):
  - Created `POST /api/ai/spec` API route to validate session, verify workspace access using Clerk and room ID, trigger the background spec generation task, and save the task run in Prisma.
  - Created `POST /api/ai/spec/token` API route to verify ownership of the task run and generate a 1-hour public read-scoped token for real-time tracking.
  - Created `trigger/generate-spec.ts` background task that validates inputs via Zod, reads canvas nodes and edges, parses conversation chat history, and uses Gemini 2.5 Flash (`google("gemini-2.5-flash")`) to generate a comprehensive Markdown technical specification.
  - Verified the Next.js production build compiles successfully.
- Implemented AI Spec Persistence & Download Flow (Backend):
  - Created `ProjectSpec` database model and configured the relation to the `Project` model. Created and applied database migration `add_project_spec`.
  - Updated the Trigger.dev `generate-spec` task to generate a unique specification ID, upload the Markdown specification text directly to Vercel Blob, and store the resulting file path in the `ProjectSpec` database model.
  - Implemented a secure download API route `GET /api/projects/[projectId]/specs/[specId]/download` verifying Clerk identity, checking project permissions, checking spec validity, and returning the file content with standard attachment download headers.
  - Verified that the Next.js production build compiles successfully.
- Implemented Spec UI Integration:
  - Created `GET /api/projects/[projectId]/specs` endpoint returning project spec records sorted by newest.
  - Added a "Specs" tab to `components/editor/ai-chat-sidebar.tsx` alongside "Chat" using shadcn/ui `Tabs` layout.
  - Created client component `components/editor/spec-list.tsx` to retrieve and display specifications with filenames, creation timestamps, and inline download actions.
  - Created preview modal component `components/editor/spec-preview-modal.tsx` (using shadcn/ui `Dialog` and `ScrollArea`) to retrieve and render specification Markdown content and trigger direct file downloads.
  - Verified Next.js production build compiles successfully (`npm run build`).

## In Progress

- None

## Next Up

- Add file tree navigation component
- Create settings/preferences panel

## Open Questions

## Architecture Decisions

- Use shadcn/ui with Tailwind v4 and custom dark theme styles.

## Session Notes
