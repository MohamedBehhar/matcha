import axios from "axios";
import instance from "../axios";

const baseURL = 'http://localhost:3000/api/';

const getNotifications = async (user_id: string) => {
  try {
	const response = await axios.get(baseURL + `notifications/${user_id}`);
	return response.data;
  } catch (error) {
	throw error;
  }
};

const markAsRead = async (user_id: string) => {
  try {
	const response = await axios.put(baseURL + `notifications/${user_id}`);
	return response.data;
  } catch (error) {
	throw error;
  }
};

const getNotificationsCount = async (user_id: string) => {
  try {
	const response = await axios.get(baseURL + `notifications/count/${user_id}`);
	return response.data;
  } catch (error) {
	throw error;
  }
};

export { getNotifications, markAsRead, getNotificationsCount };