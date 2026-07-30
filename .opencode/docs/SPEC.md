# Dental Clinic Management System — Build Spec (condensed, for AI agent reference)

## Stack

Node.js + Express, PostgreSQL via Prisma 7 (adapter-based client, prisma.config.ts), Socket.io, JWT auth (access + refresh), Zod validation, bcrypt, Jest + Supertest.

## Database schema (Prisma, see prisma/schema.prisma for full DDL)

- **clinics**: id, name, address, phone, is_active, created_at — tenant root
- **users**: id, clinic_id→clinics (nullable for SUPER_ADMIN), email (unique), password_hash, first_name, last_name, role (enum: SUPER_ADMIN/ADMIN/DENTIST/ASSISTANT/RECEPTIONIST), is_active
- **patients**: id, clinic_id→clinics, first_name, last_name, phone, email, date_of_birth, gender, address, allergies, medical_notes
- **procedure_categories**: id, clinic_id→clinics, name, sort_order — e.g. Preventive, Restorative, Surgical, Orthodontic
- **procedures**: id, clinic_id→clinics, category_id→procedure_categories, name, description, price (Decimal), duration_min, is_active — the treatment catalog (equivalent of "products")
- **appointments**: id, clinic_id→clinics, patient_id→patients, dentist_id→users, scheduled_at, duration_min, status (enum), reason, notes
- **tooth_chart_entries**: id, patient_id→patients, tooth_number (Int, FDI notation 11–48), condition (enum), notes, updated_at — one row per tooth per patient, upserted as conditions change. `@@unique([patientId, toothNumber])`
- **treatment_plans**: id, patient_id→patients, title, notes — a staged plan, may span many visits
- **treatment_plan_items**: id, treatment_plan_id→treatment_plans, procedure_id→procedures, tooth_number (nullable), status (enum), estimated_cost
- **invoices**: id, clinic_id→clinics, patient_id→patients, created_by_id→users, invoice_number (scoped autoincrement), status (enum), subtotal, discount, total
- **invoice_items**: id, invoice_id→invoices, procedure_id→procedures, tooth_number (nullable), quantity, unit_price (snapshot), total_price
- **payments**: id, invoice_id→invoices, amount, method (enum), paid_at, notes — supports partial/installment payments against one invoice

Indexes: `(clinicId, scheduledAt)` on appointments, `(clinicId)` on all tenant-scoped tables, `(patientId, toothNumber)` unique on tooth_chart_entries, `(clinicId, invoiceNumber)` unique on invoices.

## Appointment status state machine (enforce in service layer, not just DB)

SCHEDULED → CONFIRMED | CANCELLED
CONFIRMED → CHECKED_IN | CANCELLED | NO_SHOW
CHECKED_IN → IN_PROGRESS
IN_PROGRESS→ COMPLETED
COMPLETED → (terminal)
CANCELLED → (terminal)
NO_SHOW → (terminal)

## Treatment plan item status

PLANNED → IN_PROGRESS → COMPLETED
PLANNED → CANCELLED

Completing an item is the trigger that makes it eligible to be pulled into an invoice.

## Invoice status

PENDING → PARTIALLY_PAID → PAID
PENDING → PAID (single full payment)
PAID → REFUNDED

Derived from `sum(payments.amount)` vs `invoice.total` — recompute on every payment write, don't trust a manually-set status.

## API summary

| Method    | Endpoint                                      | Role                  | Notes                                                  |
| --------- | --------------------------------------------- | --------------------- | ------------------------------------------------------ |
| POST      | /api/v1/auth/login                            | public                | returns access token, sets refresh cookie              |
| POST      | /api/v1/auth/refresh                          | authenticated         | new access token                                       |
| GET/POST  | /api/v1/patients                              | front-desk+           | search by name/phone                                   |
| GET/PATCH | /api/v1/patients/:id                          | front-desk+           | includes medical notes, allergies                      |
| GET       | /api/v1/patients/:id/tooth-chart              | clinical              | current condition of all 32 teeth                      |
| PUT       | /api/v1/patients/:id/tooth-chart/:toothNumber | dentist, assistant    | upsert one tooth's condition                           |
| GET/POST  | /api/v1/procedures                            | authenticated / admin | treatment catalog                                      |
| GET/POST  | /api/v1/appointments                          | authenticated         | filter by date/dentist/status                          |
| PATCH     | /api/v1/appointments/:id/status               | front-desk+           | validated state machine                                |
| GET/POST  | /api/v1/patients/:id/treatment-plans          | dentist, admin        |                                                        |
| PATCH     | /api/v1/treatment-plan-items/:id              | dentist               | move through PLANNED→IN_PROGRESS→COMPLETED             |
| POST      | /api/v1/patients/:id/invoices                 | admin, receptionist   | generate from completed treatment-plan items or ad-hoc |
| POST      | /api/v1/invoices/:id/payments                 | admin, receptionist   | supports partial/installment payments                  |
| GET       | /api/v1/reports/revenue                       | admin                 | date range aggregation                                 |
| GET       | /api/v1/health                                | public                | DB connectivity check                                  |

## Invoice creation transaction (critical path — must be atomic)

1. Begin `prisma.$transaction`.
2. Create invoice row (subtotal/total computed server-side from line items, never trusted from client).
3. Create invoice_items rows, snapshotting `unitPrice` from the procedure at time of billing.
4. If items reference `treatment_plan_items`, mark those COMPLETED items as billed (link or flag) so they can't be double-invoiced.
5. Commit.
6. After commit: emit `invoice:created` via Socket.io to `clinic:{id}:frontdesk` room; optionally enqueue a receipt print job.

## Real-time events

- Clients join `clinic:{id}` on connect; front-desk-role clients also join `clinic:{id}:frontdesk`.
- `appointment:checked_in` → emitted when a patient checks in, drives a waiting-room display.
- `appointment:updated` → emitted to clinic room on any status change.
- `invoice:created` → emitted to front-desk room when billing is generated after a visit.

## Receipt printing (optional, Phase 6)

- `node-thermal-printer` over TCP, same pattern as the POS project — print an invoice/receipt at checkout, not a kitchen ticket.
- Retry 3 times with backoff; log to a `print_jobs` table if you carry it over; emit `printer:error` on final failure.

## Security requirements

- bcrypt for passwords, never plain text.
- JWT access token short-lived (15 min), refresh token in httpOnly secure cookie (7 days).
- Rate limit `/auth/login` (5 attempts / 15 min / IP).
- helmet + explicit CORS allow-list.
- All input validated with Zod before hitting a service function.
- Every tenant-scoped query filters by `clinicId` — patient medical data is the highest-sensitivity data in this system, treat cross-tenant leakage as a critical bug class, not an edge case.

## Full build order

See `AGENTS.md` — phases 1 through 8, one at a time, with a stop-and-review checkpoint after each phase.
