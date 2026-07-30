# AGENTS.md — Dental Clinic Management System build instructions

You are building a production-style Dental Clinic backend (Node/Express + PostgreSQL + Prisma 7 + Socket.io), following the full spec in `docs/SPEC.md`. Read that file first before writing any code. Do not redesign the architecture; implement it.

## Ground rules

1. **Use Prisma as the ORM, never raw SQL.** Runtime client is adapter-based (`@prisma/adapter-pg`); migrations/CLI config live in `prisma.config.ts`, not in the schema's datasource block (Prisma 7 breaking change).
2. **Follow the modular monolith folder structure** (`src/modules/<domain>/`). Each domain gets `routes.ts`, `controller.ts`, `service.ts`, `schema.ts`, `repository.ts`. Controllers only handle req/res; services own logic and know nothing about HTTP.
3. **Every multi-table write must be a Prisma transaction** (`prisma.$transaction(...)`). This applies especially to invoice creation (invoice + invoice_items + marking treatment-plan-items as billed, in one atomic transaction).
4. **Validate every request body with Zod** before it reaches a service function. Reject invalid input with 422 and a clear message.
5. **Every route declares required roles** via `requireRole()`. Never leave a route unguarded except `/auth/login` and `/health`.
6. **All errors flow through the single centralized error handler.** Never send ad-hoc error responses from a controller.
7. **Every tenant-scoped repository method takes `clinicId` as an explicit, non-optional argument** — never rely on a query filter added "later." This is the multi-tenancy security rule from the POS project, and it's more important here because the tenant-scoped data is medical.
8. **Write a test for every service function that touches money, appointment status, or treatment-plan status.** Jest + Supertest. Don't move to the next phase until current-phase tests pass.
9. **Prices are `Decimal`/`NUMERIC`, never floats.**
10. **Ask before installing a new dependency** not already in the setup steps.
11. **After finishing each phase below, stop and summarize what you built, then wait for confirmation** before starting the next phase.

## Build order — do not skip ahead

### Phase 1 — Foundations

- Implement the full Prisma schema from `docs/SPEC.md` / `prisma/schema.prisma` (all models: Clinic, User, Patient, ProcedureCategory, Procedure, Appointment, ToothChartEntry, TreatmentPlan, TreatmentPlanItem, Invoice, InvoiceItem, Payment).
- Run the initial migration.
- Set up `src/app.ts` (Express, helmet, cors, rate limiting) and `server.ts` (HTTP server + Socket.io init).
- Add `GET /api/v1/health` checking DB connectivity.
- Add `prisma/seed.ts`: one clinic, one admin user.

### Phase 2 — Auth & RBAC

- `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`.
- `auth.middleware.ts` (verify JWT, attach `req.user`).
- `rbac.middleware.ts` (`requireRole(...)`).
- Seed extended with one test user per role (admin, dentist, assistant, receptionist).

### Phase 3 — Patients & catalog

- CRUD for patients (search by name/phone, clinic-scoped).
- CRUD for procedure_categories and procedures.
- Enforce admin-only writes on the catalog; clinical/front-desk-only writes on patients.

### Phase 4 — Scheduling

- `POST/GET /api/v1/appointments` with date/dentist/status filtering.
- `PATCH /api/v1/appointments/:id/status` — enforce the appointment state machine, reject invalid transitions with 422.

### Phase 5 — Clinical records

- Tooth chart: `GET /api/v1/patients/:id/tooth-chart`, `PUT .../tooth-chart/:toothNumber` (upsert, dentist/assistant only).
- Treatment plans: create plan + items, transition items PLANNED → IN_PROGRESS → COMPLETED.

### Phase 6 — Billing

- `POST /api/v1/patients/:id/invoices` — full transaction: create invoice, create invoice_items (snapshot procedure price), mark referenced treatment-plan-items as billed.
- `POST /api/v1/invoices/:id/payments` — supports partial payments; recompute invoice status from `sum(payments)` vs `total` on every write, never trust a client-supplied status.
- `GET /api/v1/reports/revenue` with date range aggregation.

### Phase 7 — Real-time layer

- Socket.io rooms scoped by `clinic:{id}` and `clinic:{id}:frontdesk`.
- Emit `appointment:checked_in`, `appointment:updated`, `invoice:created`.

### Phase 8 — Tests & polish

- Integration tests covering: invalid appointment-status transition rejection, double-billing a treatment-plan-item rejection, role-guard rejection, full happy-path visit → treatment-plan → invoice → payment flow.

## What NOT to do

- Don't add MongoDB, GraphQL, or any tech not in the spec — the stack is fixed.
- Don't skip validation "for now" — add it at the same time as the route.
- Don't write a giant single `routes.ts`/`controller.ts` — keep the per-module split.
- Don't invent new database fields not in `docs/SPEC.md` without flagging it first.
- Don't relax the `clinicId` scoping rule anywhere, even for SUPER_ADMIN convenience routes — those get an explicit, separately-guarded cross-tenant path instead.
