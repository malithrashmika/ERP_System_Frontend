import axiosClient from "../../services/axiosClient";

const registerUser = async (userData) => {
  const response = await axiosClient.post("/auth/register", userData);
  return response.data;
};

const loginUser = async (userData) => {
  const response = await axiosClient.post("/auth/login", userData);
  return response.data;
};

const forgotPasswordRequest = async (email) => {
  const response = await axiosClient.post("/auth/forgot-password", { email });
  return response.data;
};

const verifyResetOtpRequest = async (data) => {
  const response = await axiosClient.post("/auth/verify-reset-otp", data);
  return response.data;
};

const resetPasswordRequest = async (data) => {
  const response = await axiosClient.put("/auth/reset-password", data);
  return response.data;
};

const authService = {
  registerUser,
  loginUser,
  forgotPasswordRequest,
  verifyResetOtpRequest,
  resetPasswordRequest,
};

export default authService;