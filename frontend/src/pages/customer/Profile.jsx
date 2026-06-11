import React, { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { WishlistContext } from '../../context/WishlistContext';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { formatDate } from '../../utils/format';
import { useCurrency } from '../../context/CurrencyContext';
import { ShoppingBag, CheckCircle2, Clock, MapPin, ExternalLink, Printer, Heart, CreditCard, Trash2, Sparkles } from 'lucide-react';
import ProductCard from '../../components/product/ProductCard';
import Invoice from '../../components/checkout/Invoice';
import AnimatedPage from '../../components/common/AnimatedPage';
import { motion, AnimatePresence } from 'framer-motion';

const Profile = () => {
  const { userInfo, fetchProfile } = useContext(AuthContext);
  const { formatPrice } = useCurrency();
  const { wishlistItems } = useContext(WishlistContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'orders';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrderForInvoice, setSelectedOrderForInvoice] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState(null);

  const fetchMyOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/myorders');
      setOrders(data);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order? This will restore product stock levels.')) return;
    setActionLoading(orderId);
    setActionError(null);
    try {
      await api.put(`/orders/${orderId}/cancel`);
      await fetchMyOrders();
    } catch (err) {
      setActionError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleRequestReturn = async (orderId) => {
    if (!window.confirm('Are you sure you want to request a return for this order?')) return;
    setActionLoading(orderId);
    setActionError(null);
    try {
      await api.put(`/orders/${orderId}/return`);
      await fetchMyOrders();
    } catch (err) {
      setActionError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to permanently delete this order history? This action cannot be undone.')) return;
    setActionLoading(orderId);
    setActionError(null);
    try {
      await api.delete(`/orders/${orderId}`);
      setExpandedOrderId(null);
      await fetchMyOrders();
    } catch (err) {
      setActionError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setActionLoading(null);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (userInfo && isMounted) {
      fetchMyOrders();
    }
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  return (
    <AnimatedPage className="space-y-10 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">My Account</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          Manage your personal details and view your order history.
        </p>
      </div>

      {/* Stats Dashboard */}
      {!loading && (
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-dark-800 flex items-center gap-4 hover:scale-[1.02] hover:border-slate-350 dark:hover:border-dark-700 hover:shadow-md transition-all duration-300">
            <div className="p-3 bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-xl">
              <ShoppingBag size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Orders</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5 block">{orders.length}</span>
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-dark-800 flex items-center gap-4 hover:scale-[1.02] hover:border-slate-350 dark:hover:border-dark-700 hover:shadow-md transition-all duration-300">
            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
              <CreditCard size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Total Spent</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5 block">
                {formatPrice(orders.reduce((acc, o) => acc + (o.isCancelled ? 0 : o.totalPrice), 0))}
              </span>
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-dark-800 flex items-center gap-4 hover:scale-[1.02] hover:border-slate-350 dark:hover:border-dark-700 hover:shadow-md transition-all duration-300">
            <div className="p-3 bg-rose-500/10 dark:bg-rose-500/20 text-rose-500 rounded-xl">
              <Heart size={20} className={wishlistItems.length > 0 ? "fill-rose-500" : ""} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Wishlist Items</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5 block">{wishlistItems.length}</span>
            </div>
          </motion.div>

          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }} className="glass-panel p-5 rounded-2xl border border-slate-200/60 dark:border-dark-800 flex items-center gap-4 hover:scale-[1.02] hover:border-slate-350 dark:hover:border-dark-700 hover:shadow-md transition-all duration-300">
            <div className="p-3 bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">Delivered</span>
              <span className="text-xl font-extrabold text-slate-800 dark:text-white mt-0.5 block">
                {orders.filter(o => o.isDelivered && !o.isCancelled).length}
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* User Card */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/60 dark:border-dark-800 space-y-6 h-fit transition-colors duration-300">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-dark-800 pb-4">
            Profile Details
          </h2>

          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Full Name
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                {userInfo?.name}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Email Address
              </span>
              <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 block">
                {userInfo?.email}
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                Account Level
              </span>
              <span className="inline-block text-xs font-extrabold mt-1 uppercase px-2 py-0.5 rounded bg-primary-600/10 text-primary-600 dark:text-primary-400 border border-primary-500/20">
                {userInfo?.isAdmin ? 'Administrator' : 'Standard Member'}
              </span>
            </div>

            {/* Eco Rewards Widget */}
            <div className="pt-4 border-t border-slate-100 dark:border-dark-800">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Sparkles size={12} className="text-emerald-500" /> Eco Rewards Tier
              </span>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 shadow-emerald-500/20 drop-shadow-sm">
                  {userInfo?.tier || 'Bronze'}
                </span>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  {userInfo?.ecoPoints || 0} pts
                </span>
              </div>
              
              <div className="w-full bg-slate-100 dark:bg-dark-800 rounded-full h-2 mt-2 overflow-hidden border border-slate-200/50 dark:border-dark-700/50">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${Math.min(100, ((userInfo?.ecoPoints || 0) / (userInfo?.tier === 'Bronze' ? 500 : userInfo?.tier === 'Silver' ? 2000 : 1)) * 100)}%` }}
                ></div>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1.5 text-right font-medium">
                {userInfo?.tier === 'Gold' ? 'Max Tier Reached!' : `Next tier at ${userInfo?.tier === 'Bronze' ? 500 : 2000} pts`}
              </p>
            </div>
          </div>
        </div>

        {/* Main Tabs Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tab Headers */}
          <div className="flex gap-6 border-b border-slate-250 dark:border-dark-800 pb-2 transition-colors duration-300">
            <button
              onClick={() => setSearchParams({ tab: 'orders' })}
              className={`pb-2 text-base font-bold flex items-center gap-2 transition-all relative ${
                activeTab === 'orders'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-400 hover:text-slate-650 dark:text-slate-500 dark:hover:text-slate-350'
              }`}
            >
              <ShoppingBag size={16} />
              Order History
              {activeTab === 'orders' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
              )}
            </button>
            <button
              onClick={() => setSearchParams({ tab: 'wishlist' })}
              className={`pb-2 text-base font-bold flex items-center gap-2 transition-all relative ${
                activeTab === 'wishlist'
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-slate-400 hover:text-slate-655 dark:text-slate-500 dark:hover:text-slate-350'
              }`}
            >
              <Heart size={16} className={wishlistItems.length > 0 ? "fill-rose-500/20 text-rose-500" : ""} />
              My Wishlist
              {wishlistItems.length > 0 && (
                <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-black rounded-full bg-rose-500 text-white leading-tight">
                  {wishlistItems.length}
                </span>
              )}
              {activeTab === 'wishlist' && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600 dark:bg-primary-400 rounded-full" />
              )}
            </button>
          </div>

          {activeTab === 'orders' ? (
            <>
              {loading ? (
                <Loader message="Fetching your order history..." />
              ) : error ? (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
                  {error}
                </div>
              ) : orders.length === 0 ? (
                <div className="glass-panel rounded-3xl p-8 border border-slate-200/60 dark:border-dark-800 text-center text-slate-500 text-sm">
                  You haven't placed any orders yet. Visit our shop catalog to get started!
                </div>
              ) : (
                <div className="glass-panel rounded-3xl border border-slate-200/60 dark:border-dark-800/80 overflow-hidden shadow-sm dark:shadow-none transition-colors duration-300">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 dark:bg-dark-900 border-b border-slate-100 dark:border-dark-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                          <th className="py-4 px-5">Order ID</th>
                          <th className="py-4 px-5">Date</th>
                          <th className="py-4 px-5">Total</th>
                          <th className="py-4 px-5">Paid</th>
                          <th className="py-4 px-5">Delivered</th>
                          <th className="py-4 px-5 text-right">Invoice</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-150 dark:divide-dark-850">
                        {orders.map((order) => {
                          const isExpanded = expandedOrderId === order._id;
                          const timelineSteps = [
                            { label: 'Placed', done: true, time: order.createdAt },
                            { label: 'Paid', done: order.isPaid, time: order.paidAt },
                            { label: 'In Transit', done: order.isShipped, time: order.shippedAt },
                            { label: 'Delivered', done: order.isDelivered, time: order.deliveredAt },
                          ];
                          
                          return (
                            <React.Fragment key={order._id}>
                              <tr 
                                onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                                className="text-sm hover:bg-slate-50/50 dark:hover:bg-dark-900/30 transition-colors cursor-pointer"
                              >
                                <td className="py-4 px-5 font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                                  {order._id.substring(0, 10)}...
                                </td>
                                <td className="py-4 px-5 text-slate-500 dark:text-slate-400 font-semibold">
                                  {formatDate(order.createdAt)}
                                </td>
                                <td className="py-4 px-5 text-slate-800 dark:text-slate-200 font-bold">
                                  {formatPrice(order.totalPrice)}
                                </td>
                                <td className="py-4 px-5">
                                  {order.isCancelled ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 dark:text-slate-500 line-through">
                                      -
                                    </span>
                                  ) : order.isPaid ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 size={12} /> Yes
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 dark:text-red-400">
                                      <Clock size={12} /> Pending
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 px-5">
                                  {order.isCancelled ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-wider border border-red-500/20">
                                      Cancelled
                                    </span>
                                  ) : order.isReturnRequested ? (
                                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase tracking-wider border border-indigo-500/20">
                                      Returned
                                    </span>
                                  ) : order.isDelivered ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                      <CheckCircle2 size={12} /> Delivered
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 dark:text-amber-400">
                                      <Clock size={12} /> In Transit
                                    </span>
                                  )}
                                </td>
                                <td className="py-4 px-5 text-right">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedOrderForInvoice(order);
                                    }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-900 dark:hover:bg-dark-800 text-slate-700 dark:text-slate-350 text-xs font-bold rounded-xl border border-slate-200 dark:border-dark-800 hover:border-slate-300 dark:hover:border-dark-700 transition-all active:scale-95"
                                    title="Print Invoice"
                                  >
                                    <Printer size={12} /> Print
                                  </button>
                                </td>
                              </tr>
                              {isExpanded && (
                                <tr className="bg-slate-50/25 dark:bg-dark-950/10">
                                  <td colSpan={6} className="px-6 py-6 border-b border-slate-200 dark:border-dark-850">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                      {/* Left timeline col */}
                                      <div className="md:col-span-2 space-y-4">
                                        <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                          Delivery Tracker
                                        </h4>
                                        
                                        {actionError && (
                                          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-xl font-semibold">
                                            {actionError}
                                          </div>
                                        )}

                                        {order.isCancelled ? (
                                          <div className="p-5 rounded-2xl bg-red-500/5 border border-red-500/10 text-red-600 dark:text-red-400 space-y-2">
                                            <p className="text-sm font-extrabold flex items-center gap-2">
                                              🚫 Order Cancelled
                                            </p>
                                            <p className="text-xs leading-relaxed opacity-90">
                                              This order was cancelled on {formatDate(order.cancelledAt)}. Restored inventory has been returned to stock, and any processed payments will be refunded.
                                            </p>
                                          </div>
                                        ) : (
                                          <>
                                            {order.isReturnRequested && (
                                              <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-indigo-650 dark:text-indigo-400 space-y-2 mb-4">
                                                <p className="text-sm font-extrabold flex items-center gap-2">
                                                  🔄 Return Request Pending Review
                                                </p>
                                                <p className="text-xs leading-relaxed opacity-90">
                                                  A return request was submitted on {formatDate(order.returnRequestedAt)}. Our team is currently reviewing your return. You will receive a prepaid shipping label via email shortly.
                                                </p>
                                              </div>
                                            )}

                                            <div className="flex items-center justify-between relative w-full pt-4 pb-2 max-w-md mx-auto">
                                              {/* Connecting line backgrounds */}
                                              <div className="absolute top-[28px] left-[12%] right-[12%] h-[2px] bg-slate-200 dark:bg-dark-800 -z-10" />
                                              <div 
                                                className="absolute top-[28px] left-[12%] h-[2px] bg-emerald-500 transition-all duration-500 -z-10" 
                                                style={{
                                                  width: order.isDelivered 
                                                    ? '76%' 
                                                    : order.isShipped 
                                                      ? '50%' 
                                                      : order.isPaid 
                                                        ? '25%' 
                                                        : '0%'
                                                }}
                                              />
                                              
                                              {timelineSteps.map((step, idx) => (
                                                <div key={idx} className="flex flex-col items-center text-center space-y-2 relative w-[25%]">
                                                  <div 
                                                    className={`w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                                      step.done
                                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/10'
                                                        : 'bg-white dark:bg-dark-900 border-slate-250 dark:border-dark-800 text-slate-400 dark:text-slate-500'
                                                    }`}
                                                  >
                                                    {step.done ? <CheckCircle2 size={13} className="stroke-[3px]" /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-dark-750" />}
                                                  </div>
                                                  <div>
                                                    <p className={`text-[10px] font-extrabold uppercase tracking-wide ${step.done ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                                                      {step.label}
                                                    </p>
                                                    {step.done && step.time && (
                                                      <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">
                                                        {formatDate(step.time).substring(0, 10)}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                            </div>

                                            {/* Action Buttons */}
                                            <div className="flex gap-4 pt-6 justify-start border-t border-slate-100 dark:border-dark-850 mt-6">
                                              {!order.isDelivered && (
                                                (() => {
                                                  const hoursElapsed = (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
                                                  const isWithin12Hours = hoursElapsed <= 12;

                                                  return isWithin12Hours ? (
                                                    <button
                                                      disabled={actionLoading === order._id}
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCancelOrder(order._id);
                                                      }}
                                                      className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-650 dark:text-red-400 text-xs font-extrabold rounded-xl border border-red-500/20 hover:border-red-500/40 transition-all disabled:opacity-45"
                                                    >
                                                      {actionLoading === order._id ? 'Processing...' : 'Cancel Order'}
                                                    </button>
                                                  ) : (
                                                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 italic">
                                                      Cancellation window (12 hours) has expired.
                                                    </span>
                                                  );
                                                })()
                                              )}

                                              {order.isDelivered && !order.isReturnRequested && (
                                                <button
                                                  disabled={actionLoading === order._id}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRequestReturn(order._id);
                                                  }}
                                                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold rounded-xl shadow-md transition-all disabled:opacity-45"
                                                >
                                                  {actionLoading === order._id ? 'Processing...' : 'Request Return'}
                                                </button>
                                              )}

                                              <button
                                                disabled={actionLoading === order._id}
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleDeleteOrder(order._id);
                                                }}
                                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold rounded-xl shadow-md transition-all disabled:opacity-45 ml-auto flex items-center gap-1"
                                                title="Permanently Delete Order"
                                              >
                                                <Trash2 size={14} /> Delete
                                              </button>
                                            </div>
                                          </>
                                        )}
                                      </div>

                                      {/* Right particulars col */}
                                      <div className="space-y-4 border-t md:border-t-0 md:border-l border-slate-200 dark:border-dark-800/80 pt-4 md:pt-0 md:pl-6 transition-colors">
                                        <div className="space-y-2">
                                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                            Shipping Particulars
                                          </h4>
                                          <div className="text-xs text-slate-650 dark:text-slate-400 space-y-1">
                                            <p className="font-bold text-slate-900 dark:text-white">{order.user?.name || 'Customer'}</p>
                                            <p>{order.shippingAddress?.address}</p>
                                            <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                                            <p>{order.shippingAddress?.country}</p>
                                          </div>
                                        </div>

                                        <div className="space-y-2.5">
                                          <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                            Order Items ({order.orderItems?.reduce((a, c) => a + c.qty, 0)} qty)
                                          </h4>
                                          <div className="space-y-2">
                                            {order.orderItems?.map((item) => (
                                              <div key={item._id || item.product} className="flex justify-between items-center text-xs py-1 border-b border-slate-100 dark:border-dark-900/60 last:border-0">
                                                <span className="text-slate-705 dark:text-slate-350 truncate max-w-[130px]" title={item.name}>
                                                  {item.name} <span className="text-slate-400 font-bold">x{item.qty}</span>
                                                </span>
                                                <span className="font-bold text-slate-900 dark:text-white shrink-0">
                                                  {formatPrice(item.price * item.qty)}
                                                </span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="space-y-6">
              {wishlistItems.length === 0 ? (
                <div className="glass-panel rounded-3xl p-8 border border-slate-200/60 dark:border-dark-800 text-center text-slate-500 text-sm">
                  Your wishlist is empty. Explore our catalog and add items to your wishlist!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {wishlistItems.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {selectedOrderForInvoice && (
        <Invoice
          order={selectedOrderForInvoice}
          onClose={() => setSelectedOrderForInvoice(null)}
        />
      )}
    </AnimatedPage>
  );
};

export default Profile;
