import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { stockAPI } from "../../api/stockApi";

export const fetchStock = createAsyncThunk(
  "stock/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await stockAPI.getAll();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch stock");
    }
  }
);

export const createStock = createAsyncThunk(
  "stock/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await stockAPI.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create stock");
    }
  }
);

export const updateStock = createAsyncThunk(
  "stock/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await stockAPI.update(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update stock");
    }
  }
);

export const deleteStock = createAsyncThunk(
  "stock/delete",
  async (id, { rejectWithValue }) => {
    try {
      await stockAPI.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete stock");
    }
  }
);

const stockSlice = createSlice({
  name: "stock",
  initialState: {
    stocks: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchStock.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchStock.fulfilled, (state, action) => { state.loading = false; state.stocks = action.payload; })
      .addCase(fetchStock.rejected, (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createStock.fulfilled, (state, action) => { state.stocks.unshift(action.payload); })

      .addCase(updateStock.fulfilled, (state, action) => {
        const idx = state.stocks.findIndex((s) => s._id === action.payload._id);
        if (idx !== -1) state.stocks[idx] = action.payload;
      })

      .addCase(deleteStock.fulfilled, (state, action) => {
        state.stocks = state.stocks.filter((s) => s._id !== action.payload);
      });
  },
});

export default stockSlice.reducer;