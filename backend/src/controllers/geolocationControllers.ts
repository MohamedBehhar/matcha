import { Request, Response } from "express"; // Ensure proper typing
import geolocationServices from "../services/geolocationServices";

class geolocationControllers {
  constructor() {
    this.getUsersUnderRadius = this.getUsersUnderRadius.bind(this);
  }

  public async getUsersUnderRadius(req: Request, res: Response) {
    const { latitude, longitude, distance, user_id, max_age, min_age, interests } = req.query;
    console.log('latitude', latitude);
    console.log('longitude', longitude);
    console.log('distance', distance);
    console.log('user_id', user_id);
    console.log('max_age', max_age);
    console.log('min_age', min_age);
    console.log('interests', interests);
    try {
      const users = await geolocationServices.getUsersUnderRadius(
        Number(latitude),
        Number(longitude),
        Number(distance),
        user_id as string,
        Number(min_age),
        Number(max_age),
        (interests as string).split(",")
      );
      res.status(200).send(users);
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  }
}

export default new geolocationControllers();
