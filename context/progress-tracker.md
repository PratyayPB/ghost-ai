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

## In Progress

- None

## Next Up

- Implement AI chat sidebar logic
- Add file tree navigation component
- Create settings/preferences panel

## Open Questions

## Architecture Decisions

- Use shadcn/ui with Tailwind v4 and custom dark theme styles.

## Session Notes
