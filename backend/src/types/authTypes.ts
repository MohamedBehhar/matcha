import Schema from "../lib/validation";

interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username: string;
  is_verified: boolean;
  is_authenticated: boolean;
}

interface Tokens {
  access_token: string;
  refresh_token: string;
}

interface signInInput {
  email: string;
  password: string;
}

interface SignUpInput {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username: string;
}

interface ResetPasswordInput {
  token: string;
  password: string;
}

interface ForgotPasswordInput {
  email: string;
}

interface verifyEmailReturn {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  username: string;
  is_verified: boolean;
  is_authenticated: boolean;
  access_token: string;
  refresh_token: string;
}

const signInType = Schema.object({
  email: Schema.string().email().required(),
  password: Schema.string().min(6).required(),
});

const signUpType = Schema.object({
  email: Schema.string().email().required(),
  password: Schema.string().min(6).required(),
  first_name: Schema.string().required(),
  last_name: Schema.string().required(),
  username: Schema.string().required(),
  date_of_birth: Schema.string().required(),
});



const verifyTokenType = Schema.object({
  token: Schema.string().required(),
});

const TokenType = Schema.object({
  access_token: Schema.string().required(),
});
const RefreshTYPE = Schema.object({
  refresh_token: Schema.string().required(),
});

const verifyEmailReturn = Schema.object({
  id: Schema.number().required(),
  email: Schema.string().email().required(),
  first_name: Schema.string().required(),
  last_name: Schema.string().required(),
  username: Schema.string().required(),
  is_verified: Schema.boolean().required(),
  is_authenticated: Schema.boolean().required(),
  access_token: Schema.string().required(),
  refresh_token: Schema.string().required(),
});

const verifyEmailType = Schema.object({
  token: Schema.string().required(),
});

const forgotPasswordType = Schema.object({
  email: Schema.string().email().required(),
});

const resetPasswordType = Schema.object({
  token: Schema.string().required(),
  password: Schema.string().min(6).required(),
});

export {
  User,
  signInInput,
  SignUpInput,
  signInType,
  signUpType,
  TokenType,
  Tokens,
  RefreshTYPE,
  verifyTokenType,
  verifyEmailReturn,
  verifyEmailType,
  forgotPasswordType,
  ForgotPasswordInput,
  resetPasswordType,
  ResetPasswordInput,
};
