import { Request, Response } from "express"; // Ensure proper typing
import authServices from "../services/authServices";
import { SignUpInput, signInInput } from "../types/authTypes";
import { checkUserNameAndEmail } from "../utils/authUtils";

const signUp = async (req: Request, res: Response) => {
  const { username, email, password, first_name, last_name }: SignUpInput =
    req.body;
  try {
    const isAlreadyUsed = await checkUserNameAndEmail(username, email);
    if (isAlreadyUsed) {
      res.status(400).send("Username or email already in use");
      return;
    }
    const user = await authServices.signUp({
      username,
      email,
      password,
      first_name,
      last_name,
    } as SignUpInput);
    if (user) {
      res.status(201).send(user);
    } else {
      res.status(400).send("Bad request");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal server error");
  }
};

const signIn = async (req: Request, res: Response) => {
  const { username, password } : signInInput = req.body;
  try {
    const user = await authServices.singIn(username, password);
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
}

const refresh = async (req: Request, res: Response) => {
  const { refresh_token } = req.body;
  try {
    const user = await authServices.refresh(refresh_token);
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
}

const authControllers = {
  signUp,
  signIn,
  refresh,
};

export default authControllers;
