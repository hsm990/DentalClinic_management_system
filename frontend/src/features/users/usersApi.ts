import { apiSlice } from "@/lib/apiBaseQuery";

interface Dentist {
  id: string;
  firstName: string;
  lastName: string;
}
interface DentistsResponse {
  dentists: Dentist[];
}

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDentists: builder.query<Dentist[], void>({
      query: () => "/users/dentists",
      transformResponse: (r: DentistsResponse) => r.dentists,
    }),
  }),
});

export const { useGetDentistsQuery } = usersApi;
