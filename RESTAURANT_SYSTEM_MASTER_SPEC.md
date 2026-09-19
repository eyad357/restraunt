# SmartHorse — Phase B: Professional Dashboard Implementation

You are the implementation engineer for the SmartHorse frontend.

You are continuing from the existing SmartHorse Frontend Phase A implementation.

I am providing you with the current project ZIP. **Do not rebuild the project from scratch. Inspect the existing codebase first and continue from the current implementation.**

Your task is to implement **Phase B — Dashboard** using realistic Mock Data only.

---

# 1. SOURCE OF TRUTH

Before writing code:

1. Inspect the entire existing frontend structure.
2. Read the existing README and relevant documentation if available.
3. Inspect the current:

   * Layout
   * Sidebar
   * Topbar
   * Navigation
   * Design system
   * Components
   * Authentication UI
   * Routing
   * Styling
   * Mock services
   * Types
   * Tests
4. Preserve the architecture and conventions already established in Phase A.
5. Do not replace working Phase A code unnecessarily.

The existing implementation is the baseline.

If something already exists and can be reused, **reuse it instead of creating a duplicate implementation.**

---

# 2. CURRENT PHASE

We are now implementing:

## Phase B — Dashboard

The goal is to create a polished, professional, simple, user-friendly SmartHorse Dashboard using Mock Data.

The Dashboard should feel like a real production SaaS application even though the data is currently mocked.

The user should be able to understand the important Farm information quickly without feeling overwhelmed.

---

# 3. IMPORTANT SCOPE RULE

This phase is FRONTEND ONLY.

DO NOT implement:

* Backend
* ASP.NET Core
* Database
* PostgreSQL
* EF Core
* Redis
* JWT backend
* Real authentication
* Real authorization
* Real API calls
* API endpoints
* Database migrations
* AI
* Flutter
* Real-time infrastructure
* External services

Use Mock Data only.

However, structure the Dashboard so that the Mock Data can later be replaced with `/api/v1` services without redesigning the UI.

---

# 4. DESIGN GOAL

The Dashboard must be:

* Modern
* Professional
* Clean
* Simple
* Easy to understand
* Visually balanced
* Responsive
* Accessible
* Consistent with the existing SmartHorse design
* Suitable for a real horse/farm management SaaS product

Avoid:

* Excessive gradients
* Excessive animations
* Glassmorphism
* Huge shadows
* Too many colors
* Visual clutter
* Overly complicated charts
* Too many cards
* Tiny text
* Dense tables
* Decorative UI that does not provide useful information

The design should communicate:

**Professional farm management + modern SaaS + simplicity.**

---

# 5. DASHBOARD STRUCTURE

Create a complete Dashboard page.

A recommended structure is:

```text
Dashboard
│
├── Header
│   ├── Page title
│   ├── Short description
│   └── Optional Farm/Workspace selector
│
├── Summary Cards
│   ├── Total Horses
│   ├── Upcoming Visits
│   ├── Vaccinations
│   └── Pending Tasks
│
├── Main Dashboard Grid
│
│   ├── Horse Activity
│   │
│   └── Upcoming Tasks
│
├── Secondary Dashboard Grid
│
│   ├── Health Overview
│   │
│   └── Recent Notifications
│
└── Optional useful section
    └── Recent Horse Activity / Quick Actions
```

Do not blindly implement every section if it makes the UI crowded.

Use good UX judgment.

The Dashboard should prioritize the information that is most useful to the user.

---

# 6. DASHBOARD HEADER

Create a professional header.

Example:

```text
Dashboard

Good morning, Ahmed.
Here's what's happening at your farm today.
```

If the current application architecture supports a Farm/Workspace concept, add a subtle workspace selector.

Example:

```text
Green Valley Farm ▾
```

Do not invent complex farm functionality.

For now it can be Mock Data / visual only.

---

# 7. SUMMARY CARDS

Create polished summary cards.

Suggested cards:

### Total Horses

Example:

```text
42
Total Horses

+4.8%
vs last month
```

### Upcoming Visits

```text
5
Upcoming Visits

Next: Tomorrow
```

### Vaccinations

```text
8
Vaccinations

3 due this week
```

### Pending Tasks

```text
12
Pending Tasks

4 due today
```

Use realistic mock values.

Do not imply that these values come from a real backend.

Each card should have:

* Clear title
* Large readable value
* Optional supporting information
* Appropriate icon
* Optional trend/status
* Good spacing
* Good responsive behavior

Do not overload the cards.

---

# 8. HORSE ACTIVITY

Create a useful Horse Activity section.

It can use a chart if the existing project already has an approved chart library.

If a chart library is not installed:

* First inspect the project dependencies.
* Prefer an existing dependency if suitable.
* Do not introduce a large unnecessary library.

The chart should communicate useful information such as:

```text
Horse Activity

Mon   Tue   Wed   Thu   Fri   Sat   Sun
```

Possible metrics:

* Training sessions
* Horse activity
* Visits
* Performance/activity count

Use realistic Mock Data.

The chart must be:

* Easy to understand
* Responsive
* Visually clean
* Accessible
* Not overloaded with multiple datasets unless necessary

---

# 9. UPCOMING TASKS

Create an Upcoming Tasks section.

Example:

```text
Upcoming Tasks

Vaccination
Luna
Today · 10:00 AM

Veterinary Check
Thunder
Tomorrow · 9:30 AM

Training Session
Shadow
Tomorrow · 4:00 PM
```

Each task should have:

* Task type
* Horse/person/entity where appropriate
* Date/time
* Status
* Optional priority

Use subtle visual indicators.

Do not use excessive colors.

Possible statuses:

* Upcoming
* Due Today
* Overdue
* Completed

The Dashboard can display only the most important upcoming items.

Provide a clear action such as:

```text
View all
```

The action can remain UI-only for now if the destination functionality is not implemented.

---

# 10. HEALTH OVERVIEW

Create a simple Health Overview section.

Example metrics:

```text
Health Overview

Vaccinations       8
Medical Visits     5
Active Treatments  3
Follow-ups         2
```

You can use:

* Progress indicators
* Small statistics
* Simple visual breakdown

Keep it simple.

The user should understand the health status at a glance.

Do not invent medical claims.

This is UI Mock Data only.

---

# 11. RECENT NOTIFICATIONS

Create a Recent Notifications section.

Example:

```text
Recent Notifications

Vaccination reminder
Luna is due for vaccination
10 minutes ago

Veterinary appointment
Appointment scheduled for Thunder
1 hour ago

Training reminder
Shadow's training session starts at 4 PM
2 hours ago
```

Use realistic notification categories.

Keep the list visually compact.

---

# 12. QUICK ACTIONS

If appropriate, add a small Quick Actions section.

Possible actions:

```text
Add Horse
Create Task
Schedule Visit
Add Training Session
```

However:

**Do not create functionality that does not exist yet.**

For this phase these may simply be UI buttons/placeholders.

Only add this section if it improves the Dashboard UX.

---

# 13. MOCK DATA ARCHITECTURE

Do NOT hardcode random values directly inside JSX components.

Create a clean mock data layer.

For example:

```text
features/dashboard/
├── components/
│   ├── DashboardHeader.tsx
│   ├── SummaryCard.tsx
│   ├── HorseActivity.tsx
│   ├── UpcomingTasks.tsx
│   ├── HealthOverview.tsx
│   ├── RecentNotifications.tsx
│   └── QuickActions.tsx
│
├── mock/
│   └── dashboard-mock-data.ts
│
├── types.ts
└── dashboard-service.ts
```

Adapt this structure to the existing project's conventions.

Prefer:

```text
UI
 ↓
Dashboard service abstraction
 ↓
Mock data
```

Later it should be possible to change:

```text
MockDashboardService
```

to:

```text
ApiDashboardService
```

without rewriting the UI.

---

# 14. TYPE SAFETY

Use TypeScript types/interfaces for Dashboard data.

For example:

```text
DashboardSummary
HorseActivity
UpcomingTask
HealthOverview
DashboardNotification
```

Do not use `any` unless absolutely unavoidable.

Keep the types reusable for future API integration.

---

# 15. SIDEBAR AND NAVIGATION

Review the existing Sidebar and Navigation while implementing the Dashboard.

Do not rebuild it unnecessarily.

Improve it only if needed for:

* Better visual hierarchy
* Active Dashboard state
* Better spacing
* Better responsive behavior
* Better usability
* Consistent icons
* Better mobile navigation

Current product areas should remain consistent with the existing application architecture.

Do not invent new modules.

Do not rename existing modules unless there is a strong reason.

---

# 16. RESPONSIVE DESIGN

The Dashboard must work correctly on:

### Desktop

Multi-column layout.

### Tablet

Reduced columns with appropriate stacking.

### Mobile

Single-column layout.

Pay special attention to:

* Cards
* Charts
* Tables/lists
* Sidebar
* Header
* Text wrapping
* Padding
* Horizontal overflow

There must be:

**NO horizontal scrolling caused by the Dashboard.**

Do not simply shrink everything.

Reflow the layout intelligently.

---

# 17. LOADING STATE

Create a polished Dashboard loading state.

If the project already has Skeleton components, reuse them.

Otherwise create minimal reusable skeleton UI.

The loading state should represent:

* Summary cards
* Main chart
* Task list
* Health section
* Notifications

Avoid a generic full-page spinner when a skeleton would provide better UX.

---

# 18. EMPTY STATE

Handle empty data gracefully.

Example:

```text
No upcoming tasks

You're all caught up.
```

Do not make empty states look like errors.

---

# 19. ERROR STATE

Create a clean Dashboard error state.

Example:

```text
Something went wrong

We couldn't load the dashboard data.

Try again
```

Even though data is mocked, structure the UI so it can support real API errors later.

---

# 20. ACCESSIBILITY

Maintain good accessibility.

Ensure:

* Semantic HTML
* Proper headings
* Labels
* Keyboard navigation
* Visible focus states
* Accessible buttons
* Accessible chart information where possible
* Good contrast
* No information communicated by color alone

Do not sacrifice accessibility for visual design.

---

# 21. VISUAL DESIGN REVIEW

After implementation, do not stop when the code compiles.

Perform a visual review of the Dashboard.

Check:

### Typography

* Page title hierarchy
* Card titles
* Values
* Supporting text
* Table/list text

### Spacing

* Section spacing
* Card padding
* Grid gaps
* Alignment

### Layout

* Consistent widths
* Balanced columns
* No awkward empty spaces
* No crowded areas

### Colors

* Consistent SmartHorse palette
* Meaningful status colors
* Avoid excessive colors

### Components

* Consistent border radius
* Consistent shadows
* Consistent buttons
* Consistent icons

### Responsive

Review:

* Desktop
* Tablet
* Mobile

The Dashboard should look intentionally designed, not automatically generated from a grid.

---

# 22. UX PRINCIPLE

Always ask:

> "If a farm owner opens this page for the first time, can they understand what is happening within a few seconds?"

If not, simplify the interface.

Do not add UI just because it looks impressive.

Every element must have a purpose.

---

# 23. DO NOT OVER-DESIGN

This is extremely important.

Do not turn the Dashboard into:

* A giant analytics platform
* A dense enterprise admin panel
* A colorful gaming interface
* A marketing landing page
* A futuristic AI dashboard

SmartHorse should feel:

**Calm, professional, trustworthy, simple, and practical.**

---

# 24. TESTING

Add or update tests according to the existing project testing strategy.

At minimum test:

* Dashboard renders
* Summary cards render
* Mock data is displayed
* Upcoming tasks render
* Notifications render
* Loading state
* Empty state if applicable
* Error state if applicable
* Responsive-sensitive behavior where practical
* Existing Phase A tests remain passing

Do not remove existing tests just to make the new phase pass.

---

# 25. CODE QUALITY

Follow the project's existing:

* TypeScript configuration
* ESLint
* Prettier
* Naming conventions
* Component conventions
* Folder structure
* Testing conventions

Keep components reasonably small.

Avoid unnecessary abstractions.

Avoid unnecessary global state.

Avoid duplicated UI logic.

Avoid magic numbers where practical.

Do not introduce dependencies unless they are genuinely necessary.

---

# 26. IMPORTANT ARCHITECTURE RULE

The Dashboard is currently frontend-only.

The future architecture should remain:

```text
Dashboard UI
      ↓
Dashboard Feature Logic
      ↓
Dashboard Service
      ↓
Future /api/v1/dashboard
      ↓
Backend
      ↓
Database
```

For this phase:

```text
Dashboard UI
      ↓
Dashboard Service
      ↓
Mock Data
```

Do not bypass this abstraction by scattering mock data throughout components.

---

# 27. DO NOT BREAK PHASE A

After implementation, verify that:

* Login still works
* Register still works
* Forgot Password still works
* Reset Password still works
* Existing routing still works
* Existing Sidebar still works
* Existing Topbar still works
* Existing styles remain consistent
* Existing tests remain passing

Do not rewrite Phase A unnecessarily.

---

# 28. DO NOT IMPLEMENT PHASE C

This is strictly Phase B.

Do NOT start implementing:

* Horse Management
* Horse CRUD
* Medical Management
* Training Management
* Tasks Management
* Marketplace
* Reports
* Backend
* Database
* Real API integration

You may create UI navigation links/placeholders that already exist in the project, but do not implement their business functionality.

---

# 29. FINAL VALIDATION

Before finishing, run the appropriate project checks.

At minimum:

```text
Install/dependency validation if needed
TypeScript/type checking
Lint
Tests
Production build
```

Fix issues caused by your implementation.

Do not hide errors.

---

# 30. FINAL REPORT

When you finish, report clearly:

### 1. Existing project inspected

Confirm that you inspected the provided Phase A project before modifying it.

### 2. Files created

List important new files.

### 3. Files modified

List important modified files.

### 4. Dashboard features

Explain:

* Header
* Summary cards
* Horse Activity
* Upcoming Tasks
* Health Overview
* Notifications
* Quick Actions if implemented
* Loading state
* Empty state
* Error state

### 5. Mock architecture

Explain where the Mock Data lives and how it can later be replaced by an API.

### 6. Responsive behavior

Confirm Desktop / Tablet / Mobile behavior.

### 7. Testing

Report:

* Type checking
* Lint
* Tests
* Build

### 8. Phase A regression

Confirm that Phase A functionality still works.

### 9. Dependencies

List any new dependencies added and explain why.

### 10. Important decisions

Mention any UX/design decisions that were necessary.

---

# 31. STOP CONDITION

When Phase B is complete:

**STOP.**

Do not continue to Phase C.

Do not implement additional modules.

Wait for my visual review and approval.

The success criteria for this phase are:

> The SmartHorse Dashboard looks professional, clean, simple, intuitive, responsive, and production-quality from a frontend/UX perspective while using Mock Data and preserving the existing Phase A architecture.
