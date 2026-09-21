# HANDOFF — Frontend Foundation + Authentication Module

## Project

Restaurant Management System

## Delivered

- Frontend Foundation (Phase P1-FE-01A)
- Authentication Module — Login/Logout (Phase P1-FE-02)

## Commits

Both phases were built on branch `person1/frontend` in the source repo:

- **Foundation commit:** `8c4d158` — "feat(frontend): shared foundation - bootstrap, routing, i18n/RTL, api client, auth boundary"
- **Auth commit:** `52e2076` — "feat(frontend): implement authentication module"

`52e2076` is the branch HEAD at the time this archive was built; the working
tree was clean (`git status` → "nothing to commit, working tree clean").

This archive ships the **file contents** of those two commits — it does not
include `.git/`, so it will not carry commit history into your local repo.
If you want the actual commits (not just the files), pull/merge the
`person1/frontend` branch from the source repo instead of/in addition to
extracting this archive.

## Exact files

```
frontend/
├── .env.example
├── .gitignore
├── .oxlintrc.json
├── README.md
├── index.html
├── package.json
├── package-lock.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
├── vite.config.ts
├── contracts/                     Phase 00 shared contracts (unmodified)
│   ├── api.ts
│   ├── entities.ts
│   └── enums.ts
├── public/
│   └── favicon.svg
└── src/
    ├── main.tsx, App.tsx, index.css, vite-env.d.ts
    ├── config/env.ts
    ├── api/client.ts, api/ApiError.ts
    ├── auth/AuthContext.tsx, auth/ProtectedRoute.tsx, auth/tokenStorage.ts
    ├── i18n/LocaleContext.tsx, i18n/translations/{ar,en}.ts
    ├── components/ui/{ErrorBoundary,AppErrorFallback,AppLoading,Button}.tsx
    ├── components/layout/{AppShell,NotFoundPage,FoundationCheckPage}.tsx
    ├── routes/moduleRoutes.ts, routes/router.tsx
    └── modules/
        ├── README.md
        ├── auth/                  ← P1-FE-02, fully implemented
        │   ├── index.ts
        │   ├── routes.tsx
        │   ├── types/auth.ts
        │   ├── services/authApi.ts
        │   ├── hooks/{useLogin,loginValidation,useAuthTranslation}.ts
        │   ├── translations/{ar,en}.ts
        │   ├── components/{LoginForm,PinInput}.tsx
        │   └── pages/{LoginPage,LogoutPage,auth.css}
        ├── dashboard/routes.tsx   ← empty skeleton only, no implementation
        ├── orders/routes.tsx      ← empty skeleton only, no implementation
        ├── menu/routes.tsx        ← empty skeleton only, no implementation
        └── kitchen/routes.tsx     ← empty skeleton only, no implementation
```

`node_modules/`, `dist/`, any `.env`/`.env.local`, and `.git/` are
deliberately excluded — see "Integration instructions" below to regenerate
them locally.

## Validation

All four commands were re-run immediately before packaging this archive,
against this exact file set:

| Command | Result |
|---|---|
| `npm install` | ✅ succeeded — "up to date, audited 35 packages", 0 vulnerabilities |
| `npx tsc -b` (strict: `strict`, `noImplicitOverride`, `noUncheckedIndexedAccess`) | ✅ clean, no output, exit 0 |
| `npm run build` | ✅ succeeded — 55 modules transformed, `dist/index.html` 0.49 kB, `dist/assets/index-*.css` 3.91 kB, `dist/assets/index-*.js` 325.31 kB (102.83 kB gzipped), built in ~0.5s |
| `npm run lint` (oxlint) | ✅ "Found 3 warnings and 0 errors" — all 3 are pre-existing `react(only-export-components)` fast-refresh notices from the foundation (`LocaleContext.tsx` ×2, `AuthContext.tsx` ×1) for exporting a non-component helper/hook alongside a provider component in the same file; harmless, none are new, none are errors |

`dist/` was deleted after the build check and is not included in this archive.

## Auth implementation

- **PIN-based login** for both actors defined in the contract — **Owner**
  and **Cashier** — no client-side role picker; role comes from the server
  in the login response's `user` object.
- **`POST /api/v1/auth/login`** implemented as a standalone request in
  `modules/auth/services/authApi.ts`, deliberately **not** routed through
  the shared `src/api/client.ts` helpers, because
  `docs/contracts/api/api-contract.md` documents this endpoint as exempt
  from the standard `{ data: ... }` success envelope those helpers assume.
  Error handling still reuses the shared `ApiError`/`ApiTransportError`
  types.
- **JWT handling**: on success, `{ access_token, user }` is handed to the
  shared `AuthContext.setSession`, which persists the token via
  `auth/tokenStorage.ts` (localStorage, with an in-memory fallback if
  unavailable) and updates React state. The PIN itself is never persisted
  or logged — only the resulting token is stored.
- **AuthContext**: shared session boundary (`session`, `isAuthenticated`,
  `setSession`, `logout`) — nothing about it was changed or duplicated by
  the auth module.
- **Logout**: `modules/auth/pages/LogoutPage.tsx`, registered at `/logout`
  behind the shared `<ProtectedRoute>`, calls `AuthContext.logout()`
  (client-side token discard — no server-side blacklist call, matching the
  contract's MVP note) and redirects to `/login`.
- **Arabic / English**: Arabic is the default locale; module-local
  translation files (`modules/auth/translations/{ar,en}.ts`) are complete
  for every string the login/logout UI uses — no mixed-language or
  placeholder text.
- **RTL / LTR**: driven by the shared `LocaleContext`
  (`<html dir/lang>` sync); the PIN field is explicitly forced LTR even
  inside an RTL form, matching the numbers/money bidi convention in
  `docs/contracts/localization-contract.md`.
- **Validation**: client-side only (non-empty username; PIN digits-only,
  4–8 length) as a UI guardrail — explicitly **not** authoritative, since
  the contract itself flags PIN length as "a recommendation, confirm with
  product before launch" rather than a settled rule. Submit is disabled
  while a request is in flight.

## Known limitations

**No real backend exists yet**, so:

- Every login attempt against this build will fail at the network layer —
  there is nothing listening at `VITE_API_BASE_URL`. Loading → error state
  transitions were verified by code path and by a dev-server smoke test,
  not by a real 401/200 response.
- There is **no documented error `code`** in `docs/contracts/error-contract.md`
  for "invalid username/PIN." The UI shows the server's `message` field
  as-is for a proper error response (per the API contract, this field is
  meant to be end-user-displayable and server-localized) and falls back to
  a local generic translation only when there's no server response at all
  (network/transport failure). If the backend team defines a specific error
  code for this case later, the UI can be tightened to switch on it.
- `docs/contracts/auth-contract.md` documents the login request body as
  `{ "user_id" or "username", "pin" }` — literally an either/or, not a
  settled field name. This implementation sends `{ username, pin }`. If the
  real backend expects `user_id` instead, only two files need to change:
  `modules/auth/types/auth.ts` and `modules/auth/services/authApi.ts`.
- `src/api/client.ts` (shared, frozen) does not send an `Accept-Language`
  header on any request, even though
  `docs/contracts/localization-contract.md` relies on it for server-side
  message localization. The auth module works around this locally for its
  one login call only. This will likely affect every other module's API
  calls too once a backend exists — worth raising as an integration
  request against the shared client rather than patching it unilaterally.
- No session rehydration on page reload: if a token is already in
  `localStorage` from a previous session, refreshing the page does not
  currently restore `isAuthenticated` (there's no `GET /auth/me`-equivalent
  documented yet to re-fetch the user). A fresh page load always starts
  logged out until a new login completes.
- `dashboard/`, `orders/`, `menu/`, and `kitchen/` module directories exist
  only as empty route skeletons from the foundation phase — no screens, no
  business logic. `cashier/`, `inventory/`, `delivery/`, `expenses/`,
  `reports/`, and `settings/` (Person 2's modules) do not exist at all in
  this archive.

## Integration instructions

1. Extract this archive from inside your local repo root, e.g.:
   ```
   cd D:\projects\restaurant\restraunt
   tar -xzf restaurant-frontend-foundation-auth.tar.gz
   ```
   This creates/overwrites `D:\projects\restaurant\restraunt\frontend\` and
   places `HANDOFF.md` at `D:\projects\restaurant\restraunt\HANDOFF.md`.
2. `cd frontend`
3. `npm install`
4. `cp .env.example .env` and adjust `VITE_API_BASE_URL` once a backend
   exists (there isn't one yet, so the default placeholder is fine for now
   — the app will run, but login calls will fail to connect).
5. `npm run dev` — starts the Vite dev server. Visit `/` (foundation check
   page), `/login` (the real login screen), and `/logout` (redirects to
   `/login` after clearing any session — requires being "logged in" first,
   which isn't possible without a backend yet, so this route will simply
   bounce you to `/login`).
6. `npm run build` / `npx tsc -b` / `npm run lint` to reproduce the
   validation results above at any time.

If your local repo is a git checkout of the same history, you can instead
(or additionally) fetch/merge the `person1/frontend` branch directly to get
the actual commits `8c4d158` and `52e2076` with full history, rather than
relying on this archive's flat file snapshot.

## Ownership confirmation

```
No Person 2 modules included.
No backend files included.
No unrelated production changes included.
```
