import { Request, Response } from "express"; // Ensure proper typing
import authServices from "../services/authServices";
import { SignUpInput, signInInput } from "../types/authTypes";
import { BadRequestError } from "../lib/customError";// Import the ClassMethodDecoratorContext type
import { handleResponse } from "../utils/decorators";
import env from "../utils/env";
import Schema from "../lib/validation";


class AuthControllers {

  @handleResponse()
  public async signUp(req: Request) {
    const { username, email, password, first_name, last_name }: SignUpInput =
      req.body;
    try {
      return await authServices.signUp({
        username,
        email,
        password,
        first_name,
        last_name,
      })
    } catch (error) {
      throw new BadRequestError("Bad request");
    }
  }


  @handleResponse()
  public async signIn(req: Request, res: Response) {
    const { email, password }: signInInput = req.body;
    try {
      const user = await authServices.singIn(email, password);
      return user;
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }

  @handleResponse()
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

  @handleResponse()
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