import axios from "axios";
import instance from "../axios";

const getUsersUnderRadius = async (
  latitude: number,
  longitude: number,
  user_id: string | null,
  min_age: number,
  max_age: number,
  distance: number,
  interests: string
) => {
  if (!user_id) {
    throw new Error("User id is required");
  }
  try {
    const response = await instance.get(
      `/geolocation/get-users-under-radius?user_id=${user_id}&latitude=${latitude}&longitude=${longitude}&distance=${distance}&max_age=${max_age}&min_age=${min_age}&interests=${interests}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getUsersUnderRadius };
