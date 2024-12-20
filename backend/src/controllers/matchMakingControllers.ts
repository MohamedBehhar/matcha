import { Request, Response } from "express"; 

import { handleResponse } from "../utils/decorators";


import matchMakingServices from "../services/matchMakingServices";

class MatchMakingControllers {
	constructor() {
		this.likeAUser = this.likeAUser.bind(this);
		this.unlikeAUser = this.unlikeAUser.bind(this);
	}



	@handleResponse()
	public async likeAUser(req: Request, res: Response) {
		const body = req.body;
		return await matchMakingServices.likeAUser(body) as unknown as void;
	}

	@handleResponse()
	public async unlikeAUser(req: Request, res: Response) {
		const body = req.body;
		return await matchMakingServices.unlikeAUser(body) as unknown as void;
	}

	@handleResponse()
	public async getMatches(req: Request, res: Response) {
		const { latitude, longitude, distance, user_id, age_gap, interests } = req.query;
    try {
      const users = await matchMakingServices.getMatches(
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
}

const matchMakingControllers = new MatchMakingControllers();
export default matchMakingControllers;