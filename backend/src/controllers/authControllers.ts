import { Request, Response, NextFunction } from "express";
import authServices from "../services/authServices";
import {
  RefreshTYPE,
  SignUpInput,
  TokenType,
  forgotPasswordType,
  resetPasswordType,
  signInInput,
  signInType,
  signUpType,
  verifyTokenType,
} from "../types/authTypes";
import { handleResponse } from "../utils/decorators";

class AuthControllers {
  constructor() {
    this.signUp = this.signUp.bind(this);
    this.signIn = this.signIn.bind(this);
    this.refresh = this.refresh.bind(this);
    this.verifyEmail = this.verifyEmail.bind(this);
  }
  @handleResponse()
  public async signUp(req: Request, res: Response) {
    const body: SignUpInput = signUpType.validate(req.body);
    return (await authServices.signUp(body)) as unknown as void;
  }
  @handleResponse()
  public async signIn(req: Request, res: Response) {
    const body: signInInput = signInType.validate(req.body);
    const user = await authServices.singIn(body, res);
    return user as unknown as void;
  }
  @handleResponse()
  public async logout(req: Request, res: Response) {
    const body: {
      refresh_token: string | undefined;
    } = RefreshTYPE.validate(req.body);
    if (!body.refresh_token) throw new Error("Invalid token");
    await authServices.logout(body.refresh_token);
    return { message: "Logout successful" } as unknown as void;
  }
  @handleResponse()
  public async refresh(req: Request, res: Response) {
    const body: {
      refresh_token: string | undefined;
    } = RefreshTYPE.validate(req.body);
    if (!body.refresh_token) throw new Error("Invalid token");
    const user = await authServices.refresh(body.refresh_token);
    return user as unknown as void;
  }

  @handleResponse()
  public async verifyEmail(req: Request, res: Response) {
    const body: {
      token: string | undefined;
    } = verifyTokenType.validate(req.params);
    if (!body.token) throw new Error("Invalid token");
    const user = await authServices.verifyEmail(body.token);
    return user as unknown as void;
  }

  @handleResponse()
  public async forgotPassword(req: Request, res: Response) {
    const body: {
      email: string | undefined;
    } = forgotPasswordType.validate(req.body);
    if (!body.email) throw new Error("Invalid email");
    const user = await authServices.forgotPassword(body.email);
    console.log("- - - user: ", user);
    return user as unknown as void;
  }

  @handleResponse()
  public async resetPassword(req: Request, res: Response) {
    const body: {
      token: string | undefined;
      password: string | undefined;
    } = resetPasswordType.validate(req.body);
    console.log(body);
    if (!body.token || !body.password)
      throw new Error("Invalid token or password");
    const user = await authServices.resetPassword(body.token, body.password);
    return user as unknown as void;
  }

  // Google OAuth Login
  public googleLogin(req: Request, res: Response, next: NextFunction) {
    authServices.googleLogin()(req, res, next);
  }

  // Google OAuth Callback
  public googleCallback(req: Request, res: Response, next: NextFunction) {
    return authServices.googleCallback(req, res, next);
  }
}

export default new AuthControllers();
