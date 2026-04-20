import axiosClient from "../services/axiosClient";

export const departmentAPI = {
  getAll: () => axiosClient.get("/departments"),
  create: (data) => axiosClient.post("/departments", data),
  update: (id, data) => axiosClient.put(`/departments/${id}`, data),
  delete: (id) => axiosClient.delete(`/departments/${id}`),
};