import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";
import nodemailer from "nodemailer";
import { SignUpInput, User, tokens } from "../types/authTypes";
import { deleteKey, setKey } from "../utils/redis";

const db: Pool = require("../db/db");

const accessTokenMaxAge = 1 * 30; // 1 minute
const refreshTokenMaxAge = 2 * 24 * 60 * 60; // 2 days

const hashString = async (string: string, base:number): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(string, salt);
}

const createTokens = async (user: User): Promise<{
  access_token: string;
  refresh_token: string;
}> => {
  const access_token = jwt.sign({ email:user.email,id:user.id }, process.env.JWT_SECRET as string, {
    expiresIn: accessTokenMaxAge,
  });

  const refresh_token = jwt.sign({ email:user.email, id:user.id }, process.env.REFRESH_SECRET as string, {
    expiresIn: refreshTokenMaxAge,
  });

  return { access_token, refresh_token };
};



const verifyToken = async (token: string, secret:string): Promise<boolean> => {
  try {
    jwt.verify(token, secret);
  } catch (error) {
    console.log("error", error);
    return false;
  }
  return true;
}



export const signUp = async ({
  username,
  email,
  password,
  first_name,
  last_name,
}: SignUpInput): Promise<User | undefined> => {
  try {
   
    const hashedPassword = await hashString(password, 10);
    const newUser = await db
      .query(
        "INSERT INTO users (username, password, email, first_name, last_name, is_verified) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
        [username, hashedPassword, email, first_name, last_name, false]
      )
      .then((result: any) => {
        const tokens = createTokens(result.rows[0]);
        return {
          ...result.rows[0],
          ...tokens,
        }
      });

    if (newUser) {
      const transporter = nodemailer.createTransport({
        service: "Gmail", // or another email service
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your account",
        html: `<p>Click <a href="http://localhost:3000/api/auth/verify?token=${"test"}">here</a> to verify your account.</p>`,
      };

      await transporter.sendMail(mailOptions);
    }
    return newUser;
  } catch (err) {
    console.log("Error: ", err);
    throw err;
  }
};


const singIn = async (
  email: string,
  password: string
): Promise<User | undefined> => {
  try {
    const user = await db
      .query("SELECT * FROM users WHERE email = $1", [email])
      .then((result: any) => {
        return result.rows[0];
      });
    if (!user) {
      return undefined;
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return undefined;
    }
    console.log("user", user.is_verified);

    if (false == user.is_verified) {
      return { ...user };
    }

    const tokens = await createTokens(user);
    await setKey(`access_token_${user.email}`, tokens.access_token);
    await setKey(`refresh_token_${user.email}`, tokens.refresh_token);

    return {
      ...user,
      ...tokens,
    };
  } catch (err) {
    console.log("Error: ", err);
    throw err;
  }
};

const logout = async (email: string): Promise<void> => {
  try {
    await deleteKey(`access_token_${email}`);
    await deleteKey(`refresh_token_${email}`);
  } catch (err) {
    console.log("Error: ", err);
    throw err;
  }
}

const refresh = async (refresh_token: string): Promise<{
  access_token: string;
  refresh_token: string;
} | undefined> => {
  try {
    const checkToken = await verifyToken(refresh_token, process.env.REFRESH_SECRET as string);
    if (!checkToken) {
      throw new Error("Invalid token"); 
    }
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_SECRET as string) as {
      email: string;
    };
    const user = await db
      .query("SELECT * FROM users WHERE email = $1", [decoded.email])
      .then((result: any) => {
        return result.rows[0];
      });
    if (!user) {
      return undefined;
    }
    const tokens = await createTokens(user);
    await setKey(`access_token_${user.email}`, tokens.access_token);
    await setKey(`refresh_token_${user.email}`, tokens.refresh_token);
    return {
      ...tokens,
    }

  } catch (err) {
    console.log("Error: ", err);
    throw err;
  }
};

export const verifyEmail = async (token: string): Promise<User | null> => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      email: string;
    };

    const user: User | null = await db
      .query("UPDATE users SET is_verified = $1 WHERE email = $2 RETURNING *", [
        true,
        decoded.email,
      ])
      .then((result: { rows: User[] }) => result.rows[0]);

    if (!user) {
      return null;
    }
    //// hna makayn lach traja3 user
    return user;
  } catch (err) {
    throw err;
  }
};

const authServices = {
  signUp,
  singIn,
  refresh,
  verifyEmail,
  logout,
};

export default authServices;
