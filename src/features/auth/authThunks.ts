import { createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "./authService";
import { login as signin, logout as signout, setUser } from "./authSlice";
import axios from "axios";

export const login = createAsyncThunk(
  "auth/login",
  async (
    payload: { username: string; password: string },
    { dispatch, rejectWithValue },
  ) => {
    try {
      const response = await authService.login(payload);

      dispatch(
        signin({
          token: response.data.access_token,
        }),
      );

      await dispatch(fetchMe());

      return response;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        return rejectWithValue({
          message: error.response?.data?.message ?? "Error al iniciar sesión",
          errors: error.response?.data?.errors ?? null,
        });
      }
      return rejectWithValue({
        message: "Error insperado al iniciar sesión",
      });
    }
  },
);

export const fetchMe = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.me();
      return data;
    } catch (error) {
      return rejectWithValue(null);
    }
  },
);

export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch }) => {
    try {
      await authService.logout();
    } finally {
      dispatch(signout());
    }
  },
);
