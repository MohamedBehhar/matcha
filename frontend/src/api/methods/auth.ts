import axios from "axios";
import instance from "../axios";
import { SignUpInput, signInInput } from "@/types/authTypes";

const hadelTokens = (
  { access_token, refresh_token }: { access_token: string; refresh_token: string },
) => {
  localStorage.setItem('accessToken', access_token);
  cookie('refreshToken', refresh_token, {
    httpOnly: true,
    secure: true, // Set to true for HTTPS
    sameSite: 'Strict', // Adjust based on your needs
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
  
}

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

export { signUp, signIn, verifyEmail };
