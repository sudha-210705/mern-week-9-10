import { create } from "zustand";
import axios from "axios";

export const useAuth = create((set) => ({
  currentUser: null,
  token: localStorage.getItem("token") || null, // ← NEW
  loading: false,
  isAuthenticated: false,
  error: null,

  login: async (userCredWithRole) => {
    const { role, ...userCredObj } = userCredWithRole;
    try {
      set({ loading: true, error: null });
      let res = await axios.post(
        "https://mern-week-9-10.onrender.com/common-api/login",
        userCredObj,
        { withCredentials: true }
      );

      const { token, user } = res.data.payload; // ← CHANGED (was res.data.payload directly)

      localStorage.setItem("token", token); // ← NEW

      set({
        loading: false,
        isAuthenticated: true,
        currentUser: user,  // ← CHANGED (was res.data.payload)
        token: token,       // ← NEW
      });
    } catch (err) {
      console.log("err is ", err);
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        error: err.response?.data?.error || "Login failed",
      });
    }
  },

  logout: async () => {
    try {
      set({ loading: true, error: null });
      await axios.get(
        "https://mern-week-9-10.onrender.com/common-api/logout",
        { withCredentials: true }
      );
      localStorage.removeItem("token"); // ← NEW
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        token: null, // ← NEW
      });
    } catch (err) {
      localStorage.removeItem("token"); // ← NEW (clear even on error)
      set({
        loading: false,
        isAuthenticated: false,
        currentUser: null,
        token: null, // ← NEW
        error: err.response?.data?.error || "Logout failed",
      });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token"); // ← NEW
    if (!token) return set({ loading: false, isAuthenticated: false }); // ← NEW
    try {
      set({ loading: true });
      const res = await axios.get(
        "https://mern-week-9-10.onrender.com/common-api/check-auth",
        {
          headers: { Authorization: `Bearer ${token}` }, // ← CHANGED (was withCredentials)
        }
      );
      set({
        currentUser: res.data.payload,
        isAuthenticated: true,
        loading: false,
        token, // ← NEW
      });
    } catch (err) {
      if (err.response?.status === 401) {
        localStorage.removeItem("token"); // ← NEW
        set({
          currentUser: null,
          isAuthenticated: false,
          loading: false,
          token: null, // ← NEW
        });
        return;
      }
      console.error("Auth check failed:", err);
      set({ loading: false });
    }
  },
}));
