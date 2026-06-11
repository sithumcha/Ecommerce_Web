import React, { useContext } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthContext } from './context/AuthContext';

// Common Components
import Navbar from './components/common/Navbar';
import CookieBanner from './components/common/CookieBanner';
import CartDrawer from './components/common/CartDrawer';
import ComparePanel from './components/product/ComparePanel';
import SupportChatbot from './components/common/SupportChatbot';
import ToastContainer from './components/common/ToastContainer';
import Footer from './components/common/Footer';

// Customer Pages
import Home from './pages/customer/Home';
import Shop from './pages/customer/Shop';
import ProductDetails from './pages/customer/ProductDetails';
import Cart from './pages/customer/Cart';
import Checkout from './pages/customer/Checkout';
import Profile from './pages/customer/Profile';
import LoginRegister from './pages/customer/LoginRegister';
import Messages from './pages/customer/Messages';

// Admin Pages
import AdminSidebar from './components/admin/AdminSidebar';
import Dashboard from './pages/admin/Dashboard';
import ManageProducts from './pages/admin/ManageProducts';
import ManageOrders from './pages/admin/ManageOrders';
import ManageUsers from './pages/admin/ManageUsers';

// Agent Pages
import AgentProducts from './pages/agent/AgentProducts';
import AddEditProduct from './pages/agent/AddEditProduct';

// Protected Route for logged-in users
const ProtectedRoute = () => {
  const { userInfo } = useContext(AuthContext);
  return userInfo ? <Outlet /> : <Navigate to="/login" replace />;
};

// Protected Route for agents
const AgentRoute = () => {
  const { userInfo } = useContext(AuthContext);
  return userInfo && userInfo.isAgent ? <Outlet /> : <Navigate to="/" replace />;
};

// Protected Route for admins only
const AdminRoute = () => {
  const { userInfo } = useContext(AuthContext);
  return userInfo && userInfo.isAdmin ? <Outlet /> : <Navigate to="/" replace />;
};

// Admin Layout wrapper
const AdminLayout = () => {
  return (
    <div className="flex flex-col md:flex-row gap-8">
      <AdminSidebar />
      <main className="flex-grow glass-panel rounded-3xl p-6 sm:p-8 border border-dark-800">
        <Outlet />
      </main>
    </div>
  );
};

function App() {
  const location = useLocation();

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <CookieBanner />
      <CartDrawer />
      <ComparePanel />
      <SupportChatbot />
      <ToastContainer />
      
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<LoginRegister />} />

            {/* User Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
            </Route>

            {/* Admin Protected Routes */}
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<Dashboard />} />
                <Route path="/admin/products" element={<ManageProducts />} />
                <Route path="/admin/orders" element={<ManageOrders />} />
                <Route path="/admin/users" element={<ManageUsers />} />
              </Route>
            </Route>

            {/* Agent Protected Routes */}
            <Route element={<AgentRoute />}>
              <Route path="/agent/products" element={<AgentProducts />} />
              <Route path="/agent/products/create" element={<AddEditProduct />} />
              <Route path="/agent/products/edit/:id" element={<AddEditProduct />} />
            </Route>

            {/* Fallback Catch-all Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  );
}

export default App;
