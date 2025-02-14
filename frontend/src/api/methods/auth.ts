import axios from "axios";
import instance from "../axios";
import { SignUpInput, signInInput } from "@/types/authTypes";

const baseURL = "http://localhost:3000/api/";

const signUp = async (signUpInput: SignUpInput) => {
  try {
    const response = await axios.post(baseURL + "auth/signup", signUpInput, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const signIn = async (signInInput: signInInput) => {
  try {
    const response = await axios.post(baseURL + "auth/signin", signInInput, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const verifyEmail = async (token: string) => {
  try {
    const response = await instance.get(`/auth/verify/${token}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const refreshToken = async () => {
  const refreshToken = localStorage.getItem("refresh_token");
  try {
    const response = await instance.post("/auth/refresh", {
      refresh_token: refreshToken,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const forgotPassword = async (email: string) => {
  try {
    const response = await instance.post("/auth/forgot-password", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const resetPassword = async (password: string, token: string) => {
  try {
    const response = await instance.post("/auth/reset-password", {
      password,
      token,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

const logout = async () => {
  try {
    await instance
      .post(
        "/auth/logout",
        {},
        {
          withCredentials: true,
        }
      )
      .then(() => {
        window.location.href = "/signin";
      });
  } catch (error) {
    throw error;
  }
};

export {
  signUp,
  signIn,
  verifyEmail,
  refreshToken,
  resetPassword,
  forgotPassword,
  logout,
};
