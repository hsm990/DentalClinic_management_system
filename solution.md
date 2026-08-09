# Solution: Login works but page refresh kicks you back to login page

## Problem

When you log in, everything works. But on page refresh you are redirected to `/login` and the console shows a 401 error.

### Root cause

The frontend stores the access token **only in Redux memory**, so on page reload the token is gone and the app must restore it via the refresh token (which is correctly stored in an httpOnly cookie). This restore path is broken, so the app can never get back its session.

## Bug 1: Refresh endpoint method mismatch

The frontend sends a **POST** request to `/api/v1/auth/refresh`, but the backend only registers a **GET** handler for that route. The request never matches a route, the refresh fails, the app logs the user out.

### Wrong backend code

`backend/src/routes/auth.routes.ts` (line 20)

```ts
router.route("/refresh").get(authController.refresh);
```

### Wrong frontend code

`frontend/src/features/auth/authApi.ts` (line 37)

```ts
refresh: builder.mutation<{ accessToken: string }, void>({
  query: () => ({ url: "/auth/refresh", method: "POST" }),
}),
```

And also in `frontend/src/lib/apiBaseQuery.ts` (line 32)

```ts
const refreshResult = await baseQuery(
  { url: "/auth/refresh", method: "POST" },
  api,
  extraOptions,
);
```

### Fix (choose ONE side so both match)

Option A — change the backend route to POST (recommended, matches frontend):

`backend/src/routes/auth.routes.ts` (line 20)

```ts
router.route("/refresh").post(authController.refresh);
```

Option B — change the frontend to use GET:

`frontend/src/features/auth/authApi.ts` (line 37)

```ts
refresh: builder.mutation<{ accessToken: string }, void>({
  query: () => ({ url: "/auth/refresh", method: "GET" }),
}),
```

And in `frontend/src/lib/apiBaseQuery.ts` (line 32)

```ts
const refreshResult = await baseQuery(
  { url: "/auth/refresh", method: "GET" },
  api,
  extraOptions,
);
```

## Bug 2: `/auth/me` response shape mismatch

Even after fixing Bug 1 you would STILL be redirected to login, because of this second bug.

The backend returns a response with a property named `currentUser`, but the frontend reads a property named `user`, which does not exist, so `user` is `undefined` and the `ProtectedRoute` redirects to `/login`.

### Wrong backend code (reference only)

`backend/src/modules/auth/controller.ts` (line 36)

```ts
res.json({ currentUser });
```

### Wrong frontend code

`frontend/src/features/auth/AuthInitializer.tsx` (line 27)

```ts
dispatch(
  credentialsSet({
    accessToken: refreshResult.accessToken,
    user: meResult.user as AuthUser,
  }),
);
```

### Fix

Change the frontend to read `currentUser` instead of `user`:

`frontend/src/features/auth/AuthInitializer.tsx` (lines 23-29)

```ts
const meResult = await getMe().unwrap();
dispatch(
  credentialsSet({
    accessToken: refreshResult.accessToken,
    user: meResult.currentUser as AuthUser,
  }),
);
```

Alternatively, change the backend to return `{ user }` instead of `{ currentUser }`.

## Summary

| # | File | Line | Problem |
|---|------|------|---------|
| 1 | `backend/src/routes/auth.routes.ts` | 20 | `/refresh` is registered as GET but frontend calls POST |
| 2 | `frontend/src/features/auth/authApi.ts` | 37 | refresh mutation uses POST while backend expects GET |
| 3 | `frontend/src/lib/apiBaseQuery.ts` | 32 | reauth refresh call uses POST |
| 4 | `frontend/src/features/auth/AuthInitializer.tsx` | 27 | reads `meResult.user` but backend returns `currentUser` |
| 5 | `backend/src/modules/auth/controller.ts` | 36 | `/auth/me` returns `{ currentUser }` |