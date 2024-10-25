import axios from "axios";
import instance from "../axios";

const getInterests = async () => {
  try {
	const response = await instance.get("/interests/get-interests");
	return response.data;
  } catch (error) {
	throw error;
  }
};

export { getInterests };