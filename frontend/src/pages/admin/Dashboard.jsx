import React, { useState } from 'react';
import useFetch from '../../hooks/useFetch';
import StatCard from '../../components/admin/StatCard';
import ChartContainer from '../../components/admin/ChartContainer';
import SalesChart from '../../components/admin/SalesChart';
import Loader from '../../components/common/Loader';
import { DollarSign, ShoppingBag, ShoppingCart, Users } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const Dashboard = () => {
  const { formatPrice } = useCurrency();
  const [timeframe, setTimeframe] = useState('30days');
  const { data, loading, error } = useFetch(`/admin/overview?timeframe=${timeframe}`);

  if (loading) return <Loader message="Fetching dashboard analytics..." />;
  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
        {error}
      </div>
    );
  }

  const stats = data?.stats || { totalRevenue: 0, totalOrders: 0, activeOrders: 0, totalUsers: 0, totalProducts: 0 };
  const chartData = data?.chartData || [];
  const lowStockAlerts = data?.lowStockAlerts || [];

  return (
    <div className="space-y-8 flex-grow pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Overview Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Monitor revenue statistics, products inventory levels, and orders status.
          </p>
        </div>
        
        {/* Timeframe selector tabs */}
        <div className="flex bg-slate-100 dark:bg-dark-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-dark-850/50 transition-colors">
          {[
            { id: '7days', label: '7 Days' },
            { id: '30days', label: '30 Days' },
            { id: 'all', label: 'Monthly' },
          ].map((tf) => (
            <button
              key={tf.id}
              onClick={() => setTimeframe(tf.id)}
              className={`px-4 py-2 text-xs font-extrabold rounded-xl transition-all duration-300 ${
                timeframe === tf.id
                  ? 'bg-white dark:bg-dark-800 text-primary-600 dark:text-primary-400 shadow-md border border-slate-200/20'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {tf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard
          title="Total Revenue"
          value={formatPrice(stats.totalRevenue)}
          icon={DollarSign}
          trend="+12.5%"
          description="from last month"
        />
        <StatCard
          title="Orders Completed"
          value={stats.totalOrders}
          icon={ShoppingCart}
          trend="+8.2%"
          description="sales volume"
        />
        <StatCard
          title="Active Shipments"
          value={stats.activeOrders}
          icon={ShoppingBag}
          description="pending delivery"
        />
        <StatCard
          title="Registered Users"
          value={stats.totalUsers}
          icon={Users}
          trend="+5.4%"
          description="user acquisition"
        />
        <StatCard
          title="Admin Commission"
          value={formatPrice(stats.totalCommission || 0)}
          icon={DollarSign}
          trend="5% cut"
          description="from agent sales"
        />
      </div>

      {/* Chart and Alerts section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <ChartContainer data={chartData} title="Revenue Growth & Trends" />
          <SalesChart />
        </div>

        {/* Inventory alert card panel */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/60 dark:border-dark-800 flex flex-col h-full min-h-[350px] max-h-[450px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-800 pb-4">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-250 flex items-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-ping"></span>
              Inventory Alerts
            </h3>
            <span className="text-[10px] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold px-2.5 py-0.5 rounded-full">
              {lowStockAlerts.length} Warnings
            </span>
          </div>

          <div className="flex-grow overflow-y-auto space-y-3.5 pr-1 mt-4">
            {lowStockAlerts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 py-12 space-y-2">
                <span className="text-2xl">🎉</span>
                <p className="text-xs font-bold text-slate-605 dark:text-slate-350">All stocks healthy!</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500">No items are under critical threshold of 5 units.</p>
              </div>
            ) : (
              lowStockAlerts.map((product) => (
                <div 
                  key={product._id} 
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-dark-900/40 border border-slate-150 dark:border-dark-850 rounded-2xl hover:scale-[1.01] transition-transform duration-300"
                >
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-10 h-10 rounded-xl object-cover border border-slate-200/65 dark:border-dark-800"
                  />
                  <div className="flex-grow min-w-0">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={product.name}>
                      {product.name}
                    </h4>
                    <p className="text-[10px] text-slate-500 dark:text-slate-450 mt-0.5 font-medium">
                      Price: {formatPrice(product.price)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="inline-block text-[10px] font-black bg-rose-500/10 border border-rose-500/20 text-rose-500 px-2 py-0.5 rounded-lg">
                      {product.countInStock} Left
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
