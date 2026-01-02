# Repository Guidelines

## Session Handoff (Frontend)
- Start here: `docs/.codex/AGENTS.md` for full project rules + recent context.
- Mandatory workflow: update `docs/.codex/AGENTS.md` and commit after every change.
- Latest work: admin UI scaffolding + AppHeader/MainLayout, Share UX, event edit/delete, global rename, SSO admin wiring.
- SSO admin status: `/admin/auth` wired to `/api/admin/sso-providers` (list/create/update/delete/test); settings now key/value editor with protocol guidance + missing required key warnings; new-provider flow has protocol selector.
- Admin gating: `/admin/*` routes are protected by `src/components/AdminRoute.tsx` (ADMIN only).
- Public share: `src/pages/SharePage.tsx` uses `/api/share/{token}?from&to`, read-only timeline, infinite scroll; share modal lists per-team links from `/api/shares`.

## Project Structure & Module Organization
- `src/` contains the React app. Key areas: `src/pages/`, `src/components/`, `src/hooks/`, `src/queries/`, `src/lib/`, `src/data/`.
- `public/` holds static assets served as-is.
- Root configs: `vite.config.ts`, `tailwind.config.ts`, `eslint.config.js`, `tsconfig*.json`.

## Build, Test, and Development Commands
- `npm install`: install dependencies.
- `npm run dev`: start Vite dev server at `http://localhost:5173` or `http://localhost:5174`.
- `npm run build`: production build.
- `npm run build:dev`: development-mode build for debugging.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run ESLint across the repo.

## Coding Style & Naming Conventions
- TypeScript + React using `.ts`/`.tsx`, 2-space indentation, double quotes, and semicolons.
- Component names in PascalCase (e.g., `SharedView`); hooks in camelCase (e.g., `useAvailability`).
- Use `@/` alias for `src/` imports where appropriate.
- Tailwind CSS for styling; keep utility class lists readable and grouped.

## Testing Guidelines
- No test runner configured yet. If adding tests, document the runner and add `npm run test`.
- Prefer `ComponentName.test.tsx` and colocate near source.

## Commit & Pull Request Guidelines
- Keep commit subjects short and imperative (e.g., "Add docs folder").
- PRs should include description, linked issues if any, and UI screenshots/recordings.
- Note any config or env changes (e.g., `.env.example`).

## Frontend Agent Instructions (Horizon)
- You are a dedicated FRONTEND Codex agent for the Horizon project. Read carefully and DO NOT invent requirements or redesign the UI.

### Project Overview
- Product name: Horizon.
- Purpose: internal web app to visualize team availability, vacations, and events in a horizontal timeline view.

### UI Requirements (Already Implemented)
- Left sidebar shows ONLY employees from the selected team.
- Search input filters within that team only.
- Top bar contains filters (date range, granularity, event type filter).
- Main timeline:
  - Sticky header.
  - Row 0: Company Lane (GLOBAL events only).
  - Rows 1..N: employees (TEAM + INDIVIDUAL events only).
- Each row supports at least 3 event chips before “+N more”.
- Expand row by clicking employee name (loads expanded events).
- No drag-and-drop.
- No exports.
- Share links supported (backend side; UI may exist later).

### Stack & Runtime
- Vite + React + TypeScript.
- Tailwind CSS.
- React Query.
- Runs on `http://localhost:5173` or `http://localhost:5174`.
- Backend runs on `http://localhost:8080`.
- Env var: `VITE_API_BASE_URL=http://localhost:8080`.

### Auth
- Dev login screen exists (or should exist).
- `POST /api/auth/dev-login { email }` -> token.
- Token stored in `localStorage` as `th_token`.
- `GET /api/me` after login.

### Backend DTO Contracts (Source of Truth)
- `GET /api/teams`.
- `GET /api/teams/{teamId}/employees?search=`.
- `GET /api/event-types?teamId=...`.
  - `EventTypeDto`: `id`, `code`, `name`, `scope`, `teamId`, `source` (WORKDAY|MANUAL), `userCreatable`.
- `GET /api/timeline` returns `{ globalLane, rows[] }`.
- Events include `id`, `title`, `startDate`, `endDate`, `scope` (INDIVIDUAL|TEAM|GLOBAL), `source` (WORKDAY|MANUAL), `eventTypeId` (or nested `eventType`), `isLocked`, `canEdit`, `canDelete`.
- Expand endpoint: `GET /api/timeline/employee-events`.
### Backend OpenAPI (Implemented Contracts)
- Spec: `http://localhost:8080/v3/api-docs`.
- Auth: `POST /api/auth/dev-login`, `GET /api/me`.
- Teams: `GET /api/teams`, `GET /api/teams/{teamId}/employees`.
- Event types: `GET /api/event-types?teamId=...`.
- Timeline: `GET /api/timeline`, `GET /api/timeline/employee-events`.
- Events: `POST /api/events`, `POST /api/events/bulk`.
- Teams: `POST /api/teams`, `PATCH /api/teams/{teamId}`, `DELETE /api/teams/{teamId}`.
- Team members: `GET /api/teams/{teamId}/members`, `POST /api/teams/{teamId}/members`, `PATCH /api/teams/{teamId}/members/{membershipId}`, `DELETE /api/teams/{teamId}/members/{membershipId}`.
- Employees: `GET /api/employees?search=`.
- Event types: `POST /api/event-types`, `PATCH /api/event-types/{eventTypeId}`, `DELETE /api/event-types/{eventTypeId}`.
- Workday: `POST /api/integrations/workday/sync/employees`, `POST /api/integrations/workday/import/absences`.

### Rules for UI Behavior
- If `event.isLocked`, show lock icon; hide/disable edit/delete.
- Use `canEdit`/`canDelete` to show/hide actions (no backend PATCH/DELETE unless already implemented).
- Event types in filter dropdown should come from `GET /api/event-types?teamId=selectedTeamId`.
  - Show global + team-specific.
  - Use eventTypeIds (UUIDs) in filters (not string unions).

### Working Principles
- Do NOT redesign layout/components.
- Prefer minimal diffs.
- Keep Tailwind styling.
- If structural changes are needed, explain why and keep them minimal.
- Add README troubleshooting notes if useful.

## Configuration & Environment
- Create `.env` from `.env.example` with `VITE_API_BASE_URL=http://localhost:8080`.
- Backend runs at `http://localhost:8080`; ensure CORS allows the frontend origin.

## Recent Context
- Team member add flow now uses an autocomplete dropdown in `src/components/ManageTeamsModal.tsx` (search `/api/employees` with keyboard navigation; add by selecting a suggestion).
- Event type management supports free-string `code` with an auto-suggested value derived from the label, and GLOBAL event types can be scoped to multiple teams via `teamIds`.
- Share links now use backend APIs: `POST /api/shares`, `GET /api/shares?teamId=...`, `POST /api/shares/{shareId}/revoke`, and public `GET /api/share/{token}` with `from/to` params. The share modal shows recent links per team and includes hover details for employees/event types.
- Share API updates: `includeGlobalLane` replaces `includeCompanyLane`, share timeline uses `globalLane`, and share summaries include `createdByName`, `employeeNames`, and `eventTypeNames`.
- Share UI entry points: `src/pages/SharePage.tsx` (public view), `src/queries/useShare.ts` (public fetch with from/to), `src/queries/useShares.ts` (per-team share list).
- OpenAPI now includes event edit/delete endpoints (`PATCH /api/events/{eventId}`, `DELETE /api/events/{eventId}`) but frontend wiring is still pending.
- Added `src/queries/useEventMutations.ts` for event update/delete API wiring (UI hookup pending).
- Added `src/components/EditEventModal.tsx` and wired `src/components/EventChip.tsx` to edit/delete endpoints.
- Fixed `src/components/EventChip.tsx` JSX to wrap multiple roots in a fragment (Vite parse error).
- Renamed event type labels from Company to Global in `src/components/ManageEventTypesModal.tsx`.
- Disabled editing event type in `src/components/EditEventModal.tsx` (read-only select).
- Added `src/components/layout/MainLayout.tsx` to host the new `AppHeader` + page container wrapper.
- Added `src/components/layout/AdminLayout.tsx` for the new admin shell and sidebar.
- Added `src/pages/ProfilePage.tsx` for the new profile UI (read-only data from `useMe`).
- Added `src/pages/HelpPage.tsx` with the new help/support layout.
- Added admin pages under `src/pages/admin/` (index redirect, auth, HRIS, users, event types, audit).
- Swapped `src/components/AppShell.tsx` to use `MainLayout` + `AppHeader` instead of `HeaderBar`.
- Added routes for help/profile/admin pages in `src/App.tsx` and wired admin child routes.
- Added `src/components/AdminRoute.tsx` to gate `/admin/*` routes to ADMIN only.
- Added `src/queries/useSsoProviders.ts` for admin SSO provider list/create/update/delete/test.
- Wired `src/pages/admin/AuthPage.tsx` to the admin SSO provider endpoints.
- Swapped SSO connection settings to a key/value editor for flexible provider-specific config.
- `SsoProviderDto` now includes the `protocol` field from OpenAPI.
- Added SSO provider guidance (protocol, required keys, reference link) in `src/pages/admin/AuthPage.tsx`.
- Added missing required-key warning chips for SSO settings.
- Fixed new-provider flow to allow protocol selection without reverting to the first provider.
- Updated SSO provider types to match new OpenAPI enums and added `/api/admin/sso-providers/types` usage for protocol/required settings.
- Restructured Admin SSO UI to show a list of configs with edit selection and a New provider action.
- Changed SSO admin UX: configs list expands inline for edits; new provider opens in a modal.

## Workflow Note
- Commit every change immediately after it is made (no batching).
- Update this documentation on every change.
