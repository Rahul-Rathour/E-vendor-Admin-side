import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddCategory from "./pages/AddCategory";
import AddProduct from "./pages/AddProduct";
import ManageCategories from "./components/ManageCategories";
import ManageProducts from "./components/ManageProducts";
import ManageSubcategories from "./components/ManageSubcategories";
import AddSubcategory from "./pages/AddSubcategory";
import EditCategory from "./pages/EditCategory";
import Orders from "./pages/orders/Orders";
import Pending_orders from "./pages/pending-orders/Pending_orders";
import Shipped_orders from "./pages/shipped-orders/Shipped_orders";
import Delivered_orders from "./pages/delivered-orders/Delivered-orders";
import Cancelled_orders from "./pages/cancelled_orders/Cancelled_orders";
import Order_details from "./pages/order_details/Order_details";
import Banner_op from "./pages/banner_op/Banner_op";
import Faq from "./pages/Faq/Faq";
import ButtonColors from "./pages/ButtonColors/ButtonColors";

import ProtectedLayout from "./pages/ProtectedLayout";
import ContactQueries from "./pages/Contact/ContactQueries";
import AboutUsForm from "./pages/AboutUs/AboutUsForm";
import PrivacyPolicy from "./pages/PrivacyPolicy/PrivacyPolicy";
import Homesetting from "./pages/homesetting/Homesetting";
import Videos from "./pages/videos/Videos";
import CouponManager from "./pages/Coupons/CouponManager";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected routes with Sidebar Layout */}
        <Route element={<ProtectedLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/add-category" element={<AddCategory />} />
          <Route path="/manage-category" element={<ManageCategories />} />
          <Route path="/add-subcategory" element={<AddSubcategory />} />
          <Route path="/manage-subcategory" element={<ManageSubcategories />} />
          <Route path="/add-product" element={<AddProduct />} />
          <Route path="/manage-product" element={<ManageProducts />} />
          <Route path="/update-category/:id" element={<EditCategory />} />

          <Route path="/orders" element={<Orders />} />
          <Route path="/pending-orders" element={<Pending_orders />} />
          <Route path="/shipped-orders" element={<Shipped_orders />} />
          <Route path="/delivered-orders" element={<Delivered_orders />} />
          <Route path="/cancelled-orders" element={<Cancelled_orders />} />
          <Route path="/order-details/:id" element={<Order_details />} />
          <Route path="/contact" element={<ContactQueries/>}/>
          <Route path="/homesettings" element={<Homesetting/>}/>
          <Route path="/videos" element={<Videos/>}/>
          <Route path="/about" element={<AboutUsForm/>}/>
          <Route path="/privacy" element={<PrivacyPolicy/>}/>
          <Route path="/banner-op" element={<Banner_op />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/color" element={<ButtonColors />} />
          <Route path="/coupon" element={<CouponManager/>}/>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={2000} />
    </Router>
  );
}

export default App;