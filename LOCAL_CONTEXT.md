# Local Context

## Repository Type
This is the Tessira frontend repository. It contains the browser application layer: routes, layouts, pages, reusable UI components, module-level screens, and local presentation/state logic.

## Stack
- Framework: React 18 with Vite and `@vitejs/plugin-react-swc`
- Language: TypeScript
- Routing: `react-router-dom` with route composition in `src/app/routing`
- State management: React context and local component state; app-level providers include tenant, people store, and signals health weights
- Data fetching: `@tanstack/react-query` is wired at app root, but no active `useQuery`/`useMutation` usage or dedicated API client layer is currently present in `src`
- Styling/design system: Tailwind CSS, shadcn/ui-style components under `src/components/ui`, Radix UI primitives, shared CSS tokens in `src/index.css`, Recharts for data visualization

## Structure
- `src/app/routing`: top-level route composition, route groups, and canonical path helpers
- `src/modules`: module-oriented pages/components/data for `people`, `horizon`, `skills`, `signals`, `work`, `insights`, plus supporting surfaces such as `landing`, `auth`, `account`, `help`, `admin`, `platform`, `overview`, and `profile`
- `src/shared/layouts`: shared app shell and shell-level layout pieces
- `src/shared/components`: cross-module UI such as page headers, stat cards, tenant switcher, and user menu
- `src/shared/contexts`: shared context providers such as tenant selection
- `src/shared/data`: shared mock/reference data
- `src/components/ui`: reusable design-system components
- `src/hooks`: shared hooks such as mobile detection and toast helpers
- `src/assets`: static assets
- `src/test`: Vitest setup and example test

Notes:
- There is no dedicated `src/features` directory.
- There is no dedicated `src/services` or `src/api` directory at the moment.

## Runtime / Execution
- Run dev server: `npm run dev`
- Build production bundle: `npm run build`
- Build in development mode: `npm run build:dev`
- Preview built app: `npm run preview`
- Run unit tests: `npm run test`
- Run Vitest in watch mode: `npm run test:watch`
- Run lint: `npm run lint`

Additional config present:
- `playwright.config.ts` exists, but there is no Playwright npm script in `package.json`
- `vitest.config.ts` and `eslint.config.js` are present at repo root

## Key Conventions
- Routing is centralized through `src/app/routing/AppRoutes.tsx`, `TenantAppRoutes.tsx`, `PlatformRoutes.tsx`, and `routePaths.ts`.
- Tenant-facing app navigation lives under `/app` and is rendered inside `src/shared/layouts/AppShell.tsx`.
- Module pages are usually organized by `pages`, with optional `components`, `layouts`, `contexts`, `data`, `types`, and `lib` folders inside each module.
- Shared page framing uses components like `src/shared/components/ModulePageHeader.tsx`.
- Current screens are heavily driven by local module data files such as `src/modules/*/data.ts` and in-memory context state rather than a live backend integration layer.
- Derived operational views are computed in the frontend in places like `signals`, `overview`, and `horizon`; treat these as presentation/analysis surfaces, not proof of backend ownership changes.
- Navigation currently exposes `Work`, `Horizon`, `People`, `Skills`, `Signals`, and `Insights` in the tenant shell. `Overview` is a cross-module dashboard surface, not a canonical Tessira module.
- `admin` and `/platform` surfaces exist in the repo. Treat them as governance/platform UI areas aligned with Core concerns, not as separate canonical module definitions unless shared context says otherwise.

## Important Notes
- The current canonical Tessira modules are: Core, People, Horizon, Skills, Signals, Work, Insights.
- Frontend behavior may evolve ahead of documentation. Undocumented behavior is not automatically wrong, but this repo should not silently redefine canonical module ownership.
- Because no clear backend client layer is present yet, any new action that implies persistence, workflow execution, or server validation should be checked before being presented as supported behavior.
