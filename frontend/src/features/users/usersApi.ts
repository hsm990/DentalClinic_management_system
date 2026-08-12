import { apiSlice } from "@/lib/apiBaseQuery";

export interface Dentist {
  id: string;
  firstName: string;
  lastName: string;
}

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "ADMIN" | "DENTIST" | "ASSISTANT" | "RECEPTIONIST";
  isActive: boolean;
}

interface DentistsResponse {
  dentists: Dentist[];
}
interface StaffResponse {
  staff: StaffMember[];
}
interface CreateUserResponse {
  user: StaffMember;
}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDentists: builder.query<Dentist[], void>({
      query: () => "/users/dentists",
      transformResponse: (r: DentistsResponse) => r.dentists,
    }),

    getStaff: builder.query<StaffMember[], void>({
      query: () => "/users",
      transformResponse: (r: StaffResponse) => r.staff,
      providesTags: [{ type: "Staff", id: "LIST" }],
    }),

    createStaff: builder.mutation<
      StaffMember,
      {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: string;
      }
    >({
      query: (body) => ({ url: "/users", method: "POST", body }),
      transformResponse: (r: CreateUserResponse) => r.user,
      invalidatesTags: [{ type: "Staff", id: "LIST" }],
    }),
  }),
});

export const { useGetDentistsQuery, useGetStaffQuery, useCreateStaffMutation } =
  usersApi;
