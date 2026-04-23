import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import purchaseOrderReducer from "../features/slices/purchaseOrderSlice";
import stockReducer from "../features/slices/stockSlice";
import departmentReducer from "../features/slices/Departmentslice";
import employeeReducer from "../features/slices/Employeeslice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    purchaseOrder: purchaseOrderReducer,
    stock: stockReducer,
    department: departmentReducer,
    employee: employeeReducer,
  },
});