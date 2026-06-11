import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import { useCurrency } from '../../context/CurrencyContext';
import { formatDate } from '../../utils/format';
import { CheckCircle2, Clock, Truck } from 'lucide-react';

const ManageOrders = () => {
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/orders');
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handlePay = async (id) => {
    try {
      const { data } = await api.put(`/orders/${id}/pay-admin`);
      setOrders(orders.map((o) => (o._id === id ? { ...o, isPaid: data.isPaid, paidAt: data.paidAt } : o)));
    } catch (err) {
      alert('Payment update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleShip = async (id) => {
    try {
      const { data } = await api.put(`/orders/${id}/ship`);
      setOrders(orders.map((o) => (o._id === id ? { ...o, isShipped: data.isShipped, shippedAt: data.shippedAt } : o)));
    } catch (err) {
      alert('Shipping update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeliver = async (id) => {
    try {
      const { data } = await api.put(`/orders/${id}/deliver`);
      setOrders(orders.map((o) => (o._id === id ? { ...o, isDelivered: data.isDelivered, deliveredAt: data.deliveredAt } : o)));
    } catch (err) {
      alert('Delivery update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-6 flex-grow pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Manage Orders</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          Review orders, track shipping status, and verify transactions.
        </p>
      </div>

      {loading ? (
        <Loader message="Fetching customer orders log..." />
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-200/60 dark:border-dark-800/80 overflow-hidden shadow-xl transition-colors duration-300">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-dark-900 border-b border-slate-100 dark:border-dark-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">
                      <th className="py-4 px-5">ID</th>
                      <th className="py-4 px-5">Customer</th>
                      <th className="py-4 px-5">Date</th>
                      <th className="py-4 px-5">Total</th>
                      <th className="py-4 px-5">Paid</th>
                      <th className="py-4 px-5">Shipped</th>
                      <th className="py-4 px-5">Delivered</th>
                      <th className="py-4 px-5">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-dark-900 text-sm">
                    {orders.map((order) => (
                      <tr key={order._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-900/30 transition-colors">
                        <td className="py-4 px-5 font-mono text-xs font-bold text-slate-600 dark:text-slate-400">
                          {order._id.substring(0, 10)}...
                        </td>
                        <td className="py-4 px-5 text-slate-800 dark:text-slate-200 font-semibold">
                          {order.user ? order.user.name : 'Unknown Customer'}
                        </td>
                        <td className="py-4 px-5 text-slate-500 dark:text-slate-400 font-medium">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="py-4 px-5 font-bold text-slate-900 dark:text-slate-200">
                          {formatPrice(order.totalPrice)}
                        </td>
                        <td className="py-4 px-5">
                          {order.isPaid ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 size={12} /> Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 dark:text-red-400">
                              <Clock size={12} /> No
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          {order.isShipped ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-650 dark:text-indigo-400">
                              <CheckCircle2 size={12} /> Shipped
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-red-500 dark:text-red-400">
                              <Clock size={12} /> No
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          {order.isDelivered ? (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              <CheckCircle2 size={12} /> Delivered
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-500 dark:text-amber-400">
                              <Clock size={12} /> Processing
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-5">
                          {order.isCancelled ? (
                            <span className="text-xs font-extrabold text-red-500 dark:text-red-400 uppercase">Cancelled</span>
                          ) : !order.isPaid ? (
                            <button
                              onClick={() => handlePay(order._id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-500/10 hover:bg-emerald-500 hover:text-white border border-emerald-500/20 text-emerald-600 transition-all active:scale-95 shrink-0"
                            >
                              <CheckCircle2 size={12} /> Mark Paid
                            </button>
                          ) : !order.isShipped ? (
                            <button
                              onClick={() => handleShip(order._id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-indigo-500/10 hover:bg-indigo-600 hover:text-white border border-indigo-500/20 text-indigo-600 transition-all active:scale-95 shrink-0"
                            >
                              <Truck size={12} /> Ship Order
                            </button>
                          ) : !order.isDelivered ? (
                            <button
                              onClick={() => handleDeliver(order._id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-primary-600/10 hover:bg-primary-600 hover:text-white border border-primary-500/20 text-primary-600 transition-all active:scale-95 shrink-0"
                            >
                              <Truck size={12} /> Mark Delivered
                            </button>
                          ) : (
                            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wide">Complete</span>
                          )}
                        </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageOrders;
