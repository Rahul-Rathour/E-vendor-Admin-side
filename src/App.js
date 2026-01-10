import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import AddCategory from "./pages/AddCategory";
import AddProduct from "./pages/AddProduct";
import ManageCategories from "./components/ManageCategories";
import ManageProducts from "./components/ManageProducts";
import ManageSubcategories from "./components/ManageSubcategories";
import AddSubcategory from "./pages/AddSubcategory";
import HomePage from "./pages/HomePage";
import EditCategory from "./pages/EditCategory";
import Dashboard from "./pages/Dashboard";
import SidebarMenu from "./components/SidebarMenu";
import Orders from "./pages/orders/Orders";
import Pending_orders from "./pages/pending-orders/Pending_orders";
import Shipped_orders from "./pages/shipped-orders/Shipped_orders";
import Delivered_orders from "./pages/delivered-orders/Delivered-orders";
import Cancelled_orders from "./pages/cancelled_orders/Cancelled_orders";
import Order_details from "./pages/order_details/Order_details";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function App() {
  return (
    <Router> 
      {/* <Navbar /> */}
      <div className="min-h-screen bg-gray-50">
        <div className="">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/sidebar" element={<SidebarMenu />} />

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {/* <HomePage /> */}
                  <Dashboard/>
                </ProtectedRoute>
              }
            />

            {/* Category Routes */}
            <Route
              path="/add-category"
              element={
                <ProtectedRoute>
                  <AddCategory />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/order-details/:id"
              element={
                <ProtectedRoute>
                  <Order_details />
                </ProtectedRoute>
              }
            />
            <Route
              path="/orders"
              element={
                <ProtectedRoute>
                  <Orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pending-orders"
              element={
                <ProtectedRoute>
                  <Pending_orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipped-orders"
              element={
                <ProtectedRoute>
                  <Shipped_orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/delivered-orders"
              element={
                <ProtectedRoute>
                  <Delivered_orders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cancelled-orders"
              element={
                <ProtectedRoute>
                  <Cancelled_orders />
                </ProtectedRoute>
              }
            />

            {/* Subcategory Routes */}
            <Route
              path="/add-subcategory"
              element={
                <ProtectedRoute>
                  <AddSubcategory />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-subcategory"
              element={
                <ProtectedRoute>
                  <ManageSubcategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-category"
              element={
                <ProtectedRoute>
                  <ManageCategories />
                </ProtectedRoute>
              }
            />

            {/* Product Routes */}
            <Route
              path="/add-product"
              element={
                <ProtectedRoute>
                  <AddProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/manage-product"
              element={
                <ProtectedRoute>
                  <ManageProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/update-category/:id"
              element={
                <ProtectedRoute>
                  <EditCategory />
                </ProtectedRoute>
              }
            />

            {/* Redirect to Dashboard if logged in */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* <Route path="*" element={<Navigate to="/login" replace />} /> */}
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
