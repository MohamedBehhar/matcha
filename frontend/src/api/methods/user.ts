import axios from "axios";
import instance from "../axios";

const getUser = async () => {
	  try {
	const response = await instance.get("/user/me");
	return response.data;
  } catch (error) {
	throw error;
  }
}

export { getUser };