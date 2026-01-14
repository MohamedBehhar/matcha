import axios from "axios";
import useUserStore from "@/store/userStore";

const instance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔁 1️⃣ Try refresh on 401
    if (
      error?.response?.status === 401 &&
      !originalRequest?._retry
    ) {
      originalRequest._retry = true;

      try {
        await instance.post("/auth/refresh");
        return instance(originalRequest);
      } catch (refreshError) {
        // ❌ refresh failed → logout
        useUserStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }

    // ⛔ 2️⃣ 403 = forbidden (NO redirect)
    if (error?.response?.status === 403) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default instance;
