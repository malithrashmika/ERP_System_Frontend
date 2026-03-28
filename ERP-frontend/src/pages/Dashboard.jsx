import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../features/auth/authSlice";

function Dashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear Redux state
    dispatch(logout());

    // Clear localStorage
    localStorage.removeItem("token");

    // Redirect to login
    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen text-3xl font-bold gap-6">
      <span>ERP Dashboard</span>

      <button
        onClick={handleLogout}
        className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
      >
        Sign Out
      </button>
    </div>
  );
}

export default Dashboard;