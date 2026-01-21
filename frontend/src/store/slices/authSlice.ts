import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

export interface User {
  id: string;
  username: string;
  email: string;
  role: "ADMIN" | "STUDENT";
  profileImage?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
};

// Rehydrate from localStorage if available
const savedAuth = localStorage.getItem("auth");
if (savedAuth) {
  const parsed = JSON.parse(savedAuth);
  initialState.user = parsed.user;
  initialState.token = parsed.token;
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; token: string }>,
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;

      localStorage.setItem(
        "auth",
        JSON.stringify({ user: state.user, token: state.token }),
      );
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("auth");
    },
  },
});

export const { loginSuccess, logout } = authSlice.actions;
export default authSlice.reducer;