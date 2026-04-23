import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { employeeAPI } from "../../api/Employeeapi";

export const fetchEmployees = createAsyncThunk(
  "employee/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await employeeAPI.getAll();
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to fetch employees");
    }
  }
);

export const createEmployee = createAsyncThunk(
  "employee/create",
  async (formData, { rejectWithValue }) => {
    try {
      const res = await employeeAPI.create(formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to create employee");
    }
  }
);

export const updateEmployee = createAsyncThunk(
  "employee/update",
  async ({ id, formData }, { rejectWithValue }) => {
    try {
      const res = await employeeAPI.update(id, formData);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to update employee");
    }
  }
);

export const deleteEmployee = createAsyncThunk(
  "employee/delete",
  async (id, { rejectWithValue }) => {
    try {
      await employeeAPI.delete(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || "Failed to delete employee");
    }
  }
);

const employeeSlice = createSlice({
  name: "employee",
  initialState: {
    employees: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEmployees.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchEmployees.fulfilled, (state, action) => { state.loading = false; state.employees = action.payload; })
      .addCase(fetchEmployees.rejected,  (state, action) => { state.loading = false; state.error = action.payload; })

      .addCase(createEmployee.fulfilled, (state, action) => { state.employees.unshift(action.payload); })

      .addCase(updateEmployee.fulfilled, (state, action) => {
        const idx = state.employees.findIndex((e) => e._id === action.payload._id);
        if (idx !== -1) state.employees[idx] = action.payload;
      })

      .addCase(deleteEmployee.fulfilled, (state, action) => {
        state.employees = state.employees.filter((e) => e._id !== action.payload);
      });
  },
});

export default employeeSlice.reducer;