import axios from "axios";
import instance from "../axios";

const getUsersUnderRadius = async (
  latitude: number,
  longitude: number,
  radius: number,
  user_id: string | null,
  age: number,
  distance: number,
  interests: string
) => {
  if (!user_id) {
    throw new Error("User id is required");
  }
  try {
    const response = await instance.get(
      `/geolocation/get-users-under-radius?user_id=${user_id}&latitude=${latitude}&longitude=${longitude}&radius=${radius}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export { getUsersUnderRadius };
