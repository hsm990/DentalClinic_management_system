# Solution: Cannot fetch appointments and cannot create one

## Problem

On the Appointments page:
- The table shows `Failed to load appointments.` — the list never loads.
- Clicking **Book appointment** fails with a `Failed to book appointment` toast — nothing is created.

Both failures were reproduced against the running backend (`tsx watch src/server.ts` on `http://localhost:4000`, database connected):

| Request | Result |
|---|---|
| `GET /api/v1/appointments` (with valid Bearer token) | **500** `{"error":{"message":"Something went wrong"}}` |
| `POST /api/v1/appointments` (with seeded patient `seed-patient-1`) | **422** `{"error":{"message":"patientId: Invalid cuid","status":"fail"}}` |
| `GET /api/v1/patients` | 200 (works) |
| `GET /api/v1/users/dentists` | 200 (works) |

These are two independent bugs.

---

## Bug 1: Cannot fetch appointments — 500 from query validation on Express 5

### Root cause

The GET route validates query params:

`backend/src/routes/appointments.route.ts` (lines 14-19)

```ts
router
  .route("/")
  .get(
    validate(listAppointmentsQuerySchema, "query"),
    appointmentsController.list,
  )
```

The validation middleware then **reassigns** the validated value back onto the request:

`backend/src/middleware/validate.middleware.ts` (lines 10-19)

```ts
function validate(schema: ZodType, target: ValidateTarget = "body") {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[target]);

    if (!result.success) { ... return next(new AppError(...)); }

    req[target] = result.data;
    next();
  };
}
```

For a query target this executes `req.query = result.data`.

**Express 5 defines `req.query` as a getter-only property (no setter).** Verified:

```js
Object.getOwnPropertyDescriptor(express.request, "query")
// -> { get: function, set: undefined }
```

Because the backend runs as ESM (tsx in strict mode), assigning to a getter-only property throws:

```
TypeError: Cannot set property query of #<IncomingMessage> which has only a getter
```

Reproduced in isolation — CJS silently ignores the assignment, ESM throws:

```
CJS   (require)     -> 200 "no throw"
ESM   (import)      -> 500 "THREW: Cannot set property query ... only a getter"
```

`req.body` and `req.params` are not affected (PATCH `/appointments/seed-appointment-1/status`, which validates `params`, returns 200 — and login/create, which validate `body`, work). Only `query` is broken.

The thrown `TypeError` is not an `AppError`, so `error.middleware.ts` (lines 4-17) falls through to

```ts
return res.status(500).json({ error: { message: "Something went wrong" } });
```

The frontend gets a non-2xx response, so `useGetAppointmentsQuery` sets `isError` and the page renders `Failed to load appointments.`

### Why patients/dentists still load

`GET /patients` (`patients.route.ts` line 15) and `GET /users/dentists` (`users.route.ts` line 15) have **no** query-validation middleware, so they never hit the bug. `GET /appointments` is currently the only route in the app that validates `req.query` on Express 5 — which is why appointments are the only list that fails.

### Fix (code untouched — for reference)

Do not write back to `req.query` in the validate middleware, or parse the query with zod without reassigning, e.g. return `result.data` instead of `req[target] = result.data` (and have the controllers read the parsed value), or drop `validate(listAppointmentsQuerySchema, "query")` from the appointments GET route.

---

## Bug 2: Cannot create an appointment — seeded patient id fails `z.string().cuid()`

### Root cause

The frontend only lets you pick from the loaded patients. In the current database the **only** patient is the seeded one:

`backend/prisma/seed.ts` (lines 110-122)

```ts
const patient = await prisma.patient.upsert({
  where: { id: "seed-patient-1" },
  ...
  create: { id: "seed-patient-1", ... },
});
```

So the dialog submits `patientId: "seed-patient-1"`.

But the backend validates that field as a CUID:

`backend/src/modules/appointments/schema.ts` (lines 3-10)

```ts
export const createAppointmentSchema = z.object({
  patientId: z.string().cuid(),
  dentistId: z.string().cuid(),
  scheduledAt: z.coerce.date(),
  ...
});
```

`"seed-patient-1"` is a hand-written literal id, not a valid CUID (real Prisma ids look like `cmsj775sk000280vv2ai48sds`). Zod rejects it:

```
422 {"error":{"message":"patientId: Invalid cuid","status":"fail"}}
```

which surfaces in the UI as the `Failed to book appointment` toast (the mutation `unwrap()` throws, caught by the `catch` in `CreateAppointmentDialog.tsx` line 54).

### Proof that the create flow itself is fine

With a properly-formed CUID patient id, the same endpoint succeeds:

```
POST /api/v1/appointments  {patientId: "cmsmhcofn00004svv1ak468ys", dentistId: "cmsj775sk000280vv2ai48sds", scheduledAt: "..."}
-> 201 {"appointment": {...}}
```

So: booking works only for patients that were created by the app (real CUID ids). The seeded patient — the one present in every fresh database — can never be booked.

### Also affected (seed-data vs. CUID validation mismatch)

The same mismatch exists for the other hand-written seed ids:

- `seed-clinic` / `seed-clinic-2` — not validated by zod (clinicId comes from the JWT), so harmless for now.
- `seed-appointment-1` — passes `idParamSchema` (plain string, `common/schema.ts` line 4), so status updates work (verified: PATCH returned 200). But because the list endpoint 500s (Bug 1), the seeded appointment is unreachable from the UI anyway.

### Fix options (code untouched — for reference)

- Change the seed to use `prisma.patient.create` without a hard-coded id so the patient gets a real CUID, or
- Relax `createAppointmentSchema` to `z.string().min(1)` (like `idParamSchema`) so hand-written ids are accepted, or
- Create patients through the UI (/ patients API) and book appointments against those CUID ids.

---

## Summary

| # | Symptom | Root cause | Files |
|---|---------|------------|-------|
| 1 | Appointments list never loads (`Failed to load appointments`) | `validate.middleware.ts` does `req.query = result.data`; Express 5 `req.query` is getter-only → `TypeError` → 500. Only the appointments GET route validates query | `backend/src/routes/appointments.route.ts:17`, `backend/src/middleware/validate.middleware.ts:19`, `backend/src/middleware/error.middleware.ts:15` |
| 2 | Booking always fails (`Failed to book appointment`) | Seeded patient id `seed-patient-1` is not a CUID; `createAppointmentSchema` requires `z.string().cuid()` → 422 | `backend/prisma/seed.ts:110-122`, `backend/src/modules/appointments/schema.ts:4` |