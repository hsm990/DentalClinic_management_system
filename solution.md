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