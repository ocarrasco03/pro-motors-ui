import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { fetchMe } from "./authThunks";
import type { AuthUser } from "@/types/types";

interface AuthState {
    user: AuthUser | null;
    token: string | null;
    isAuthenticated: boolean;
    isBootstrapping: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem("access_token"),
    isAuthenticated: !!localStorage.getItem("access_token"),
    isBootstrapping: true,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        login: (state, action: PayloadAction<{ token: string }>) => {
            state.isAuthenticated = true;
            state.token = action.payload.token;
            localStorage.setItem("access_token", action.payload.token);
        },
        logout: (state) => {
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem("access_token");
        },
        setUser: (state, action: PayloadAction<AuthUser>) => {
            state.user = action.payload;
        },
        setBootstrapped: (state) => {
            state.isBootstrapping = false;
        }
    },
    extraReducers: (builder) => {
        builder
        .addCase(fetchMe.fulfilled, (state, action: PayloadAction<AuthUser>) => {
            state.isAuthenticated = true;
            state.isBootstrapping = false;
            state.user = action.payload;
        })
        .addCase(fetchMe.rejected, (state) => {
            state.isAuthenticated = false;
            state.isBootstrapping = false;
            state.user = null;
            state.token = null;
            localStorage.removeItem("access_token");
        });
    }
});

export const { login, logout, setUser, setBootstrapped } = authSlice.actions;

export default authSlice.reducer;