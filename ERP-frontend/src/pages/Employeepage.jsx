import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../features/slices/Employeeslice";
import {
  Search, Filter, Download, ChevronLeft, ChevronRight,
  Calendar, Pencil, Trash2, Eye, X, Plus, AlertTriangle,
  TrendingUp, Upload, CloudUpload,
} from "lucide-react";

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({ title, value, percent, purple }) => (
  <div className={`rounded-xl p-6 border ${purple ? "bg-[#7C3AED] border-[#7C3AED]" : "bg-white border-gray-200"}`}>
    <p className={`text-sm font-medium mb-3 ${purple ? "text-purple-100" : "text-gray-500"}`}>{title}</p>
    <p className={`text-4xl font-bold mb-4 ${purple ? "text-white" : "text-gray-800"}`}>{value}</p>
    <div className={`flex items-center gap-1.5 text-xs font-medium ${purple ? "text-purple-100" : "text-gray-500"}`}>
      <TrendingUp className="w-3.5 h-3.5" />
      <span>{percent}%  vs last month</span>
    </div>
  </div>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar = ({ employee }) => {
  if (employee.avatar) {
    return (
      <img
        src={employee.avatar}
        alt={employee.fullName}
        className="w-9 h-9 rounded-full object-cover border border-gray-200"
      />
    );
  }
  const initials = employee.fullName
    ? employee.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "??";
  return (
    <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center text-xs font-semibold text-[#7C3AED]">
      {initials}
    </div>
  );
};

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
const ViewModal = ({ employee, onClose }) => {
  if (!employee) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center px-7 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Employee Details</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-7 py-5 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <Avatar employee={employee} />
            <div>
              <p className="text-sm font-semibold text-gray-800">{employee.fullName || "—"}</p>
              <p className="text-xs text-gray-400">{employee.email || "—"}</p>
            </div>
          </div>
          {[
            { label: "Employee ID",    value: employee._id?.slice(-10).toUpperCase() },
            { label: "Department ID",  value: employee.departmentId || "—" },
            { label: "Warehouse ID",   value: employee.warehouseId || "—" },
            { label: "Phone Number",   value: employee.phone || "—" },
            { label: "Hire Date",      value: employee.hireDate ? new Date(employee.hireDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—" },
            { label: "State",          value: employee.state || "—" },
            { label: "Pincode",        value: employee.pincode || "—" },
            { label: "Address",        value: employee.address || "—" },
            { label: "Gov. ID Type",   value: employee.govIdType || "—" },
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

// ─── File Upload Zone ─────────────────────────────────────────────────────────
const FileUploadZone = ({ file, onChange }) => {
  const [dragging, setDragging] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onChange(f);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer
        ${dragging ? "border-[#7C3AED] bg-purple-50" : "border-gray-200 bg-purple-50/40"}
        hover:border-[#7C3AED]`}
    >
      <input
        type="file"
        accept=".svg,.png,.jpg,.jpeg,.pdf"
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
        onChange={(e) => onChange(e.target.files[0])}
      />
      <div className="flex flex-col items-center justify-center py-6 gap-1.5">
        <CloudUpload className="w-7 h-7 text-[#7C3AED]" />
        <p className="text-sm text-[#7C3AED] font-medium">Click to upload</p>
        <p className="text-xs text-gray-400">SVG, PNG, JPG or PDF (max. 2MB)</p>
        {file && <p className="text-xs text-green-600 font-medium mt-1">✓ {file.name}</p>}
      </div>
    </div>
  );
};

// ─── Employee Form Modal (Add / Edit) ─────────────────────────────────────────
const EmployeeFormModal = ({ mode, employee, onClose, onSubmit, loading }) => {
  const isEdit = mode === "edit";

  const [fullName,    setFullName]    = useState(employee?.fullName    || "");
  const [hireDate,    setHireDate]    = useState(
    employee?.hireDate
      ? new Date(employee.hireDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [phone,       setPhone]       = useState(employee?.phone       || "");
  const [countryCode, setCountryCode] = useState("US");
  const [warehouseId, setWarehouseId] = useState(employee?.warehouseId || "");
  const [departmentId,setDepartmentId]= useState(employee?.departmentId|| "");
  const [email,       setEmail]       = useState(employee?.email       || "");
  const [govIdType,   setGovIdType]   = useState(employee?.govIdType   || "");
  const [state,       setState]       = useState(employee?.state       || "");
  const [pincode,     setPincode]     = useState(employee?.pincode     || "");
  const [address,     setAddress]     = useState(employee?.address     || "");
  const [uploadFile,  setUploadFile]  = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const COUNTRY_CODES = ["US", "LK", "IN", "UK", "AU", "CA"];
  const GOV_ID_TYPES  = ["Passport", "National ID", "Driver's License", "Voter ID"];

  const handleSubmit = () => {
    if (!fullName) { toast.error("Please enter Full Name"); return; }
    if (!phone)    { toast.error("Please enter Phone Number"); return; }
    if (!email)    { toast.error("Please enter Email"); return; }
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    const formData = new FormData();
    formData.append("fullName",     fullName);
    formData.append("hireDate",     hireDate);
    formData.append("phone",        `+${countryCode} ${phone}`);
    formData.append("warehouseId",  warehouseId);
    formData.append("departmentId", departmentId);
    formData.append("email",        email);
    formData.append("govIdType",    govIdType);
    formData.append("state",        state);
    formData.append("pincode",      pincode);
    formData.append("address",      address);
    if (uploadFile) formData.append("files", uploadFile);
    onSubmit(formData);
    setShowConfirm(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center px-8 py-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">
              {isEdit ? "Edit Employee" : "Add New Employee"}
            </h2>
            <div className="flex items-center gap-3">
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
            {/* Row 1: Full Name + Hiring Date */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter Full Name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] placeholder-gray-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Hiring Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                  <input
                    type="date"
                    value={hireDate}
                    onChange={(e) => setHireDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg pl-9 pr-3 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] text-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Row 2: Phone + Warehouse ID + Department ID */}
            <div className="grid grid-cols-3 gap-5 mb-5">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Phone number</label>
                <div className="flex border border-gray-200 rounded-lg overflow-hidden focus-within:border-[#7C3AED]">
                  <select
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    className="px-2 py-2.5 text-sm bg-gray-50 border-r border-gray-200 focus:outline-none text-gray-700"
                  >
                    {COUNTRY_CODES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+ 1 955 000 0000"
                    className="flex-1 px-3 py-2.5 text-sm focus:outline-none placeholder-gray-300"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Warehouse/Store ID</label>
                <input
                  type="text"
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  placeholder="Ex: BRT12234"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] placeholder-gray-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Department ID</label>
                <input
                  type="text"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  placeholder="Ex: BRT12234"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] placeholder-gray-300"
                />
              </div>
            </div>

            {/* Row 3: Email + Gov ID Type */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Email-Id</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your Email-ID"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] placeholder-gray-300"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Government ID Type</label>
                <div className="relative">
                  <select
                    value={govIdType}
                    onChange={(e) => setGovIdType(e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-[#7C3AED] bg-white pr-8 text-gray-700"
                  >
                    <option value="">Select Specific ID</option>
                    {GOV_ID_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3.5 h-3.5 rotate-90" />
                </div>
              </div>
            </div>

            {/* Row 4: State + Pincode + File Upload */}
            <div className="grid grid-cols-2 gap-5 mb-5">
              {/* Left: State + Pincode + Address */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="Select your state"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] placeholder-gray-300"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1.5 block">Pincode</label>
                    <input
                      type="text"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      placeholder="Enter Pincode"
                      className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] placeholder-gray-300"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your Address"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] placeholder-gray-300"
                  />
                </div>
              </div>

              {/* Right: File Upload */}
              <div>
                <label className="text-xs text-gray-500 mb-1.5 block">Upload Files (ID & Offer Letter)</label>
                <FileUploadZone file={uploadFile} onChange={setUploadFile} />
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#7C3AED] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#6D28D9] transition disabled:opacity-60 mt-2"
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add New Employee"}
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          message={isEdit ? "Do you really want to save these changes!" : "Do you really want to add this employee!"}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const EmployeePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { employees, loading } = useSelector((state) => state.employee);

  const [search, setSearch]               = useState("");
  const [currentPage, setCurrentPage]     = useState(1);
  const [selectedRows, setSelectedRows]   = useState([]);
  const [showAdd, setShowAdd]             = useState(false);
  const [editEmployee, setEditEmployee]   = useState(null);
  const [viewEmployee, setViewEmployee]   = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [formLoading, setFormLoading]     = useState(false);
  const itemsPerPage = 8;

  useEffect(() => { dispatch(fetchEmployees()); }, [dispatch]);

  const filtered = employees.filter((e) =>
    e.fullName?.toLowerCase().includes(search.toLowerCase()) ||
    e._id?.toLowerCase().includes(search.toLowerCase()) ||
    e.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleRow = (id) => setSelectedRows((prev) =>
    prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]
  );

  const handleAdd = async (formData) => {
    setFormLoading(true);
    const res = await dispatch(createEmployee(formData));
    setFormLoading(false);
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Employee added!");
      setShowAdd(false);
    } else {
      toast.error(res.payload || "Failed to add employee");
    }
  };

  const handleEdit = async (formData) => {
    setFormLoading(true);
    const res = await dispatch(updateEmployee({ id: editEmployee._id, formData }));
    setFormLoading(false);
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Employee updated!");
      setEditEmployee(null);
    } else {
      toast.error(res.payload || "Failed to update employee");
    }
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteEmployee(confirmDelete));
    if (res.meta.requestStatus === "fulfilled") toast.success("Employee deleted!");
    else toast.error(res.payload || "Failed to delete employee");
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
          <h1 className="text-2xl font-bold text-gray-800">Employee</h1>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-5 mb-8">
          <StatCard title="Active Employees"   value="100" percent="12" purple />
          <StatCard title="Inactive Employees" value="19"  percent="12" />
          <StatCard title="Deleted Employees"  value="10"  percent="12" />
        </div>

        {/* Active Employee Table */}
        <h2 className="text-xl font-bold text-gray-800 mb-4">Active Employee</h2>

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
                Add New Employee
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
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Employee Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Employee ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Department ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Warehouse ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Hire Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Phone Number</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400 text-sm">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-16 text-gray-400 text-sm">No employees found</td></tr>
              ) : paginated.map((emp) => (
                <tr key={emp._id} className="border-b border-gray-50 hover:bg-gray-50/40 transition">
                  {/* Checkbox */}
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(emp._id)}
                      onChange={() => toggleRow(emp._id)}
                      className="w-4 h-4 rounded border-gray-300 accent-[#7C3AED] cursor-pointer"
                    />
                  </td>

                  {/* Employee Name + Avatar */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar employee={emp} />
                      <span className="text-xs text-gray-700 font-medium">{emp.fullName || "—"}</span>
                    </div>
                  </td>

                  {/* Employee ID */}
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {emp._id?.slice(-10).toUpperCase() || "—"}
                  </td>

                  {/* Department ID */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#7C3AED] underline cursor-pointer font-medium">
                      {emp.departmentId?.slice(-10).toUpperCase() || "—"}
                    </span>
                  </td>

                  {/* Warehouse ID */}
                  <td className="px-4 py-3">
                    <span className="text-xs text-[#7C3AED] underline cursor-pointer font-medium">
                      {emp.warehouseId?.slice(-10).toUpperCase() || "—"}
                    </span>
                  </td>

                  {/* Hire Date */}
                  <td className="px-4 py-3">
                    <div className="text-xs text-gray-700 leading-5">
                      {emp.hireDate
                        ? new Date(emp.hireDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                        : "—"}
                      <br />
                      <span className="text-gray-400">
                        {emp.hireDate
                          ? new Date(emp.hireDate).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
                          : ""}
                      </span>
                    </div>
                  </td>

                  {/* Phone */}
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {emp.phone || "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditEmployee(emp)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-[#7C3AED] transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(emp._id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewEmployee(emp)}
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
        <EmployeeFormModal mode="add" onClose={() => setShowAdd(false)} onSubmit={handleAdd} loading={formLoading} />
      )}

      {editEmployee && (
        <EmployeeFormModal mode="edit" employee={editEmployee} onClose={() => setEditEmployee(null)} onSubmit={handleEdit} loading={formLoading} />
      )}

      {viewEmployee && (
        <ViewModal employee={viewEmployee} onClose={() => setViewEmployee(null)} />
      )}

      {confirmDelete && (
        <ConfirmModal
          message="Do you really want to delete this employee!"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default EmployeePage;