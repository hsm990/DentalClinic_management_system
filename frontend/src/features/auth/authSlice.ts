import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "SUPER_ADMIN" | "ADMIN" | "DENTIST" | "ASSISTANT" | "RECEPTIONIST";
}

interface AuthState {
  accessToken: string | null;
  user: AuthUser | null;
}

const initialState: AuthState = {
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    credentialsSet: (
      state,
      action: PayloadAction<{ accessToken: string; user: AuthUser }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
    },
    loggedOut: (state) => {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { credentialsSet, loggedOut } = authSlice.actions;
export default authSlice.reducer;
