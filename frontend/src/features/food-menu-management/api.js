import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

const FOOD_MENU_ENDPOINT = "/api/foodmenus";

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "https://placehold.co/640x420?text=Food+Image";
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) return imagePath;
  const cleanedPath = imagePath.replace(/\\/g, "/").replace(/^\/+/, "");
  return `${API_BASE_URL}/${cleanedPath}`;
};

export const getFoodItems = async () => {
  const response = await api.get(FOOD_MENU_ENDPOINT);
  const payload = response.data;

  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.items)) {
    return payload.items;
  }

  return [];
};

export const createFoodItem = async (payload) => {
  const config = payload instanceof FormData
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : undefined;
  const response = await api.post(FOOD_MENU_ENDPOINT, payload, config);
  return response.data;
};

export const updateFoodItem = async (id, payload) => {
  const config = payload instanceof FormData
    ? { headers: { "Content-Type": "multipart/form-data" } }
    : undefined;
  const response = await api.put(`${FOOD_MENU_ENDPOINT}/${id}`, payload, config);
  return response.data;
};

export const rateFoodItem = async (id, stars) => {
  const response = await api.patch(`${FOOD_MENU_ENDPOINT}/${id}/rating`, { stars });
  return response.data;
};

export const downloadFoodReportPdf = async () => {
  const response = await api.get(`${FOOD_MENU_ENDPOINT}/reports/pdf`, {
    responseType: "blob",
  });

  const blobUrl = window.URL.createObjectURL(new Blob([response.data], { type: "application/pdf" }));
  const anchor = document.createElement("a");
  anchor.href = blobUrl;
  anchor.download = `food-report-${Date.now()}.pdf`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.URL.revokeObjectURL(blobUrl);
};

export const deleteFoodItem = async (id) => {
  const response = await api.delete(`${FOOD_MENU_ENDPOINT}/${id}`);
  return response.data;
};
