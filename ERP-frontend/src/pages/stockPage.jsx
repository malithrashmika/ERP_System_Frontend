import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  fetchStock,
  createStock,
  updateStock,
  deleteStock,
} from "../features/slices/stockSlice";
import axiosClient from "../services/axiosClient";
import {
  Search, Filter, Download, ChevronLeft, ChevronRight,
  Calendar, Pencil, Trash2, Eye, X, Plus, AlertTriangle,
} from "lucide-react";

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
const ViewModal = ({ stock, onClose }) => {
  if (!stock) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
        <div className="flex justify-between items-center px-7 py-5 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">Stock Details</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="px-7 py-5 space-y-4">
          {[
            { label: "Stock ID",           value: stock._id?.slice(-10).toUpperCase() },
            { label: "Product ID",         value: stock.productId || "—" },
            { label: "Warehouse ID",       value: stock.warehouseId || "—" },
            { label: "Category",           value: stock.category || "—" },
            { label: "Weight",             value: stock.weight ? `${stock.weight} lb` : "—" },
            { label: "Stock Level (units)",value: stock.stockLevel ?? "—" },
            { label: "Rec. Level (units)", value: stock.reorderLevel ?? "—" },
            { label: "Created Date",       value: stock.createdAt ? `${new Date(stock.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} ${new Date(stock.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}` : "—" },
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

// ─── Add / Edit Modal ─────────────────────────────────────────────────────────
const StockFormModal = ({ mode, stock, onClose, onSubmit, loading }) => {
  const [productId,   setProductId]   = useState(stock?.productId   || "");
  const [warehouseId, setWarehouseId] = useState(stock?.warehouseId || "");
  const [quantity,    setQuantity]    = useState(stock?.stockLevel   || "");
  const [showConfirm, setShowConfirm] = useState(false);

  const [productOptions,   setProductOptions]   = useState([]);
  const [warehouseOptions, setWarehouseOptions] = useState([]);
  const [loadingOptions,   setLoadingOptions]   = useState(false);

  const isEdit = mode === "edit";

  useEffect(() => {
    const fetch = async () => {
      setLoadingOptions(true);
      try {
        const [prodRes, wareRes] = await Promise.all([
          axiosClient.get("/products"),
          axiosClient.get("/warehouses"),
        ]);
        setProductOptions(prodRes.data);
        setWarehouseOptions(wareRes.data);
      } catch {
        toast.error("Failed to load options");
      } finally {
        setLoadingOptions(false);
      }
    };
    fetch();
  }, []);

  const handleSubmit = () => {
    if (!productId)   { toast.error("Please select a Product");   return; }
    if (!warehouseId) { toast.error("Please select a Warehouse"); return; }
    if (!quantity)    { toast.error("Please enter Quantity");      return; }
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onSubmit({ productId, warehouseId, stockLevel: Number(quantity) });
    setShowConfirm(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
          {/* Header */}
          <div className="flex justify-between items-center px-7 py-5 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-800">
              {isEdit ? "Edit Stock" : "Add New Stock"}
            </h2>
            <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-100 transition">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="px-7 py-6 space-y-4">
            {/* Product ID */}
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Product ID</label>
              <div className="relative">
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-[#7C3AED] bg-white pr-8 text-gray-700 disabled:opacity-60"
                >
                  <option value="">{loadingOptions ? "Loading..." : "Select Product ID"}</option>
                  {productOptions.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.productName} ({p.productId || p._id?.slice(-6).toUpperCase()})
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3.5 h-3.5 rotate-90" />
              </div>
            </div>

            {/* Warehouse ID */}
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Warehouse ID</label>
              <div className="relative">
                <select
                  value={warehouseId}
                  onChange={(e) => setWarehouseId(e.target.value)}
                  disabled={loadingOptions}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm appearance-none focus:outline-none focus:border-[#7C3AED] bg-white pr-8 text-gray-700 disabled:opacity-60"
                >
                  <option value="">{loadingOptions ? "Loading..." : "Select Product ID"}</option>
                  {warehouseOptions.map((w) => (
                    <option key={w._id} value={w._id}>
                      {w.name || w.warehouseName} ({w._id?.slice(-6).toUpperCase()})
                    </option>
                  ))}
                </select>
                <ChevronRight className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none w-3.5 h-3.5 rotate-90" />
              </div>
            </div>

            {/* Quantity */}
            <div>
              <label className="text-xs text-gray-500 mb-1.5 block">Quantity (in SKUs)</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter your Address"
                min="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#7C3AED] placeholder-gray-300"
              />
            </div>

            {/* Submit */}
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#7C3AED] text-white py-3 rounded-xl font-semibold text-sm hover:bg-[#6D28D9] transition disabled:opacity-60 mt-2"
            >
              {loading ? "Saving..." : isEdit ? "Save Changes" : "Add Stock"}
            </button>
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmModal
          message={isEdit ? "Do you really want to save these changes!" : "Do you really want to add this stock!"}
          onConfirm={handleConfirm}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const StockPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { stocks, loading } = useSelector((state) => state.stock);

  const [search, setSearch]                   = useState("");
  const [activeTimeFilter, setActiveTimeFilter] = useState("7d");
  const [currentPage, setCurrentPage]         = useState(1);
  const [viewStock, setViewStock]             = useState(null);
  const [editStock, setEditStock]             = useState(null);
  const [showAdd, setShowAdd]                 = useState(false);
  const [confirmDelete, setConfirmDelete]     = useState(null);
  const [formLoading, setFormLoading]         = useState(false);
  const itemsPerPage = 8;

  useEffect(() => { dispatch(fetchStock()); }, [dispatch]);

  const filtered = stocks.filter((s) =>
    s._id?.toLowerCase().includes(search.toLowerCase()) ||
    s.productId?.toLowerCase().includes(search.toLowerCase()) ||
    s.warehouseId?.toLowerCase().includes(search.toLowerCase()) ||
    s.category?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated  = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleAdd = async (data) => {
    setFormLoading(true);
    const res = await dispatch(createStock(data));
    setFormLoading(false);
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Stock added!");
      setShowAdd(false);
    } else {
      toast.error(res.payload || "Failed to add stock");
    }
  };

  const handleEdit = async (data) => {
    setFormLoading(true);
    const res = await dispatch(updateStock({ id: editStock._id, data }));
    setFormLoading(false);
    if (res.meta.requestStatus === "fulfilled") {
      toast.success("Stock updated!");
      setEditStock(null);
    } else {
      toast.error(res.payload || "Failed to update stock");
    }
  };

  const handleDelete = async () => {
    const res = await dispatch(deleteStock(confirmDelete));
    if (res.meta.requestStatus === "fulfilled") toast.success("Stock deleted!");
    else toast.error(res.payload || "Failed to delete stock");
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

        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <button onClick={() => navigate("/dashboard")} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2 transition">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Stock</h1>
          </div>
          <div className="flex items-center gap-1 mt-1 flex-wrap">
            {["1d", "7d", "1m", "3m", "6m", "1y", "3y", "5y"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTimeFilter(t)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition
                  ${activeTimeFilter === t ? "border-[#7C3AED] text-[#7C3AED] bg-white" : "border-gray-200 text-gray-500 bg-white hover:border-[#7C3AED] hover:text-[#7C3AED]"}`}
              >{t}</button>
            ))}
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-500 bg-white hover:border-[#7C3AED] hover:text-[#7C3AED] transition ml-1">
              <Calendar className="w-3 h-3" /> Select dates
            </button>
          </div>
        </div>

        {/* White card */}
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
                Add New Stock
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
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400">Created Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400">Stock ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400">Product ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400">Warehouse ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400">Category</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400">Weight</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400">Stock. Level (in units)</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400">Rec. Level (in units)</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={9} className="text-center py-16 text-gray-400 text-sm">Loading...</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={9} className="text-center py-16 text-gray-400 text-sm">No stock found</td></tr>
              ) : paginated.map((stock) => (
                <tr key={stock._id} className="border-b border-gray-50 hover:bg-gray-50/40 transition">
                  {/* Created Date */}
                  <td className="px-5 py-3">
                    <div className="text-xs text-gray-700 leading-5">
                      {new Date(stock.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      <br />
                      <span className="text-gray-400">{new Date(stock.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </td>

                  {/* Stock ID */}
                  <td className="px-5 py-3 text-xs text-gray-700 font-medium">
                    {stock._id?.slice(-10).toUpperCase()}
                  </td>

                  {/* Product ID */}
                  <td className="px-5 py-3">
                    <span className="text-xs text-[#7C3AED] underline cursor-pointer font-medium">
                      {stock.productId || "—"}
                    </span>
                  </td>

                  {/* Warehouse ID */}
                  <td className="px-5 py-3">
                    <span className="text-xs text-[#7C3AED] underline cursor-pointer font-medium">
                      {stock.warehouseId || "—"}
                    </span>
                  </td>

                  {/* Category */}
                  <td className="px-5 py-3">
                    <span className="text-xs text-[#7C3AED] underline cursor-pointer font-medium">
                      {stock.category || "—"}
                    </span>
                  </td>

                  {/* Weight */}
                  <td className="px-5 py-3 text-xs text-gray-700">
                    {stock.weight ? `${stock.weight} lb` : "—"}
                  </td>

                  {/* Stock Level */}
                  <td className="px-5 py-3 text-xs text-gray-700">
                    {stock.stockLevel ?? "—"}
                  </td>

                  {/* Rec Level */}
                  <td className="px-5 py-3 text-xs text-gray-700">
                    {stock.reorderLevel ?? "—"}
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditStock(stock)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-400 hover:text-[#7C3AED] transition"
                        title="Edit"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmDelete(stock._id)}
                        className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-red-50 text-gray-400 hover:text-red-500 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewStock(stock)}
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
        <StockFormModal mode="add" onClose={() => setShowAdd(false)} onSubmit={handleAdd} loading={formLoading} />
      )}

      {editStock && (
        <StockFormModal mode="edit" stock={editStock} onClose={() => setEditStock(null)} onSubmit={handleEdit} loading={formLoading} />
      )}

      {viewStock && (
        <ViewModal stock={viewStock} onClose={() => setViewStock(null)} />
      )}

      {confirmDelete && (
        <ConfirmModal
          message="Do you really want to delete this stock!"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
};

export default StockPage;