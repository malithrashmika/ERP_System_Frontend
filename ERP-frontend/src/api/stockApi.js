import axiosClient from "../services/axiosClient";

export const stockAPI = {
  getAll: () => axiosClient.get("/stock"),
  create: (data) => axiosClient.post("/stock", data),
  update: (id, data) => axiosClient.put(`/stock/${id}`, data),
  delete: (id) => axiosClient.delete(`/stock/${id}`),
};