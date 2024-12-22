import { handleResponse } from "../utils/decorators";
import { Request, Response } from "express";
import interestsServices from "../services/interestsServices";

class InterestsControllers {
  constructor() {
	this.getInterests = this.getInterests.bind(this);
  }

  @handleResponse()
  public async getInterests(req: Request, res: Response) {
	return await interestsServices.getInterests() as unknown as void;
  }

  @handleResponse()
  public async getUserInterests(req: Request, res: Response) {
    const { user_id } = req.params;
    return await interestsServices.getUserInterests(parseInt(user_id)) as unknown as void;
  }
}

export default new InterestsControllers();