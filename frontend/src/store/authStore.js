import axios from "axios";
import { create } from "zustand";

const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5005/api/auth"
    : "/api/auth";
axios.defaults.withCredentials = true;

export const authStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  error: null,
  isLoading: false,
  isCheckingAuth: true,
  message: null,

  register: async (name, email, password) => {
    set({ isLoading: true, error: null });

    try {
      const res = await axios.post(`${API_URL}/signup`, {
        name,
        email,
        password,
      });
      set({
        user: res.data.rest,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error.response.data.message || "Register error",
        isLoading: false,
      });
      throw error;
    }
  },

  login: async (email, password) => {
    set({ error: null, isLoading: true });

    try {
      const res = await axios.post(`${API_URL}/login`, {
        email,
        password,
      });
      set({
        user: res.data.rest,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      set({
        error: error.response.data.message || "Login error",
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    set({ error: null, isLoading: true });
    try {
      await axios.post(`${API_URL}/logout`);
      set({
        user: null,
        isAuthenticated: false,
        error: null,
        isLoading: false,
      });
    } catch (error) {
      set({ error: "Error logging out", isLoading: false });
      throw error;
    }
  },

  verifyEmail: async (code) => {
    set({ isLoading: true, error: null });

    try {
      const res = await axios.post(`${API_URL}/verify-email`, { code });
      set({
        isAuthenticated: true,
        user: res.data.rest,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Verify email error",
        isLoading: false,
      });
      throw error;
    }
  },

  checkAuth: async () => {
    // await new Promise((resolve) => setTimeout(resolve, 2000));
    set({ error: null, isCheckingAuth: true });

    try {
      const res = await axios.get(`${API_URL}/verify-auth`);
      set({
        user: res.data.user,
        isAuthenticated: true,
        isCheckingAuth: false,
      });
    } catch (error) {
      set({ isLoading: false, error: null, isCheckingAuth: false });
    }
  },

  forgotPassword: async (email) => {
    set({ error: null, isLoading: true });
    try {
      const res = await axios.post(`${API_URL}/forgot-password`, { email });
      set({
        isLoading: false,
        message: res.data.message,
      });
    } catch (error) {
      set({
        isLoading: false,
        error:
          error.response.data.message || "Error sending reset password email",
      });
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, {
        password,
      });
      set({ message: response.data.message, isLoading: false });
    } catch (error) {
      set({
        isLoading: false,
        error: error.response.data.message || "Error resetting password",
      });
      throw error;
    }
  },
}));
