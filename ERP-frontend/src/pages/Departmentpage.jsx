import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} from "../features/slices/Departmentslice";
import axiosClient from "../services/axiosClient";
import {
  Search, Filter, Download, ChevronLeft, ChevronRight,
  Calendar, Pencil, Trash2, Eye, X, Plus, AlertTriangle,
  TrendingUp, Upload,
} from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, percent, purple }) => (
  <div className={`rounded-xl p-6 border ${purple ? "bg-[#7C3AED] border-[#7C3AED]" : "bg-white border-gray-200"}`}>
    <p className={`text-sm font-medium mb-3 ${purple ? "text-purple-100" : "text-gray-500"}`}>{title}</p>
    <p className={`text-4xl font-bold mb-4 ${purple ? "text-white" : "text-gray-800"}`}>{value}</p>
    <div className={`flex items-center gap-1.5 text-xs font-medium ${purple ? "text-purple-100" : "text-gray-500"}`}>
      <TrendingUp className="w-3.5 h-3.5" />
      <span>{percent}% vs last month</span>
    </div>
  </div>
);

// ─── Confirm Modal ────────────────────────────────────────────────────────────
const ConfirmModal = ({ message, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-2xl shadow-2xl p-10 w-full max-w-md text-center">
      <div className="flex justify-center mb-5">
        <AlertTriangle className="w-14 h-14 text-amber-400" strokeWidth={1.5} />
      </div>
      <p className="text-gray-800 font-semibold text-lg leading-snug mb-1">{message}</p>
      <p className="text-gray-500 text-base mb-8">Are you sure?</p>
      <div className="flex gap-4">
        <button onClick={onConfirm} className="flex-1 bg-[#7C3AED] text-white py-3 rounded-xl font-semibold text-base hover:bg-[#6D28D9] transition">Yes</button>
        <button onClick={onCancel} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold text-base hover:bg-gray-50 transition">No</button>
      </div>
    </div>
  </div>
);

// ─── View Modal ───────────────────────────────────────────────────────────────
const ViewModal = ({ dept, onClose }) => {
  if (!dept) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center px-7 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Department Details</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-7 py-5 space-y-4">
          {[
            { label: "Department Name", value: dept.name || "—" },
            { label: "Department ID",   value: dept._id?.slice(-10).toUpperCase() || "—" },
            { label: "Warehouse ID",    value: dept.warehouseId || "—" },
            { label: "Manager ID",      value: dept.managerId || "—" },
            { label: "Email",           value: dept.email || "—" },
            { label: "Phone Number",    value: dept.phone || "—" },
            { label: "Date of Creation",value: dept.createdAt ? new Date(dept.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center">
              <span className="text-xs text-gray-500">{label}</span>
              <span className="text-xs font-medium text-gray-800">{value}</span>
            </div>
          ))}
        </div>
        <div className="px-7 pb-6">
          <button onClick={onClose} className="w-full border border-gray-200 text-gray-700 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">Close</button>
        </div>
      </div>
    </div>
  );
};

// ─── Department Form Modal (Add / Edit) ───────────────────────────────────────
const DepartmentFormModal = ({ mode, dept, onClose, onSubmit, loading }) => {
  const isEdit = mode === "edit";

  const [name,        setName]        = useState(dept?.name        || "");
  const [managerId,   setManagerId]   = useState(dept?.managerId   || "");
  const [warehouseId, setWarehouseId] = useState(dept?.warehouseId || "");
  const [date,        setDate]        = useState(
    dept?.createdAt
      ? new Date(dept.createdAt).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [showConfirm, setShowConfirm] = useState(false);

  const [managerOptions,   setManagerOptions]   = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [loadingOptions,   setLoadingOptions]   = useState(false);

  useEffect(() => {
    const fetchOptions = async () => {
      setLoadingOptions(true);
      try {
        const [manRes, warRes] = await Promise.all([
          axiosClient.get("/employees"),
          axiosClient.get("/warehouses"),
        ]);
        setManagerOptions(manRes.data);
        setWarehouseOptions(warRes.data);
      } catch {
        toast.error("Failed to load options");
      } finally {
        setLoadingOptions(false);
      }
    };
    fetchOptions();
  }, []);

  const handleSubmit = () => {
    if (!name)        { toast.error("Please enter Department Name"); return; }
    if (!managerId)   { toast.error("Please assign a Manager");      return; }
    if (!warehouseId) { toast.error("Please select a Warehouse");    return; }
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onSubmit({ name, managerId, warehouseId, createdAt: date });
    setShowConfirm(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">
              {isEdit ? "Edit Department" : "Add New Department"}
            </h2>
            <div className="flex items-center gap-3">
              {/* Bulk Upload */}
              {!isEdit && (
                <label className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#7C3AED] hover:text-[#7C3AED] cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5" />
                  Bulk Upload
                  <input type="file" className="hidden" />
                </label>
              )}
              <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="px-8 py-6">
            {/* Row 1: Department Name + Date of Creation */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Department Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter Full Name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] placeholder-gray-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Date of Creation</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Assign Manager + Warehouse ID */}
            <div className="grid grid-cols-2 gap-5 mb-8">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Assign Manager</label>
                <div className="relative">
                  <select
                    value={managerId}
                    onChange={(e) => setManagerId(e.target.value)}
                    disabled={loadingOptions}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-[#7C3AED] bg-white pr-8 text-gray-700 disabled:opacity-60"
                  >
                    <option value="">{loadingOptions ? "Loading..." : "Choose Manager Here"}</option>
                    {managerOptions.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.fullName || m.name} ({m._id?.slice(-6).toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3.5 h-3.5 rotate-90" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Warehouse ID</label>
                <div className="relative">
                  <select
                    value={warehouseId}
                    onChange={(e) => setWarehouseId(e.target.value)}
                    disabled={loadingOptions}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-[#7C3AED] bg-white pr-8 text-gray-700 disabled:opacity-60"
                  >
                    <option value="">{loadingOptions ? "Loading..." : "Select Specific ID"}</option>
                    {warehouseOptions.map((w) => (
                      <option key={w._id} value={w._id}>
                        {w.name || w.warehouseName} ({w._id?.slice(-6).toUpperCase()})
                      </option>
                    ))}
                  </select>
                  <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3.5 h-3.5 rotate-90" />
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#7C3AED] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#6D28D9] transition disabled:opacity-60"
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add New Department"}
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          message={isEdit ? "Do you really want to save these changes!" : "Do you really want to add this department!"}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const DepartmentPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { departments, loading } = useSelector((state) => state.department);

  const [search, setSearch]                     = useState("");
  const [currentPage, setCurrentPage]           = useState(1);
  const [selectedRows, setSelectedRows]         = useState([]);
  const [showAdd, setShowAdd]                   = useState(false);
  const [editDept, setEditDept]                 = useState(null);
  const [viewDept, setViewDept]                 = useState(null);
  const [confirmDelete, setConfirmDelete]       = useState(null);
  const [formLoading, setFormLoading]           = useState(false);
  const itemsPerPage = 8;

  useEffect(() => { dispatch(fetchDepartments()); }, [dispatch]);

  const filtered = departments.filter((d) =>
    d.name?.toLowerCase().includes(search.toLowerCase()) ||
    d._id?.toLowerCase().includes(search.toLowerCase()) ||
    d.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleRow = (id) => setSelectedRows((prev) =>
    prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
  );

  const handleAdd = async (data) => {
    setFormLoading(true);
    const res = await dispatch(createDepartment(data));
    setFormLoading(false);
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Department added!");
      setShowAdd(false);
    } else {
      toast.error(res.payload || "Failed to add department");
    }
  };

  const handleEdit = async (data) => {
    setFormLoading(true);
    const res = await dispatch(updateDepartment({ id: editDept._id, data }));
    setFormLoading(false);
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Department updated!");
      setEditDept(null);
    } else {
      toast.error(res.payload || "Failed to update department");
    }
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteDepartment(confirmDelete));
    if (res.meta.requestStatus === "fulfilled") toast.success("Department deleted!");
    else toast.error(res.payload || "Failed to delete department");
    setConfirmDelete(null);
  };

  const getPageNumbers = () => {
    const pages = [];
    const total = totalPages || 10;
    if (total <= 7) { for (let i = 1; i <= total; i++) pages.push(i); }
    else pages.push(1, 2, 3, "...", total - 2, total - 1, total);
    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 max-w-[1300px] mx-auto">

        {/* Back + Title */}
        <div className="mb-6">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2 transition">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Department</h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <StatCard title="Active Departments"   value="100" percent="12" purple />
          <StatCard title="Inactive Departments" value="19"  percent="12" />
          <StatCard title="Deleted Departments"  value="10"  percent="12" />
        </div>

        {/* Active Departments Table */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Active Departments</h2>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">

          {/* Toolbar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                  placeholder="Search"
                  className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#7C3AED] w-52 placeholder-gray-400"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:border-gray-300 transition">
                <Filter className="w-3.5 h-3.5" /> Filters
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:border-[#7C3AED] hover:text-[#7C3AED] transition"
              >
                <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center">
                  <Plus className="w-3 h-3" />
                </span>
                Add New Department
              </button>
              <button className="flex items-center gap-1.5 px-4 py-2 bg-[#7C3AED] text-white rounded-lg text-sm font-medium hover:bg-[#6D28D9] transition">
                <Download className="w-3.5 h-3.5" /> Export
              </button>
            </div>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-4 py-3 w-10"></th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Department Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Department ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Warehouse ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Manager ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Email-Id</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Phone Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400 text-sm">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400 text-sm">No departments found</td></tr>
              ) : paginated.map((dept) => (
                <tr key={dept._id} className="border-b border-gray-50 hover:bg-gray-50/40 transition">
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(dept._id)}
                      onChange={() => toggleRow(dept._id)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#7C3AED] cursor-pointer"
                    />
                  </td>

                  {/* Department Name */}
                  <td className="px-4 py-3 text-xs text-gray-700 font-medium">
                    {dept.name || "—"}
                  </td>

                  {/* Department ID */}
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {dept._id?.slice(-10).toUpperCase() || "—"}
                  </td>

                  {/* Warehouse ID */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#7C3AED] underline cursor-pointer font-medium">
                      {dept.warehouseId?.slice(-10).toUpperCase() || "—"}
                    </span>
                  </td>

                  {/* Manager ID */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#7C3AED] underline cursor-pointer font-medium">
                      {dept.managerId?.slice(-10).toUpperCase() || "—"}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-700 max-w-[140px] truncate">
                        {dept.email || "—"}
                      </span>
                      {dept.email && (
                        <span className="text-xs text-gray-400 cursor-pointer">...</span>
                      )}
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {dept.phone || "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditDept(dept)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-[#7C3AED] transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(dept._id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewDept(dept)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition"
                        title="View"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:border-gray-300 disabled:opacity-40 transition"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            <div className="flex items-center gap-1">
              {getPageNumbers().map((p, i) =>
                p === "..." ? (
                  <span key={`e-${i}`} className="w-8 text-center text-gray-400 text-sm">...</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`w-8 h-8 rounded-lg text-sm font-medium transition ${currentPage === p ? "bg-[#7C3AED] text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  >{p}</button>
                )
              )}
            </div>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages || 1, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-500 hover:border-gray-300 disabled:opacity-40 transition"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {showAdd && (
        <DepartmentFormModal mode="add" onClose={() => setShowAdd(false)} onSubmit={handleAdd} loading={formLoading} />
      )}

      {editDept && (
        <DepartmentFormModal mode="edit" dept={editDept} onClose={() => setEditDept(null)} onSubmit={handleEdit} loading={formLoading} />
      )}

      {viewDept && (
        <ViewModal dept={viewDept} onClose={() => setViewDept(null)} />
      )}

      {confirmDelete && (
        <ConfirmModal
          message="Do you really want to delete this department!"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default DepartmentPage;