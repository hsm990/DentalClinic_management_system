import { apiSlice } from "@/lib/apiBaseQuery";

interface LoginRequest {
  email: string;
  password: string;
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "/auth/login",
        method: "POST",
        body: credentials,
      }),
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
    }),
    getMe: builder.query<{ user: AuthUser }, void>({
      query: () => "/auth/me",
    }),
    refresh: builder.mutation<{ accessToken: string }, void>({
      query: () => ({ url: "/auth/refresh", method: "POST" }),
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useLazyGetMeQuery,
  useRefreshMutation,
} = authApi;
