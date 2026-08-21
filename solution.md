# Solution: Billing uses catalog price (10) instead of the treatment-plan price (20)

## Problem

- Admin adds a procedure to the catalog with a default price of **10** (`Procedure.price`).
- Dentist creates a treatment plan and adds that procedure as an item, but overrides the price to **20** (the plan item's `estimatedCost` — e.g. because the case is complicated).
- When the item is completed and the staff creates an invoice from the plan item, the invoice shows **10** instead of **20**.

## Root cause

The invoice price is always taken from the **procedure catalog price**, never from the **treatment plan item's `estimatedCost`**.

1. The frontend never sends a price.

`frontend/src/features/billing/CreateInvoiceDialog.tsx` (lines 59-66) sends only `procedureId`, `toothNumber`, `quantity`, `treatmentPlanItemId` — no price:

```ts
const items = completedItems
  .filter((item) => selected.has(item.id))
  .map((item) => ({
    procedureId: item.procedureId,
    toothNumber: item.toothNumber ?? undefined,
    quantity: 1,
    treatmentPlanItemId: item.id,
  }));
```

2. The API schema does not even accept a price field.

`backend/src/modules/billing/schema.ts` (lines 6-16) only accepts `procedureId`, `toothNumber`, `quantity`, `treatmentPlanItemId`.

3. The backend hard-codes the price from the procedure.

`backend/src/modules/billing/service.ts` (lines 123-136), inside `runInvoiceTransaction`:

```ts
const itemsData = data.items.map((item) => {
  const procedure = procedureMap.get(item.procedureId);
  const unitPrice = Number(procedure.price);   // <-- always the catalog price (10)
  const totalPrice = unitPrice * item.quantity;
  subtotal += totalPrice;
  ...
});
```

The dentist's override (20) lives in `TreatmentPlanItem.estimatedCost` (see `backend/prisma/schema.prisma` line 222 and `backend/src/modules/treatment-plans/schema.ts` line 11), but billing never reads it.

## Fix (recommended — server-side)

Make the backend use the linked plan item's `estimatedCost` as the unit price when a `treatmentPlanItemId` is present, falling back to the procedure price otherwise.

### Step 1 — include `estimatedCost` when validating plan items

`backend/src/modules/billing/service.ts` (lines 61-65), add `estimatedCost` to the include/select of the plan-item query:

```ts
const planItems = await prisma.treatmentPlanItem.findMany({
  where: { id: { in: planItemIds } },
  include: {
    treatmentPlan: true,
    invoiceItem: true,
    select: undefined,
  },
});
```

Better: build a `planItemMap` (id -> estimatedCost) and pass it into `runInvoiceTransaction`, the same way `procedureMap` is passed.

### Step 2 — use the plan item price when building invoice items

`backend/src/modules/billing/service.ts` (lines 123-136), change:

```ts
const itemsData = data.items.map((item) => {
  const procedure = procedureMap.get(item.procedureId);
  const planItemPrice = item.treatmentPlanItemId
    ? planItemMap.get(item.treatmentPlanItemId)
    : undefined;
  const unitPrice =
    planItemPrice !== undefined
      ? Number(planItemPrice)
      : Number(procedure.price);
  const totalPrice = unitPrice * item.quantity;
  subtotal += totalPrice;
  return { ... };
});
```

Notes:
- `estimatedCost` is a `Decimal` in Prisma, so use `Number(...)` to convert, matching how `procedure.price` is already handled.
- This also keeps the invoice accurate when the catalog price is later changed — the invoice always snapshots the price that was agreed at plan time.

## Alternative fix (client-side only)

`frontend/src/features/billing/CreateInvoiceDialog.tsx` (lines 59-66) sends `unitPrice: item.estimatedCost`, and `backend/src/modules/billing/schema.ts` accepts an optional `unitPrice` that the backend uses when provided. Less secure (client can send any price), so the server-side fix above is preferred.

## Summary

| # | File | Line | Problem |
|---|------|------|---------|
| 1 | `backend/src/modules/billing/service.ts` | 125 | `unitPrice` always comes from `procedure.price`, ignores `TreatmentPlanItem.estimatedCost` |
| 2 | `backend/src/modules/billing/schema.ts` | 8-13 | invoice item schema has no price field at all |
| 3 | `frontend/src/features/billing/CreateInvoiceDialog.tsx` | 59-66 | frontend doesn't send the plan item's price |

Fix #1 (service layer) alone resolves the bug; #2/#3 are only needed if you also want the client to be able to override the price per invoice item.

---

# Problem: Cannot fetch treatment plans (GET returns 500 "Something went wrong")

## Problem

- Opening the Treatment Plans tab on a patient page shows an error / empty state — the plans are never fetched.
- `GET /api/v1/patients/:patientId/treatment-plans` returns **500 `{"error":{"message":"Something went wrong"}}`** (confirmed by hitting the endpoint directly).
- Creating plans / adding items may appear to work, but every request that touches the `createdBy` / `createdById` columns fails server-side.

## Root cause

The schema was changed to add `createdById` + `createdBy` relation to `TreatmentPlan` and `TreatmentPlanItem` (see `backend/prisma/schema.prisma` and migration `20260819181003_treatment_plan_created_by`), and the code was updated to use it, but **`prisma generate` was never re-run**, so the generated Prisma client in `backend/src/generated/prisma` is stale and doesn't know these fields exist.

1. The fetch query includes the new relation.

`backend/src/modules/treatment-plans/repository.ts` (lines 3-18), `findPlansByPatient` includes `createdBy` on the plan and on each item:

```ts
return prisma.treatmentPlan.findMany({
  where: { patientId },
  include: {
    createdBy: { select: { id: true, firstName: true, lastName: true } },
    items: {
      include: {
        procedure: true,
        invoiceItem: true,
        createdBy: { select: { id: true, firstName: true, lastName: true } },
      },
    },
  },
  ...
});
```

2. The generated client has no `createdBy` / `createdById` on either model.

`backend/src/generated/prisma/models/TreatmentPlan.ts` and `models/TreatmentPlanItem.ts` contain **zero** `createdBy` references (aggregate/select types only list `id, title, notes, patientId, createdAt, updatedAt`, etc.). The embedded schema in `backend/src/generated/prisma/internal/class.ts` also lacks the fields.

3. Prisma throws at runtime.

Running the repository query directly produces:

```
PrismaClientValidationError:
Unknown field `createdBy` for include statement on model `TreatmentPlan`.
Available options are marked with ?.
```

Because the error is not an `AppError`, `backend/src/middleware/error.middleware.ts` swallows it into the generic 500 `"Something went wrong"`.

4. Same problem affects create/add-item.

`backend/src/modules/treatment-plans/repository.ts` passes `createdById` in the `create`/`createItem` data (lines 20-41), which the stale client also rejects — POST `/patients/:patientId/treatment-plans` and POST `/treatment-plans/:planId/items` also return 500.

## Fix (no code change needed — regenerate the client)

Run the Prisma generator in the backend so the generated client matches the schema:

```bash
cd backend
npm run db:generate    # = prisma generate
```

Then restart the dev server (`npm run dev`). The generated files under `backend/src/generated/prisma` will be updated with `createdById` / `createdBy` on `TreatmentPlan` and `TreatmentPlanItem` (plus the `User` back-relations), and the fetch (list), create, and add-item endpoints will work again.

Notes:
- The migration `20260819181003_treatment_plan_created_by` was already created and the schema already has the fields — the DB is fine; only the client is stale.
- If the columns are missing in the DB, run `npm run db:migrate` first, then regenerate.

## Summary

| # | File | Line | Problem |
|---|------|------|---------|
| 1 | `backend/src/generated/prisma/models/TreatmentPlan.ts` | — | generated client missing `createdById`/`createdBy` (stale) |
| 2 | `backend/src/generated/prisma/models/TreatmentPlanItem.ts` | — | generated client missing `createdById`/`createdBy` (stale) |
| 3 | `backend/src/modules/treatment-plans/repository.ts` | 3-18 | includes `createdBy` that the stale client rejects → 500 on fetch |
| 4 | `backend/src/modules/treatment-plans/repository.ts` | 20-41 | writes `createdById` that the stale client rejects → 500 on create/add |

The fix is a single command (`prisma generate`) — no application code needs to change.