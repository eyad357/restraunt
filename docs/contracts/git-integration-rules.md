# Git & Integration Rules

Status: STABLE (Phase 00)
Owner: Shared

## Branching

- Phase 00 work lives on `phase-00-foundation`. Do not push directly to `main`;
  merge via pull request once Phase 00 is reviewed and approved.
- From Phase 01 onward, each developer works on their own feature branches off
  `main` (post-merge), scoped to the modules in `ownership-map.md`
  (e.g. `feature/p1-orders-crud`, `feature/p2-inventory-crud`).

## Contract changes after Phase 00

- Any change to a file under `docs/contracts/` after Phase 00 is merged requires
  review from **both** developers, since both build against these files
  independently — a unilateral contract change can silently break the other
  person's in-progress work.
- Changing `docs/contracts/enums/enums.md` requires updating
  `backend/contracts/enums.py` and `frontend/contracts/enums.ts` in the **same**
  commit — never let the three drift, per `testing-conventions.md`'s contract
  test.

## PR discipline

- A PR that touches only Person 1's owned directories (`ownership-map.md`) does
  not require Person 2's review, and vice versa, **except** when it also touches
  `docs/contracts/`, `backend/contracts/`, or `frontend/contracts/` — those always
  need both.
- No PR merges with a failing contract test (enum drift, state-machine transition
  test) — these are cheap to run and catch cross-module breakage before it reaches
  `main`.

## Commit hygiene

- Commit messages reference which module/contract they touch, e.g.
  `feat(orders): implement PLACED -> PREPARING transition` or
  `docs(contracts): clarify delivery cash settlement`.
- Phase 00 commits in this repository are grouped by concern (enums, entities, API
  conventions, per-domain lifecycle contracts, ownership/database maps, generated
  language files, examples) rather than one monolithic commit, so history stays
  reviewable.
