# HANDOFF.md

## Phase
P1-FE-05 — Menu Frontend Module

## Owner
Person 1

## Module
Menu (`frontend/src/modules/menu/`)

## Branch
`person1/frontend`

## Implemented

A production-grade Menu management workspace, protected by the existing
auth mechanism, managing the full documented hierarchy:

- **`/menu`** — redirects to `/menu/categories` (Category is the top of
  the hierarchy, the natural landing page).
- **`/menu/categories`** — list + create/edit form (name AR/EN, sort
  order, active/inactive).
- **`/menu/products`** — list with a category filter + create/edit form
  (category association, base price, active/inactive).
- **`/menu/products/:productId`** — a single product's Variant and
  Modifier management (both strictly product-scoped per the contract,
  so no standalone `/menu/variants` or `/menu/modifiers` route exists —
  a deliberate, documented deviation from the task's own "suggested
  ONLY if consistent with contracts" route list).

Every list/form has independent loading/success/empty/error+retry and a
submitting state that blocks duplicate submission.

## Files added/modified

**New** (all under `frontend/src/modules/menu/`):
```
index.ts, routes.tsx
types/menu.ts
services/menuService.ts
hooks/{useAsyncData,useMutation,useMenuQueries,useMenuMutations,
       useMenuTranslation}.ts
translations/{en,ar}.ts
components/{SectionState,ActiveBadge,MenuNav,MenuUnavailable,
            CategoryForm,CategoryList,ProductForm,ProductList,
            VariantForm,VariantList,ModifierForm,ModifierList}.tsx
pages/{CategoriesPage,ProductsPage,ProductDetailsPage,menu.css}
```

**Modified:**
- `frontend/src/modules/menu/routes.tsx` — real route registration (was
  an empty skeleton).
- `INTEGRATION_REQUEST.md` — extended with 7 new items (12–18).

No `backend/`, `docs/`, `frontend/contracts/`, Orders, Dashboard, Auth,
Kitchen/Cashier/Inventory/Delivery/Expenses/Reports/Settings module, or
shared foundation file (bootstrap, router, API client, AuthContext,
ProtectedRoute, LocaleContext, shared UI primitives, global theme,
environment config, money utility) was touched.

## Shared files touched

None. `src/money/formatMoney.ts` is used (for displaying `base_price`,
variant `price`, and modifier `price_delta`) but not modified.

## Dependencies

None added.

## Contract dependencies

- `frontend/contracts/entities.ts` — `Category`, `Product`, `Variant`,
  `Modifier` shapes, used exactly as declared, nothing added.
- `docs/contracts/domain-entities.md` — the prose description of each
  entity's fields and relationships (e.g. "variant price overrides base
  price, does not add to it"; "exactly one variant should be default").
- `docs/contracts/api/api-contract.md` — generic REST/pagination
  envelope conventions (used only by the isolated experimental adapter,
  never the shipped default).
- `src/money/formatMoney.ts` — for all price display.

## API assumptions (see `INTEGRATION_REQUEST.md` items 12–17 for full detail)

1. **No menu-management endpoint exists at all**, read or write —
   confirmed by grepping the entire `docs/` tree. The shipped default
   never calls any endpoint; an isolated, opt-in-only experimental
   adapter (proposed REST shapes, unconfirmed) exists solely for this
   phase's own QA.
2. Orders' read-only `MenuCatalogService` and Menu's `MenuService` are
   intentionally separate, module-local interfaces (not a duplication
   bug) — unifying them would require modifying Orders, out of this
   phase's scope.
3. `Variant` has no `is_active` field in the canonical contract (unlike
   Category/Product/Modifier) — no deactivate control was built for it,
   matching the contract exactly.
4. No documented way to atomically switch a product's default variant —
   the form lets an operator flag one variant default without
   auto-unsetting others.
5. No documented role restriction for menu management — both Owner and
   Cashier have equal access, since none is documented (a decision, not
   an invented gate).
6. Category/Product/Variant/Modifier are confirmed **not** branch-scoped
   per `domain-entities.md`'s own field tables — no branch header/param
   is ever sent.

## Known limitations

- **No real backend exists.** All QA used a throwaway, non-shipped mock
  server plus the isolated experimental adapter — actual production API
  integration is untested by construction.
- **Menu management is completely unusable against a real backend
  today** — every page shows the honest "unavailable" state by default,
  verified explicitly in QA. This is not a bug; it's the correct,
  disclosed behavior given the confirmed absence of any endpoint.
- Once a real menu API exists, Orders' own catalog-browsing adapter
  (`modules/orders/services/menuCatalogService.ts`) still needs to be
  pointed at it separately — this phase did not touch Orders.
- A product's "exactly one default variant" rule is not enforced by
  this frontend (see API assumptions #4) — relies entirely on whatever
  the eventual backend does.
- No session rehydration on page reload (a P1-FE-02 limitation,
  unchanged).

## Validation

| Command | Result |
|---|---|
| `npx tsc -b` (strict) | ✅ clean, no output |
| `npm run build` | ✅ succeeds — 134 modules transformed |
| `npm run lint` (oxlint) | ✅ 0 errors; same 3 pre-existing foundation warnings, none new |

**Interactive/visual QA** (Playwright, headless Chromium, against a
throwaway mock backend — not part of this archive or the repo):

- Unauthenticated `/menu` → redirects to `/login`; successful login
  correctly returns to `/menu/categories`.
- Category create and edit, both verified working with no console
  errors, in both Arabic (RTL) and English (LTR); no horizontal overflow
  at 1280px.
- Product creation with category association; empty-required-field
  validation correctly blocked submission before any request was sent.
- Product details: variant creation (price correctly shown as
  overriding, not adding to, the base price) and modifier creation
  (price impact correctly shown with a `+` sign), both updating the UI
  immediately.
- Client-side navigation between Categories and Products via the new
  in-module nav bar.
- **Explicitly verified the shipped default** (no experimental flag
  set): every Menu page shows the honest "menu management isn't
  available yet" notice — proving nothing fake ships by default.

## Integration instructions

1. Extract this archive into your local repo root:
   `frontend/src/modules/menu/` and `INTEGRATION_REQUEST.md` (overwrite
   — it now includes the P1-FE-03, P1-FE-04, and P1-FE-05 items
   together).
2. `cd frontend && npm install` (no new dependencies).
3. `npm run dev`, sign in, and visit `/menu`. By default you'll see the
   honest "unavailable" notice — this is expected until a real
   menu-management API exists.
4. To exercise the CRUD screens' mechanics without a backend, set
   `VITE_MENU_EXPERIMENTAL_API=1` in a local `.env` against a test
   server implementing the proposed (unconfirmed) REST shapes described
   in `INTEGRATION_REQUEST.md` item 12 — never do this in a shipped/
   production build.

## Commit

`2c62f32` — "feat(frontend): implement restaurant menu" — on branch
`person1/frontend`. Not merged into `main`.

Builds on: `8c4d158` (P1-FE-01A foundation), `52e2076` (P1-FE-02 auth),
`01b8d56` (P1-FE-03 dashboard), `4e8991e` (P1-FE-04 orders).

## Person 2 files modified

NO
