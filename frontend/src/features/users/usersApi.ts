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
    updateStaff: builder.mutation<
      StaffMember,
      { id: string; data: Record<string, unknown> }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      transformResponse: (r: { staff: StaffMember }) => r.staff,
      invalidatesTags: [{ type: "Staff", id: "LIST" }],
    }),

    setStaffActive: builder.mutation<
      StaffMember,
      { id: string; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      transformResponse: (r: { staff: StaffMember }) => r.staff,
      invalidatesTags: [{ type: "Staff", id: "LIST" }],
    }),
  }),
});

export const {
  useGetDentistsQuery,
  useGetStaffQuery,
  useCreateStaffMutation,
  useUpdateStaffMutation,
  useSetStaffActiveMutation,
} = usersApi;
