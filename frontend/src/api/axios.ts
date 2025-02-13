import axios from "axios";

export const getToken = () => localStorage.getItem("access_token");
export const getrefresh_token = () => localStorage.getItem("refresh_token");

const instance = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
});

instance.interceptors.request.use(
  (config: any) => {
    config.headers.Authorization = `Bearer ${getToken()}`;
    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response: any) => {
    return response;
  },
  async (error: any) => {
    const originalRequest = error.config;

    if (error?.response?.status === 403) {
      // No need to remove tokens from localStorage anymore
      window.location.href = "/signin";
    }

    if (error?.response?.status === 401 && !originalRequest._retry) {
      try {
        // Refresh token request will use the cookie automatically
        const response = await instance.post("/auth/refresh");

        if (!response.data.accessToken) {
          throw new Error("No access token provided");
        }

        originalRequest._retry = true;
        return instance(originalRequest); // 👈 Retry request
      } catch (refreshError) {
        throw refreshError;
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
