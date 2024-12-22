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

const getUserInterests = async (user_id: string) => {
	  try {
	const response = await instance.get(`/interests/get-user-interests/${user_id}`);
	return response.data;
  } catch (error) {
	throw error;
  }
}

export { getInterests, getUserInterests };