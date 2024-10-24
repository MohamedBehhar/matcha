import Schema from "../lib/validation";



interface User {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  username: string;
  is_verified: boolean;
  is_authenticated: boolean;
}


interface Tokens{
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
  phone_number: Schema.string().required(),
});

const verifyTokenType = Schema.object({
  token: Schema.string().required(),
});

const TokenType  = Schema.object({
  access_token: Schema.string().required(),
});
const RefreshTYPE = Schema.object({
  refresh_token: Schema.string().required(),
});


export { User, signInInput, SignUpInput, signInType, signUpType, TokenType, Tokens, RefreshTYPE, verifyTokenType, verifyEmailReturn };