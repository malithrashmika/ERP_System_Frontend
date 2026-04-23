import axiosClient from "../services/axiosClient";

export const employeeAPI = {
  getAll: () => axiosClient.get("/employees"),
  create: (formData) => axiosClient.post("/employees", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  update: (id, formData) => axiosClient.put(`/employees/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  delete: (id) => axiosClient.delete(`/employees/${id}`),
};