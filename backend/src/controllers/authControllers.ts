import { Request, Response } from "express"; // Ensure proper typing
import authServices from "../services/authServices";
import { SignUpInput, signInInput } from "../types/authTypes";
import { checkUserNameAndEmail } from "../utils/authUtils";
import { BadRequestError } from "../lib/customError";
import orm from "../lib/orm";

class AuthControllers {
  constructor() {
    this.signUp = this.signUp.bind(this);
    this.signIn = this.signIn.bind(this);
    this.refresh = this.refresh.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
  }
  public async signUp(req: Request, res: Response) {
    const { username, email, password, first_name, last_name }: SignUpInput =
      req.body;
    try {
      const isAlreadyUsed = await checkUserNameAndEmail(username, email);
      if (isAlreadyUsed) {
        res.status(400).send("Username or email already in use");
        return;
      }
      return await orm.create("users", {
        username,
        email,
        password,
        first_name,
        last_name,
        is_verified: false,
      });
    } catch (error) {

      throw new BadRequestError("Bad request");
    }
  }

  public async signIn(req: Request, res: Response) {
    const { email, password }: signInInput = req.body;
    try {
      const user = await authServices.singIn(email, password);
      console.log(user);
      if (user) {
        if (false == user.is_verified) {
          res.status(400).send("Account not verified");
          return;
        }
        res.status(200).send({
          user,
        });
      } else {
        res.status(400).send("Bad request");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }

  public async refresh(req: Request, res: Response) {
    const { refresh_token } = req.body;
    console.log(refresh_token);
    try {
      const user = await authServices.refresh(refresh_token);
      console.log(user);
      if (user) {
        res.status(200).send({
          access_token: user.access_token,
        });
      } else {
        res.status(400).send("Bad request");
      }
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }


  public async verifyEmail(req: Request, res: Response): Promise<void> {
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
  }
}

export default new AuthControllers();