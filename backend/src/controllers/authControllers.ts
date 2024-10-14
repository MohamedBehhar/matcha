import { Request, Response } from "express"; // Ensure proper typing
import authServices from "../services/authServices";
import { SignUpInput, signInInput } from "../types/authTypes";
import { checkUserNameAndEmail } from "../utils/authUtils";

const signUp = async (req: Request, res: Response) => {
  const { username, email, password, first_name, last_name }: SignUpInput =
    req.body;
  try {
    // const isAlreadyUsed = await checkUserNameAndEmail(username, email);
    // if (isAlreadyUsed) {
    //   res.status(400).send("Username or email already in use");
    //   return;
    // }
    const user = await authServices.signUp({
      username,
      email,
      password,
      first_name,
      last_name,
    } as SignUpInput);
    if (user) {
      res.status(201).send("User created successfully, please verify email");
    } else {
      res.status(400).send("Bad request");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const signIn = async (req: Request, res: Response) => {
  const { username, password }: signInInput = req.body;
  try {
    const user = await authServices.singIn(username, password);
    console.log(user);
    if (user) {
      if (false == user.is_verified) {
        res.status(400).send("Account not verified");
        return;
      }
      res.status(200).send({
        access_token: user.access_token,
        refresh_token: user.refresh_token,
      });
    } else {
      res.status(400).send("Bad request");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const refresh = async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  console.log(refresh_token);
  try {
    const user = await authServices.refresh(refresh_token);
    console.log(user);
    if (user) {
      res.status(200).send({
        access_token: user.token,
      });
    } else {
      res.status(400).send("Bad request");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

export const verifyEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.query as { token: string };
  if (!token) {
    res.status(400).send("Invalid or missing token.");
    return;
  }

  try {
    const user = await authServices.verifyEmail(token);
    if (!user) {
      res.status(400).send("User not found.");
      return;
    }
    res.status(200).send(
      user
    );
  } catch (err) {
    res.status(400).send("Invalid or expired token.");
  }
};
const authControllers = {
  signUp,
  signIn,
  refresh,
  verifyEmail,
};

export default authControllers;
