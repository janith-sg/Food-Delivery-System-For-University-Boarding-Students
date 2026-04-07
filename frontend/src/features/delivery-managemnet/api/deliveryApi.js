import axios from "axios";

const deliveryApi = axios.create({
  baseURL: "/api/deliveries",
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

export const getDeliveryStats = async () => {
  return await deliveryApi.get("/stats");
};

export const getDeliveriesByRider = async (riderId) => {
  return await deliveryApi.get(`/rider/${riderId}`);
};

export const getRiderStats = async (riderId) => {
  return await deliveryApi.get(`/rider/${riderId}/stats`);
};

export const updateDeliveryLocation = async (id, data) => {
  return await deliveryApi.put(`/${id}/location`, data);
};

export const updateDeliveryRating = async (id, data) => {
  return await deliveryApi.put(`/${id}/rating`, data);
};

export const assignRiderToDelivery = async (id, data) => {
  return await deliveryApi.put(`/${id}/assign-rider`, data);
};