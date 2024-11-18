import axios from "axios";
import instance from "../axios";

const getTags = async () => {
	  try {
	const response = await instance.get("/tags");
	return response.data;
  } catch (error) {
	throw error;
  }
};

export { getTags };