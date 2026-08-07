import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/app/store";
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL,
  credentials: "include",
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery,
  tagTypes: [
    "Patient",
    "Appointment",
    "ToothChart",
    "TreatmentPlan",
    "Procedure",
    "ProcedureCategory",
    "Invoice",
  ],
  endpoints: () => ({}),
});
