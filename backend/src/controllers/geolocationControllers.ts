import { Request, Response } from "express"; // Ensure proper typing
import geolocationServices from "../services/geolocationServices";

class geolocationControllers {
  constructor() {
    this.getUsersUnderRadius = this.getUsersUnderRadius.bind(this);
  }

  public async getUsersUnderRadius(req: Request, res: Response) {
    const { latitude, longitude, radius, user_id } = req.query;
    try {
      const users = await geolocationServices.getUsersUnderRadius(
        Number(latitude),
        Number(longitude),
        Number(radius),
        user_id as string
      );
      res.status(200).send(users);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }
}

export default new geolocationControllers();
