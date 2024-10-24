import axios from "axios";
import instance from "../axios";
import { SignUpInput, signInInput } from "@/types/authTypes";



const signUp = async (signUpInput: SignUpInput) => {
  try {
    console.log(signUpInput);
    const response = await instance.post("/auth/signup", signUpInput);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const signIn = async (signInInput: signInInput) => {
  try {
    const response = await instance.post("/auth/signin", signInInput);
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

export { signUp, signIn, verifyEmail, refreshToken };
