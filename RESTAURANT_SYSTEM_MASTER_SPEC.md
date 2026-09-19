You are responsible for implementing **PHASE 00 — ARCHITECTURE & TECHNICAL CONTRACTS** of this repository.

Repository:
`eyad357/restraunt`

Current branch:
`phase-00-foundation`

IMPORTANT:
Before doing anything, inspect the entire repository and read:

`RESTAURANT_SYSTEM_MASTER_SPEC.md`

This file is the SINGLE SOURCE OF TRUTH for the project.

Do NOT start building the frontend.
Do NOT start building the backend.
Do NOT create mock application screens.
Do NOT implement business features yet.

Your job is to convert the Master Spec into a concrete, implementation-ready technical contract that two developers can use independently without creating incompatible code.

## PHASE 00 OBJECTIVE

Create the complete technical foundation/contracts for the Restaurant Management System.

The result must define:

1. System architecture
2. Module boundaries
3. Ownership boundaries
4. Shared entities
5. Enums
6. TypeScript contracts
7. API conventions
8. Database/domain relationships
9. Error format
10. Pagination/filter conventions
11. Authentication/session contracts
12. Branch context
13. Money/Decimal rules
14. Order lifecycle
15. Payment lifecycle
16. Cashier shift lifecycle
17. Inventory lifecycle
18. Delivery lifecycle
19. Kitchen lifecycle
20. Printing abstraction
21. Notification contracts
22. Audit-log contracts
23. Reporting contracts
24. Localization/RTL conventions
25. Offline-readiness rules
26. Testing conventions
27. Git/integration rules
28. Clear boundaries between Person 1 and Person 2

## IMPORTANT ARCHITECTURAL RULES

The project is a MODULAR MONOLITH.

Do NOT design microservices.

Frontend:

* React
* TypeScript
* RTL-first
* Arabic + English
* Arabic is the primary UI language
* EGP only
* Strong typing

Backend:

* FastAPI
* Python
* PostgreSQL
* SQLAlchemy
* JWT/session-based authentication

Financial values:

* PostgreSQL NUMERIC/Decimal
* NEVER use floating point for money

Authentication:

* Owner
* Cashier

PINs must never be stored in plaintext.

Drivers are operational actors for delivery and driver performance.
They are NOT required to become authenticated system users in MVP.

Customers are NOT a CRM domain.
Do not create unnecessary customer accounts, loyalty, customer history, or marketing entities.

Printing must be behind an abstraction.
Business logic must NOT depend directly on printer implementation.

No permanent fake/static production data.

Temporary mocks are allowed later only when they implement the exact same contracts as the real backend.

## CORE ORDER MODEL

The contract must clearly distinguish:

Order Source:

* CASHIER
* PHONE
* ONLINE

Order Type:

* TAKEAWAY
* PICKUP
* DELIVERY
* PRE_ORDER

An order must support:

* branch
* source
* type
* status
* items
* item variants
* item modifiers
* item notes
* order notes
* payment(s)
* totals
* timestamps
* cashier/operator
* optional delivery information
* kitchen state

Product structure:

Category
→ Product
→ Variant
→ Modifier

Examples:

Product:
Burger

Variant:
Single / Double / Triple

Modifiers:
Extra cheese
No onion
Extra sauce

The system must preserve the selected configuration of every order item.

## PAYMENT CONTRACT

Support:

* CASH
* CARD
* WALLET
* INSTAPAY
* MIXED

Mixed payment must support multiple payment components for one order.

Do not implement a complex accounting engine.

## CASHIER SHIFT CONTRACT

Define:

OPEN
→ ACTIVE
→ CLOSING
→ CLOSED

The closing calculation must support:

Opening cash

* cash sales

- cash expenses
  = expected cash

Then compare expected cash against actual counted cash and record the difference.

## DELIVERY CONTRACT

Keep delivery intentionally simple.

No:

* GPS
* delivery zones
* complex routing
* fleet management
* driver accounts
* advanced logistics

Support:

* driver assignment
* delivery status
* amount expected from driver
* delivered/returned state
* driver performance metrics

Delivery cash must be reflected in end-of-day reconciliation.

## INVENTORY CONTRACT

Simple inventory only.

Support:

* inventory item
* current quantity
* unit
* minimum/low-stock threshold
* stock adjustment
* low-stock state
* inventory value

Do NOT create:

* supplier management
* purchase orders
* procurement workflows
* complex warehouse management
* full recipe/BOM engine

## EXPENSE CONTRACT

Simple expense records.

Example:
Bread — 20 EGP

Expenses must be reflected in:

* cashier closing
* reports
* profit calculation

## REPORTING CONTRACT

Define contracts for:

* Daily Sales
* Weekly Sales
* Monthly Sales
* Top Products
* Least Selling Products
* Food Cost
* Inventory Value
* Expenses
* Profit
* Cashier Performance
* Driver Performance
* Kitchen Performance

Important:
The MVP must not invent a complex accounting/COGS system.

If Food Cost cannot be calculated reliably without recipe/BOM data, define the contract as extensible and explicitly document what is available in MVP rather than inventing fake calculations.

## KITCHEN CONTRACT

No complex KDS is required.

Support:

Order received
→ Preparing
→ Ready
→ Completed

Kitchen performance should be measurable from timestamps.

Kitchen notes must include:

* order notes
* item notes
* selected modifiers/configuration

## NOTIFICATIONS

MVP notification types:

* ORDER_READY
* LOW_STOCK

Keep notifications simple.

## PRINTING

Define a PrintService abstraction supporting:

* Customer receipt
* Kitchen ticket
* Delivery receipt
* End-of-day report
* Cashier closing

Target formats:

* Thermal 58mm
* Thermal 80mm
* A4

Do not tie domain logic to a specific printer library.

## AUDIT LOG

Define an audit contract covering at minimum:

* login
* order created
* order cancelled
* payment recorded
* expense created
* inventory updated
* menu/product changed
* price changed
* settings changed
* shift opened
* shift closed

Include actor, branch, timestamp, action, entity, entity ID, and relevant metadata.

## MULTI-BRANCH

The architecture must be multi-branch from day one.

Operational data such as:

* orders
* inventory
* expenses
* cashier shifts
* kitchen activity
* delivery
* reports

must be branch-aware.

## OFFLINE READINESS

Do not build a complicated distributed synchronization system in Phase 00.

However, the contracts must be designed so the core cashier/order workflow can later operate during temporary internet loss.

Define:

* local persistence boundary
* operation identifiers/idempotency expectations
* sync-ready API conventions

Do not implement the offline engine yet.

## DATABASE RULES

Define canonical entities and relationships.

Avoid duplicate representations of the same domain entity.

All IDs should use UUIDs unless a documented reason exists otherwise.

Use timestamps consistently.

Money must use Decimal/NUMERIC.

Foreign-key relationships must be explicit.

Branch ownership must be explicit for operational entities.

## TYPESCRIPT CONTRACTS

Create shared TypeScript domain contracts/interfaces for the major domains.

They must be implementation-neutral.

Do NOT copy backend ORM models directly into frontend types.

## API CONTRACT

Define:

* URL/versioning convention
* request format
* response format
* error format
* pagination
* filtering
* sorting
* authentication headers/session behavior
* idempotency expectations where required
* branch context

Use consistent naming.

## MODULE OWNERSHIP

Person 1 owns:

* Authentication
* Branches
* Menu
* Categories
* Products
* Variants
* Modifiers
* Orders
* Payments
* Kitchen
* Printing

Person 2 owns:

* Dashboard
* Inventory
* Expenses
* Cashier
* Delivery
* Reports
* Audit
* Notifications
* Settings

Shared:

* Core infrastructure
* Shared types
* API conventions
* Localization
* UI primitives
* Authentication contract
* Branch context
* Error format
* Audit conventions
* Testing infrastructure

Clearly document which files/directories belong to which owner.

## REQUIRED PHASE 00 OUTPUT

Create a clean structure similar to:

docs/
contracts/
api/
schemas/
enums/
events/
examples/

frontend/
contracts/

backend/
contracts/

The exact structure may be adjusted if you have a stronger reason, but document the decision.

Create the necessary contract files.

At minimum, provide:

* entity/domain contract
* enum contract
* API contract
* error contract
* authentication contract
* branch context contract
* order lifecycle contract
* payment contract
* cashier shift contract
* inventory contract
* delivery contract
* kitchen contract
* printing contract
* notification contract
* audit contract
* reporting contract
* TypeScript shared contract definitions
* database relationship/domain map
* module ownership map

## SINGLE SOURCE OF TRUTH RULE

Do NOT create another competing master specification.

`RESTAURANT_SYSTEM_MASTER_SPEC.md` remains the project-level requirements authority.

Phase 00 documents are technical contracts derived from it.

If you discover a requirement conflict or ambiguity:

1. Do not silently invent a business rule.
2. Document the ambiguity.
3. Prefer the least-complex MVP-compatible interpretation.
4. Mark it clearly as a decision requiring confirmation.

## QUALITY REQUIREMENTS

Before finishing:

* inspect every created file
* check for duplicate entities
* check naming consistency
* check enum consistency
* check branch scoping
* check money types
* check order/payment relationships
* check ownership boundaries
* check that Person 1 and Person 2 can work independently
* check that contracts do not depend on implementation details
* validate JSON/YAML where applicable
* run available static validation
* do not leave placeholder TODOs pretending to be completed contracts

Do not modify or delete the Master Spec unless absolutely necessary.
If a requirement needs clarification, document it instead.

## GIT RULES

Work ONLY on:

`phase-00-foundation`

Do not push to `main`.

Do not create unrelated application code.

At the end provide:

1. Exact files created/modified
2. Architecture summary
3. Contract summary
4. Ownership summary
5. Any unresolved decisions
6. Validation/test results
7. Recommended next phase

Do not merely describe what should be done.
Actually create the Phase 00 files in the repository.
