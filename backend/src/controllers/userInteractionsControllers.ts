import { Request, Response } from "express";

import { handleResponse } from "../utils/decorators";

import UsersInteractionsServices from "../services/UsersInteractionsServices";

class UserInteractionsControllers {
  constructor() {
    this.likeAUser = this.likeAUser.bind(this);
    this.unlikeAUser = this.unlikeAUser.bind(this);
    this.blockAUser = this.blockAUser.bind(this);
    this.getMatches = this.getMatches.bind(this);
    this.checkLike = this.checkLike.bind(this);
    this.newVisit = this.newVisit.bind(this);
    this.getFriends = this.getFriends.bind(this);
  }

  @handleResponse()
  public async likeAUser(req: Request, res: Response) {
    console.log("likeAUser controller called===============> ", req.body);
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
    const {
      latitude,
      longitude,
      distance,
      user_id,
      age_gap,
      interests,
      sort,
      min_rating,
    } = req.query;
    try {
      const interestIds = interests
        ? (interests as string)
            .split(",")
            .map((s) => parseInt(s.trim(), 10))
            .filter((n) => !isNaN(n))
        : null;
      const users = await UsersInteractionsServices.getMatches(
        Number(latitude),
        Number(longitude),
        Number(distance),
        user_id as string,
        Number(age_gap),
        interestIds?.length ? interestIds : null,
        {
          sort: (sort as string) || undefined,
          min_rating:
            min_rating !== undefined && min_rating !== ""
              ? Number(min_rating)
              : null,
        }
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
    return (await UsersInteractionsServices.checkLike(
      user_id,
      target_id
    )) as unknown as void;
  }

  @handleResponse()
  public async newVisit(req: Request, res: Response) {
    const { user_id, visited_id } = req.body;
    return (await UsersInteractionsServices.newVisit(
      user_id,
      visited_id
    )) as unknown as void;
  }

  @handleResponse()
  public async getFriends(req: Request, res: Response) {
    const { user_id } = req.params;
    return (await UsersInteractionsServices.getFriends(
      user_id as string
    )) as unknown as void;
  }
}

export default new UserInteractionsControllers();
