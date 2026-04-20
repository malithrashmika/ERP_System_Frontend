import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { departmentAPI } from "../../api/departmentApi";

export const fetchDepartments = createAsyncThunk(
  "department/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await departmentAPI.getAll();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch departments");
    }
  }
);

export const createDepartment = createAsyncThunk(
  "department/create",
  async (data, { rejectWithValue }) => {
    try {
      const res = await departmentAPI.create(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create department");
    }
  }
);

export const updateDepartment = createAsyncThunk(
  "department/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await departmentAPI.update(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update department");
    }
  }
);

export const deleteDepartment = createAsyncThunk(
  "department/delete",
  async (id, { rejectWithValue }) => {
    try {
      await departmentAPI.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete department");
    }
  }
);

const departmentSlice = createSlice({
  name: "department",
  initialState: {
    departments: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartments.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchDepartments.fulfilled, (state, action) => { state.loading = false; state.departments = action.payload; })
      .addCase(fetchDepartments.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createDepartment.fulfilled, (state, action) => { state.departments.unshift(action.payload); })

      .addCase(updateDepartment.fulfilled, (state, action) => {
        const idx = state.departments.findIndex((d) => d._id === action.payload._id);
        if (idx !== -1) state.departments[idx] = action.payload;
      })

      .addCase(deleteDepartment.fulfilled, (state, action) => {
        state.departments = state.departments.filter((d) => d._id !== action.payload);
      });
  },
});

export default departmentSlice.reducer;