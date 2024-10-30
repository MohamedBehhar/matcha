import axios from "axios";
import instance from "../axios";

const getUsersUnderRadius = async (latitude: number, longitude: number, radius: number) => {
  try {
	const response = await instance.get(`/geolocation/get-users-under-radius?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
	return response.data;
  } catch (error) {
	throw error;
  }
};

export { getUsersUnderRadius };