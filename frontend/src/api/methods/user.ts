import axios from "axios";
import instance from "../axios";
import { tr } from "date-fns/locale";

const getUser = async () => {
  try {
    const response = await instance.get("/user/me");
    return response.data;
  } catch (error) {
    throw error;
  }
};
const updateUser = async (formData: FormData, id: string) => {
  try {
    const response = await instance.patch(`/user/${id}`, formData);
    return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

const getUserById = async (id: number) => {
  try {
    const response = await instance.get(`/user/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const updateUserLocation = async (id: number | null, data: any) => {
  if (!id) return;
  try {
    const response = await instance.patch(`/user/${id}/location`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const addUserImages = async (formData: FormData, id: string) => {
  try {
    const response = await instance.patch(`/user/images/${id}`, formData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const getUserImages = async (id: string) => {
  console.log("userId: ", id);
  try {
    const response = await instance.get(`/user/images/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

const deleteUserImage = async (id: string) => {
  try {
    const response = await instance.delete(`/user/images/delete/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}

export {
  getUser,
  updateUser,
  getUserById,
  updateUserLocation,
  addUserImages,
  getUserImages,
  deleteUserImage
};
