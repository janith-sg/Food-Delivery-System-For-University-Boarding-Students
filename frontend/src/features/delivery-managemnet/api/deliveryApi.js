import axios from "axios";

const deliveryApi = axios.create({
  baseURL: "http://localhost:5000/api/deliveries",
});

export const getAllDeliveries = async () => {
  return await deliveryApi.get("/");
};

export const createDelivery = async (deliveryData) => {
  return await deliveryApi.post("/", deliveryData);
};

export const updateDeliveryStatus = async (id, updatedData) => {
  return await deliveryApi.put(`/${id}/status`, updatedData);
};