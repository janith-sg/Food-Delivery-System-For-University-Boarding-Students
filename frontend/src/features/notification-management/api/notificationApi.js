import axios from "axios";

const notificationApi = axios.create({
  baseURL: "http://localhost:5000/api/notifications",
});

export const getAllNotifications = async () => {
  return await notificationApi.get("/");
};

export const getUserNotifications = async (userId) => {
  return await notificationApi.get(`/${userId}`);
};

export const markNotificationAsRead = async (id) => {
  return await notificationApi.put(`/read/${id}`);
};

export const createNotification = async (data) => {
  return await notificationApi.post("/", data);
};