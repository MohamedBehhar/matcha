type PasswordStrength =
  | "very-weak"
  | "weak"
  | "medium"
  | "strong"
  | "very-strong";

const verifyPassword = (pwd: string) => {
  let score = 0;

  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/\d/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;

  const strength: PasswordStrength =
    score <= 2 ? "very-weak" :
    score <= 3 ? "weak" :
    score <= 4 ? "medium" :
    score <= 5 ? "strong" :
    "very-strong";

  return {
    score,
    strength,
  };
};

export default verifyPassword;