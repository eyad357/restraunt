You are responsible for implementing PHASE 00 — ARCHITECTURE & TECHNICAL CONTRACTS of this repository.

Repository:
eyad357/restraunt

Current branch:
phase-00-foundation

IMPORTANT:
Before doing anything, inspect the entire repository and read:

RESTAURANT_SYSTEM_MASTER_SPEC.md

This file is the SINGLE SOURCE OF TRUTH for the project.

Do NOT start building the frontend.
Do NOT start building the backend.
Do NOT create mock application screens.
Do NOT implement business features yet.

Your job is to convert the Master Spec into a concrete, implementation-ready technical contract that two developers can use independently without creating incompatible code.

PHASE 00 OBJECTIVE

Create the complete technical foundation/contracts for the Restaurant Management System.

The result must define:

System architecture

Module boundaries

Ownership boundaries

Shared entities

Enums

TypeScript contracts

API conventions

Database/domain relationships

Error format

Pagination/filter conventions

Authentication/session contracts

Branch context

Money/Decimal rules

Order lifecycle

Payment lifecycle

Cashier shift lifecycle

Inventory lifecycle

Delivery lifecycle

Kitchen lifecycle

Printing abstraction

Notification contracts

Audit-log contracts

Reporting contracts

Localization/RTL conventions

Offline-readiness rules

Testing conventions

Git/integration rules

Clear boundaries between Person 1 and Person 2

IMPORTANT ARCHITECTURAL RULES

The project is a MODULAR MONOLITH.

Do NOT design microservices.

Frontend:

React

TypeScript

RTL-first

Arabic + English

Arabic is the primary UI language

EGP only

Strong typing

Backend:

FastAPI

Python

PostgreSQL

SQLAlchemy

JWT/session-based authentication

Financial values:

PostgreSQL NUMERIC/Decimal

NEVER use floating point for money

Authentication:

Owner

Cashier

PINs must never be stored in plaintext.

Drivers are operational actors for delivery and driver performance.
They are NOT required to become authenticated system users in MVP.

Customers are NOT a CRM domain.
Do not create unnecessary customer accounts, loyalty, customer history, or marketing entities.

Printing must be behind an abstraction.
Business logic must NOT depend directly on printer implementation.

No permanent fake/static production data.

Temporary mocks are allowed later only when they implement the exact same contracts as the real backend.

CORE ORDER MODEL

The contract must clearly distinguish:

Order Source:

CASHIER

PHONE

ONLINE

Order Type:

TAKEAWAY

PICKUP

DELIVERY

PRE_ORDER

An order must support:

branch

source

type

status

items

item variants

item modifiers

item notes

order notes

payment(s)

totals

timestamps

cashier/operator

optional delivery information

kitchen state

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

PAYMENT CONTRACT

Support:

CASH

CARD

WALLET

INSTAPAY

MIXED

Mixed payment must support multiple payment components for one order.

Do not implement a complex accounting engine.

CASHIER SHIFT CONTRACT

Define:

OPEN
→ ACTIVE
→ CLOSING
→ CLOSED

The closing calculation must support:

Opening cash

cash sales

cash expenses
= expected cash

Then compare expected cash against actual counted cash and record the difference.

DELIVERY CONTRACT

Keep delivery intentionally simple.

No:

GPS

delivery zones

complex routing

fleet management

driver accounts

advanced logistics

Support:

driver assignment

delivery status

amount expected from driver

delivered/returned state

driver performance metrics

Delivery cash must be reflected in end-of-day reconciliation.

INVENTORY CONTRACT

Simple inventory only.

Support:

inventory item

current quantity

unit

minimum/low-stock threshold

stock adjustment

low-stock state

inventory value

Do NOT create:

supplier management

purchase orders

procurement workflows

complex warehouse management

full recipe/BOM engine

EXPENSE CONTRACT

Simple expense records.

Example:
Bread — 20 EGP

Expenses must be reflected in:

cashier closing

reports

profit calculation

REPORTING CONTRACT

Define contracts for:

Daily Sales

Weekly Sales

Monthly Sales

Top Products

Least Selling Products

Food Cost

Inventory Value

Expenses

Profit

Cashier Performance

Driver Performance

Kitchen Performance

Important:
The MVP must not invent a complex accounting/COGS system.

If Food Cost cannot be calculated reliably without recipe/BOM data, define the contract as extensible and explicitly document what is available in MVP rather than inventing fake calculations.

KITCHEN CONTRACT

No complex KDS is required.

Support:

Order received
→ Preparing
→ Ready
→ Completed

Kitchen performance should be measurable from timestamps.

Kitchen notes must include:

order notes

item notes

selected modifiers/configuration

NOTIFICATIONS

MVP notification types:

ORDER_READY

LOW_STOCK

Keep notifications simple.

PRINTING

Define a PrintService abstraction supporting:

Customer receipt

Kitchen ticket

Delivery receipt

End-of-day report

Cashier closing

Target formats:

Thermal 58mm

Thermal 80mm

A4

Do not tie domain logic to a specific printer library.

AUDIT LOG

Define an audit contract covering at minimum:

login

order created

order cancelled

payment recorded

expense created

inventory updated

menu/product changed

price changed

settings changed

shift opened

shift closed

Include actor, branch, timestamp, action, entity, entity ID, and relevant metadata.

MULTI-BRANCH

The architecture must be multi-branch from day one.

Operational data such as:

orders

inventory

expenses

cashier shifts

kitchen activity

delivery

reports

must be branch-aware.

OFFLINE READINESS

Do not build a complicated distributed synchronization system in Phase 00.

However, the contracts must be designed so the core cashier/order workflow can later operate during temporary internet loss.

Define:

local persistence boundary

operation identifiers/idempotency expectations

sync-ready API conventions

Do not implement the offline engine yet.

DATABASE RULES

Define canonical entities and relationships.

Avoid duplicate representations of the same domain entity.

All IDs should use UUIDs unless a documented reason exists otherwise.

Use timestamps consistently.

Money must use Decimal/NUMERIC.

Foreign-key relationships must be explicit.

Branch ownership must be explicit for operational entities.

TYPESCRIPT CONTRACTS

Create shared TypeScript domain contracts/interfaces for the major domains.

They must be implementation-neutral.

Do NOT copy backend ORM models directly into frontend types.

API CONTRACT

Define:

URL/versioning convention

request format

response format

error format

pagination

filtering

sorting

authentication headers/session behavior

idempotency expectations where required

branch context

Use consistent naming.

MODULE OWNERSHIP

Person 1 owns:

Authentication

Branches

Menu

Categories

Products

Variants

Modifiers

Orders

Payments

Kitchen

Printing

Person 2 owns:

Dashboard

Inventory

Expenses

Cashier

Delivery

Reports

Audit

Notifications

Settings

Shared:

Core infrastructure

Shared types

API conventions

Localization

UI primitives

Authentication contract

Branch context

Error format

Audit conventions

Testing infrastructure

Clearly document which files/directories belong to which owner.

PARALLEL FRONTEND DEVELOPMENT & HANDOFF RULES

These rules are mandatory for all parallel development phases.

1. Frontend-first development order

The project should be developed in clear stages:

Frontend foundation and UI modules

Backend foundation and APIs

Frontend/backend integration

Integration testing and end-to-end validation

Offline-readiness implementation

Electron/Windows packaging and commercial hardening

Do not mix large unrelated phases unless explicitly approved.

2. Frontend module ownership

During the initial frontend phase:

Person 1 owns:

Login

Dashboard

Orders

Menu

Categories

Products

Variants

Modifiers

Kitchen

Person 2 owns:

Cashier

Inventory

Delivery

Expenses

Reports

Settings

The existing domain ownership in the MODULE OWNERSHIP section remains the authoritative ownership for the complete application and backend/domain implementation.

3. No cross-owner modifications

A developer MUST NOT modify files or modules owned by the other developer.

If a shared file must change, create an explicit integration request describing the file path, requested change, reason, affected module, and compatibility impact. The integration owner applies the shared-file change after review.

4. Shared foundation is frozen during parallel module work

After the shared frontend foundation is approved, these areas are treated as shared/frozen:

application bootstrap

routing infrastructure

shared UI primitives

shared API client infrastructure

localization/i18n infrastructure

shared types/contracts

shared utilities

global styling/theme infrastructure

authentication/branch context infrastructure

Developers may consume these components but must not independently redesign them. Required changes use the integration-request process.

5. Module directory isolation

Frontend modules MUST be physically separated, for example:

frontend/src/modules/
auth/
dashboard/
orders/
menu/
kitchen/
cashier/
inventory/
delivery/
expenses/
reports/
settings/

Module-specific business logic must stay inside the owning module and not be placed into shared directories.

6. Shared contracts remain authoritative

Both developers MUST use:

RESTAURANT_SYSTEM_MASTER_SPEC.md

docs/contracts/**

frontend/contracts/**

backend/contracts/**

Do not redefine existing entities, enums, API shapes, or business rules inside a module. Temporary frontend mocks are allowed only when they implement the exact shared contracts and are isolated from production data access.

7. Tarball handoff rule

At the end of each parallel task, each developer MUST produce a tar.gz handoff package. Recommended structure:

handoffs/
person1/
person1-frontend-<phase>.tar.gz
person2/
person2-frontend-<phase>.tar.gz

The archive MUST contain only files owned or newly created by that developer, plus explicitly documented integration files if required. Do NOT package the entire repository unless explicitly required.

Archives MUST NOT contain or overwrite .git/, another developer's modules, unrelated project files, build artifacts, node_modules/, Python virtual environments, or local secrets/.env files.

8. Handoff manifest

Every tar.gz handoff MUST include HANDOFF.md stating:

developer/owner

phase

branch

files/directories included

files intentionally not included

dependencies on shared files

required integration steps

validation commands/results

known limitations

commit/hash if applicable

9. Integration safety

Never extract one developer's archive blindly over the entire repository. Integration must inspect archive contents, verify ownership, verify that no other owner's files are being replaced, extract only approved files, run validation, review git diff, and commit the integrated result. Unexpected files require stopping and reporting before integration.

10. Git isolation

Parallel work MUST use separate branches. Recommended frontend branches:

person1/frontend

person2/frontend

Developers must not push parallel work directly to main. Shared foundation changes are integrated separately before dependent module work begins.

11. Integration requests

When a module needs a change outside its ownership boundary, create INTEGRATION_REQUEST.md instead of directly modifying another owner's files.

12. No silent conflict resolution

If two implementations modify the same shared file or contract, do not silently choose one, overwrite the other, or delete functionality to make the build pass. Stop, document the conflict, and resolve it explicitly during integration.

13. Completion criteria for each frontend owner

A frontend owner is complete only when their modules build successfully, TypeScript validation passes, applicable tests pass, navigation works, RTL/Arabic behavior is verified, no forbidden cross-owner files were modified, temporary data follows shared contracts, HANDOFF.md is included, the tar.gz handoff is generated, and git diff contains only expected changes.

14. Backend follows the same isolation principle

When backend development begins, apply the same rules: explicit module ownership, no cross-owner modification, frozen shared infrastructure, authoritative shared contracts, tar.gz handoffs, and explicit integration. These isolation and handoff rules are project-wide and remain mandatory for future phases.

REQUIRED PHASE 00 OUTPUT

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

entity/domain contract

enum contract

API contract

error contract

authentication contract

branch context contract

order lifecycle contract

payment contract

cashier shift contract

inventory contract

delivery contract

kitchen contract

printing contract

notification contract

audit contract

reporting contract

TypeScript shared contract definitions

database relationship/domain map

module ownership map

SINGLE SOURCE OF TRUTH RULE

Do NOT create another competing master specification.

RESTAURANT_SYSTEM_MASTER_SPEC.md remains the project-level requirements authority.

Phase 00 documents are technical contracts derived from it.

If you discover a requirement conflict or ambiguity:

Do not silently invent a business rule.

Document the ambiguity.

Prefer the least-complex MVP-compatible interpretation.

Mark it clearly as a decision requiring confirmation.

QUALITY REQUIREMENTS

Before finishing:

inspect every created file

check for duplicate entities

check naming consistency

check enum consistency

check branch scoping

check money types

check order/payment relationships

check ownership boundaries

check that Person 1 and Person 2 can work independently

check that contracts do not depend on implementation details

validate JSON/YAML where applicable

run available static validation

do not leave placeholder TODOs pretending to be completed contracts

Do not modify or delete the Master Spec unless absolutely necessary.
If a requirement needs clarification, document it instead.

GIT RULES

Work ONLY on:

phase-00-foundation

Do not push to main.

Do not create unrelated application code.

At the end provide:

Exact files created/modified

Architecture summary

Contract summary

Ownership summary

Any unresolved decisions

Validation/test results

Recommended next phase

Do not merely describe what should be done.
Actually create the Phase 00 files in the repository.