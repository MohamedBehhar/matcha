import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true, // ✅ Ensures cookies are sent
});

instance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error?.response?.status === 403) {
      window.location.href = "/signin";
    }

    if (error?.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // ✅ Prevents infinite loops

      try {
        await instance.post("/auth/refresh"); // ✅ New token stored in HttpOnly cookie
        return instance(originalRequest); // ✅ Retry failed request
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
