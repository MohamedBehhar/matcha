interface SignUpInput {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface signInInput {
  username: string;
  password: string;
}

// Define the return type for your signUp function
interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  token: string;
  refresh_token: string;
  is_verified: boolean;
  access_token: string;
  password ?: string;
}

interface tokens {
  access_token: string;
  refresh_token: string;
}

export { SignUpInput, User, signInInput, tokens };
