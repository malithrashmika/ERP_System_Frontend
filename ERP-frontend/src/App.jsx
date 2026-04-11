import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import ProductsPage from "./pages/ProductsPage";
import AppRouter from "./routes/AppRouter";
import { Toaster } from "sonner";
 
function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <AppRouter /> 
    </>
  );
}
 
export default App;
