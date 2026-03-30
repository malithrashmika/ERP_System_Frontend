import { Link } from "react-router-dom";
import { FaBoxOpen, FaWarehouse, FaChartBar, FaClipboardList } from "react-icons/fa";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Navbar */}
      <div className="flex items-center justify-between px-10 py-6">
        <img src="/assets/logo.svg" alt="logo" className="h-8" />

        <Link
          to="/login"
          className="bg-purple-600 text-white px-5 py-2 rounded-full flex items-center gap-2 hover:bg-purple-700 transition"
        >
          Sign in →
        </Link>
      </div>

      {/* Hero Section */}
      <div className="text-center px-6 mt-10 relative">
        <h1 className="text-4xl md:text-5xl font-semibold leading-tight">
          Technology doesn’t have to feel like a different language
        </h1>

        <p className="mt-4 text-gray-600">
          Simplified inventory management to drive business growth and
          strategically scale operations
        </p>

        {/* Wave Background */}
        <div className="mt-10 flex justify-center">
          <img
            src="/assets/vector.svg"
            alt="wave"
            className="w-full max-w-5xl"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="grid md:grid-cols-2 gap-10 px-10 mt-16 items-start">
        <div className="space-y-10">
          <Feature
            icon={<FaBoxOpen />}
            title="Order Management"
            desc="Efficiently manage all your sales and purchasing activities with our platform. Handle invoices and bills seamlessly while tracking payments with ease."
          />

          <Feature
            icon={<FaClipboardList />}
            title="Inventory Tracking"
            desc="Meticulously monitor a wide range of inventory items and effortlessly track item movements, transfer products between locations."
          />

          <Feature
            icon={<FaWarehouse />}
            title="Warehouse Management"
            desc="Centrally manage your stock across multiple warehouses and generate detailed reports specific to each warehouse."
          />

          <Feature
            icon={<FaChartBar />}
            title="Reports & Analytics"
            desc="Access a variety of reports and gain insights into inventory aging, vendor payments, sales details."
          />
        </div>

        {/* Dashboard Image */}
        <div className="flex justify-center">
          <img
            src="/assets/dashboard.svg"
            alt="dashboard"
            className="rounded-xl shadow-xl w-full max-w-md"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-400 mt-20 pb-6">
        © TheUnityWare 2024
      </div>
    </div>
  );
}

function Feature({ icon, title, desc }) {
  return (
    <div className="flex gap-4 items-start">
      <div className="text-purple-600 text-2xl">{icon}</div>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-gray-600 text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
}
