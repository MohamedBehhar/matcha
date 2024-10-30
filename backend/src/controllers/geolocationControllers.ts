import { Request, Response } from "express"; // Ensure proper typing
import geolocationServices from "../services/geolocationServices";

const getUsersUnderRadius = async (req: Request, res: Response) => {
	  const { latitude, longitude, radius } = req.query;
  try {
	const users = await geolocationServices.getUsersUnderRadius(
	  Number(latitude),
	  Number(longitude),
	  Number(radius)
	);
	console.log('09458903485349058340958340958349058349085340958');
	res.status(200).send(users);
  } catch (error) {
	console.error(error);
	res.status(500).send("Internal server error");
  }
};

const geolocationControllers = {
	  getUsersUnderRadius,
};

export default geolocationControllers;