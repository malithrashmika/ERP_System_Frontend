import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  forgotPassword,
  verifyResetOtp,
  clearAuthMessages,
  resetOtpState,
} from "../features/auth/authSlice";
import { toast } from "sonner";

function ForgotPassword() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.auth);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [otpStep, setOtpStep] = useState(false);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    try {
      const result = await dispatch(forgotPassword(email)).unwrap();
      toast.success(result.message || "OTP sent successfully");
      dispatch(clearAuthMessages());
      setOtpStep(true);
    } catch (error) {
      toast.error(error || "Failed to send OTP");
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otp.trim()) {
      toast.error("OTP is required");
      return;
    }

    try {
      const result = await dispatch(verifyResetOtp({ email, otp })).unwrap();
      toast.success(result.message || "OTP verified");
      dispatch(clearAuthMessages());
      dispatch(resetOtpState());
      navigate("/reset-password", { state: { email } });
    } catch (error) {
      toast.error(error || "OTP verification failed");
    }
  };

  const handleResendOtp = async () => {
    try {
      const result = await dispatch(forgotPassword(email)).unwrap();
      toast.success(result.message || "OTP resent successfully");
      dispatch(clearAuthMessages());
    } catch (error) {
      toast.error(error || "Failed to resend OTP");
    }
  };

  return (
    <div className="grid grid-cols-2 min-h-screen">
      <div
        className="relative bg-gradient-to-b from-purple-700 to-indigo-800 
        flex items-center justify-center p-12 text-white
        rounded-r-[25px] shadow-[8px_0_25px_rgba(0,0,0,0.35)]"
      >
        <p className="text-center text-x leading-relaxed max-w-md">
          Re-imagining inventory management experience with advance data
          analytics for optimum performance
        </p>

        <p className="absolute bottom-6 left-8 text-xs text-purple-200">
          © TheUnityWare 2024
        </p>
      </div>

      <div className="flex items-center justify-center bg-gray-50 shadow-[-8px_0_20px_rgba(0,0,0,0.08)]">
        <div className="w-[420px]">
          <h1 className="text-3xl font-semibold mb-2">
            {otpStep ? "Enter OTP" : "Forgot password?"}
          </h1>

          <p className="text-gray-500 mb-6">
            {otpStep
              ? "Enter the OTP sent to your email."
              : "No worries, we’ll send you reset instructions."}
          </p>

          {!otpStep ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>

              <p className="text-center text-sm text-gray-500 mt-6">
                Back to
                <span
                  onClick={() => navigate("/login")}
                  className="text-purple-600 cursor-pointer ml-1"
                >
                  Sign in
                </span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full mt-1 p-3 border rounded-lg bg-gray-100 text-gray-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium">OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition"
              >
                {loading ? "Verifying..." : "Verify OTP"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                className="w-full border py-3 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                Resend OTP
              </button>

              <p className="text-center text-sm text-gray-500 mt-6">
                Back to
                <span
                  onClick={() => navigate("/login")}
                  className="text-purple-600 cursor-pointer ml-1"
                >
                  Sign in
                </span>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;