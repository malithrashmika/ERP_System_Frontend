import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  resetPassword,
  clearAuthMessages,
} from "../features/auth/authSlice";
import { toast } from "sonner";
import { FiEye, FiEyeOff } from "react-icons/fi";

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { loading } = useSelector((state) => state.auth);

  const email = location.state?.email || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password.trim() || !confirmPassword.trim()) {
      toast.error("All fields are required");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      const result = await dispatch(
        resetPassword({
          email,
          password,
          confirmPassword,
        })
      ).unwrap();

      toast.success(result.message || "Password reset successful");
      dispatch(clearAuthMessages());
      navigate("/login");
    } catch (error) {
      toast.error(error || "Password reset failed");
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
          <h1 className="text-3xl font-semibold mb-2">Set new password</h1>

          <p className="text-gray-500 mb-6">
            Create a new password for your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
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
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mt-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-500"
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-medium transition"
            >
              {loading ? "Resetting..." : "Reset password"}
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
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;