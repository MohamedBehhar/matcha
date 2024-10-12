import { Request, Response } from "express"; // Ensure proper typing
import authServices from "../services/authServices";

const signUp = async (req: Request, res: Response) => {
  try {
    // Delegate the logic to the service
    const user = await authServices.signUp(req, res);
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

const authControllers = {
  signUp,
};

export default authControllers;
