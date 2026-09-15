
import { Navigate, Outlet, Route, Routes } from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import ProductsPage from "./pages/ProductsPage";
import SalesPage from "./pages/SalesPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import ToastContainer from "./components/ToastContainer";

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <Sidebar />

      <main className="main-content">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
};

const App = () => {
  return (
    <Routes>
      {/* Public Route */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/sales" element={<SalesPage />} />

          {/* Forbidden */}
          <Route
            path="/403"
            element={
              <div>
                <h1>403</h1>
                <p>You do not have permission to access this page.</p>
              </div>
            }
          />
        </Route>
      </Route>

      {/* Fallback */}
      <Route
        path="*"
        element={<Navigate to="/login" replace />}
      />
    </Routes>
  );
};

export default App;
