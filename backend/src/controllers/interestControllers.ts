import { Request, Response } from "express";
import interestsServices from "../services/interestServices"; // Import the services

// Controller function to return tags
const returnTags = async (req: Request, res: Response) => {
  try {
    const tags = await interestsServices.returnIntersts(); // Fetch tags from service
    res.status(200).json(tags); // Return tags in the response
  } catch (err) {
    res.status(500).json({ error: err }); // Handle errors
  }
};

const tagsControllers = {
  returnTags,
};

export default tagsControllers;
