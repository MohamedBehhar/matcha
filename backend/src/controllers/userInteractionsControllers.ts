import { Request, Response } from "express";

import { handleResponse } from "../utils/decorators";

import UsersInteractionsServices from "../services/UsersInteractionsServices";
import { visitType } from "../types/interactionsTypes";

class UserInteractionsControllers {
  constructor() {
    this.likeAUser = this.likeAUser.bind(this);
    this.unlikeAUser = this.unlikeAUser.bind(this);
  }

  @handleResponse()
  public async likeAUser(req: Request, res: Response) {
    const body = req.body;
    return (await UsersInteractionsServices.likeAUser(body)) as unknown as void;
  }

  @handleResponse()
  public async unlikeAUser(req: Request, res: Response) {
    const body = req.body;
    return (await UsersInteractionsServices.unlikeAUser(
      body
    )) as unknown as void;
  }

  @handleResponse()
  public async blockAUser(req: Request, res: Response) {
    const body = req.body;
    return (await UsersInteractionsServices.blockAUser(
      body
    )) as unknown as void;
  }

  // @handleResponse()
  public async getMatches(req: Request, res: Response) {
    const { latitude, longitude, distance, user_id, age_gap, interests } =
      req.query;
    try {
      const users = await UsersInteractionsServices.getMatches(
        Number(latitude),
        Number(longitude),
        Number(distance),
        user_id as string,
        Number(age_gap),
        interests ? (interests as string).split(",") : null
      );
      res.status(200).send(users);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }

  @handleResponse()
  public async checkLike(req: Request, res: Response) {
    const { user_id, target_id } = req.params;
    console.log("user_id3", user_id);
    console.log("target_id3", target_id);
    return (await UsersInteractionsServices.checkLike(
      user_id,
      target_id
    )) as unknown as void;
  }

  @handleResponse()
  public async newVisit(req: Request, res: Response) {
    const { user_id, visited_id } = visitType.validate(req.body);
    return (await UsersInteractionsServices.newVisit(
      user_id,
      visited_id
    )) as unknown as void;
  }
}

export default new UserInteractionsControllers();
