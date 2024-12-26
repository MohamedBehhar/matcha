import axios from "axios";
import instance from "../axios";

const getLocation = async () => {
  try {
	const response = await axios.get("https://ipapi.co/json/");
	return response.data;
  } catch (error) {
	throw error;
  }
};