# Offline Readiness Contract

Status: STABLE (Phase 00) — defines conventions only; no offline engine built yet

Owner: Shared

## Principle

Phase 00 does not build sync/offline infrastructure. It ensures nothing in the
contracts above would need to change shape when that infrastructure is added
later — i.e., today's API is already "offline-ready" in convention, even though
nothing consumes that readiness yet.

## Local persistence boundary

The workflows expected to need offline continuity are the cashier/order flow
specifically: creating an `Order`, adding `OrderItem`s, recording a
`PaymentComponent`. Everything else (reports, settings, inventory management) is
assumed to require connectivity and is **not** in the offline boundary for Phase 00
or its eventual successor phase — narrowing scope to what the brief actually asks
for ("core cashier/order workflow").

## Operation identifiers & idempotency

Every offline-eligible write already carries a client-generated
`Idempotency-Key` per `api-contract.md`. This is the same mechanism that will let a
future offline client queue an order locally (keyed by a UUID generated on-device)
and safely replay it once connectivity returns — replays with the same key return
the original result instead of double-creating the order. No new mechanism is
needed at sync time; this contract is written so Phase 00's idempotency convention
already **is** the sync-safety convention.

## Sync-ready API conventions

- Every entity has `created_at`/`updated_at` (see domain-entities.md conventions)
  so a future sync process can diff "what changed since I was last online" using
  `updated_at_from` filters — already expressible with the standard filtering
  convention in `api-contract.md` (`?updated_at_from=...`).
- IDs are client-generatable UUIDs (not server auto-increment integers) — see
  domain-entities.md — specifically so an offline client can create an `Order.id`
  locally before ever reaching the server, then submit it with its `Idempotency-Key`
  once online, without an ID-collision risk or a server round-trip just to get an
  ID.

## Explicitly deferred

- Local storage technology (IndexedDB, SQLite, etc.) — frontend implementation
  detail for a later phase.
- Conflict resolution policy for concurrent edits made offline on two terminals —
  not applicable yet since the offline engine itself doesn't exist; flagged as a
  necessary design question for whichever phase builds the engine, not answered
  here to avoid inventing an untested policy.
