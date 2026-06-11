import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { useCurrency } from '../../context/CurrencyContext';
import { AuthContext } from '../../context/AuthContext';
import { Plus, Edit2, Trash2, TrendingUp, DollarSign, Briefcase, Percent } from 'lucide-react';

const AgentProducts = () => {
  const { userInfo } = useContext(AuthContext);
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [earnings, setEarnings] = useState({
    totalSales: 0,
    totalCommission: 0,
    netEarnings: 0,
    totalItemsSold: 0
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [productsRes, earningsRes] = await Promise.all([
        api.get('/products/myproducts'),
        api.get('/orders/agent/earnings')
      ]);
      setProducts(productsRes.data);
      setEarnings(earningsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreateModal = () => {
    navigate('/agent/products/create');
  };

  const handleOpenEditModal = (product) => {
    navigate(`/agent/products/edit/${product._id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter((p) => p._id !== id));
    } catch (err) {
      alert('Delete failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-8 flex-grow pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Agent Portal</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Manage your products and view your sales performance.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal} icon={Plus}>
          Add Product
        </Button>
      </div>

      {loading ? (
        <Loader message="Loading agent dashboard..." />
      ) : error ? (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl">
          {error}
        </div>
      ) : (
        <>
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-dark-800/80 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-primary-500/10 dark:bg-primary-500/5 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-all duration-500"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 flex items-center justify-center shrink-0">
                  <DollarSign size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Gross Sales</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{formatPrice(earnings.totalSales)}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-dark-800/80 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all duration-500"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                  <Percent size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Commission (3%)</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{formatPrice(earnings.totalCommission)}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-dark-800/80 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all duration-500"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <TrendingUp size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Net Earnings</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{formatPrice(earnings.netEarnings)}</p>
                </div>
              </div>
            </div>

            <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-dark-800/80 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute -right-6 -top-6 w-24 h-24 bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all duration-500"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Briefcase size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">Items Sold</p>
                  <p className="text-2xl font-black text-slate-800 dark:text-white">{earnings.totalItemsSold}</p>
                </div>
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight mt-10 mb-4">My Products</h2>

          {/* Products Table */}
          <div className="glass-panel rounded-3xl border border-slate-200/60 dark:border-dark-800/80 overflow-hidden shadow-xl transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-dark-900 border-b border-slate-100 dark:border-dark-800 text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors duration-300">
                    <th className="py-4 px-5">Image</th>
                    <th className="py-4 px-5">Name</th>
                    <th className="py-4 px-5">Category</th>
                    <th className="py-4 px-5">Price</th>
                    <th className="py-4 px-5">Stock</th>
                    <th className="py-4 px-5">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-dark-900 text-sm">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="py-8 text-center text-slate-500">
                        You have not listed any products yet.
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => (
                      <tr key={product._id} className="hover:bg-slate-50/50 dark:hover:bg-dark-900/30 transition-colors">
                        <td className="py-3 px-5">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </td>
                        <td className="py-3 px-5 font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 max-w-[200px] mt-2.5">
                          {product.name}
                        </td>
                        <td className="py-3 px-5 text-slate-500 dark:text-slate-400 font-semibold">{product.category}</td>
                        <td className="py-3 px-5 font-bold text-slate-900 dark:text-slate-200">
                          {formatPrice(product.price)}
                        </td>
                        <td className="py-3 px-5">
                          <span
                            className={`text-xs font-extrabold uppercase px-2 py-0.5 rounded ${
                              product.countInStock > 0
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                                : 'bg-red-500/10 text-red-650 dark:text-red-400'
                            }`}
                          >
                            {product.countInStock} Left
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleOpenEditModal(product)}
                              className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-dark-800 transition-all"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(product._id)}
                              className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-500/10 transition-all"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AgentProducts;
