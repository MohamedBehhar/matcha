import { Request, Response } from "express"; 

import { handleResponse } from "../utils/decorators";


import matchMakingServices from "../services/matchMakingServices";

class MatchMakingControllers {
	constructor() {
		this.likeAUser = this.likeAUser.bind(this);
	}



	@handleResponse()
	public async likeAUser(req: Request, res: Response) {
		const body = req.body;
		return await matchMakingServices.likeAUser(body) as unknown as void;
	}
}

const matchMakingControllers = new MatchMakingControllers();
export default matchMakingControllers;