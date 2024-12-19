import { Request, Response } from "express"; // Ensure proper typing
import geolocationServices from "../services/geolocationServices";

class geolocationControllers {
  constructor() {
    this.getUsersUnderRadius = this.getUsersUnderRadius.bind(this);
  }

  public async getUsersUnderRadius(req: Request, res: Response) {
    const { latitude, longitude, distance, user_id, max_age, min_age, interests } = req.query;
    try {
      const users = await geolocationServices.getUsersUnderRadius(
        Number(latitude),
        Number(longitude),
        Number(distance),
        user_id as string,
        Number(min_age),
        Number(max_age),
        interests ? (interests as string).split(",") : null
      );
      res.status(200).send(users);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }
}

export default new geolocationControllers();
