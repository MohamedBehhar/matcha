import instance from "../axios";

const baseURL = 'http://localhost:3000/api/';


// router.get("/get-msgs/:user_id", msgsControllers.getMsgs);
// router.get("/get-msgs-count/:user_id", msgsControllers.getMsgsCount);
// router.post("/save-msgs", msgsControllers.saveMsgs);
// router.post("/mark-as-read/:user_id", msgsControllers.markAsRead);
// router.get("/get-conversations/:user_id", msgsControllers.getConversations);

const getMsgs = async (user_id: string) => {
	  try {
	const response = await instance.get(baseURL + `messages/get-msgs/${user_id}`);
	return response.data;
  } catch (error) {
	throw error;
  }
}

const getMsgsCount = async (user_id: string) => {
  try {
	const response = await instance.get(baseURL + `messages/get-msgs-count/${user_id}`);
	return response.data;
  } catch (error) {
	throw error;
  }
};

const saveMsgs = async (body: any) => {
  try {
	const response = await instance.post(baseURL + `messages/save-msgs`, body);
	return response.data;
  } catch (error) {
	throw error;
  }
};

const markAsRead = async (user_id: string) => {
  try {
	const response = await instance.post(baseURL + `messages/mark-as-read/${user_id}`);
	return response.data;
  } catch (error) {
	throw error;
  }
};

const getConversations = async (user_id: string) => {
  try {
	const response = await instance.get(baseURL + `messages/get-conversations/${user_id}`);
	return response.data;
  } catch (error) {
	throw error;
  }
};

export { getMsgs, getMsgsCount, saveMsgs, markAsRead, getConversations };