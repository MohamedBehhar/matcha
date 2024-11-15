import instance from "../axios";

const likeAUser = async (body: any) => {
  try {
    const response = await instance.post("/matchmaking/like", body);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const unlikeAUser = async (body: any) => {
  try {
    const response = await instance.post("/matchmaking/unlike", body);
    return response.data;
  } catch (error) {
    throw error;
  }
}


export { likeAUser, unlikeAUser };