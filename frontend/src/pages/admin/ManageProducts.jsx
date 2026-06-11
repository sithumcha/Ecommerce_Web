import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { useCurrency } from '../../context/CurrencyContext';
import { Plus, Edit2, Trash2, X, Image } from 'lucide-react';

const ManageProducts = () => {
  const { formatPrice } = useCurrency();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Edit / Create Form states
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [editingId, setEditingId] = useState(null);

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/products');
      setProducts(data.products || []);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingId(null);
    setModalTitle('Add New Product');
    setName('');
    setPrice('');
    setImage('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');
    setBrand('');
    setCategory('Electronics');
    setCountInStock('10');
    setDescription('');
    setShowModal(true);
  };

  const handleOpenEditModal = (product) => {
    setEditingId(product._id);
    setModalTitle('Edit Product');
    setName(product.name);
    setPrice(product.price);
    setImage(product.image);
    setBrand(product.brand);
    setCategory(product.category);
    setCountInStock(product.countInStock);
    setDescription(product.description);
    setShowModal(true);
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

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const payload = {
      name,
      price: Number(price),
      image,
      brand,
      category,
      countInStock: Number(countInStock),
      description,
    };

    try {
      if (editingId) {
        const { data } = await api.put(`/products/${editingId}`, payload);
        setProducts(products.map((p) => (p._id === editingId ? data : p)));
      } else {
        const { data } = await api.post('/products', payload);
        // Backend creates product template, then we update it
        const { data: updatedData } = await api.put(`/products/${data._id}`, payload);
        setProducts([updatedData, ...products]);
      }
      setShowModal(false);
    } catch (err) {
      alert('Save failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 flex-grow pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors">Manage Products</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
            Configure catalogs, prices, descriptions, and stock parameters.
          </p>
        </div>
        <Button variant="primary" onClick={handleOpenCreateModal} icon={Plus}>
          Add Product
        </Button>
      </div>

      {loading ? (
        <Loader message="Fetching product inventory..." />
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
                  <th className="py-4 px-5">Image</th>
                  <th className="py-4 px-5">Name</th>
                  <th className="py-4 px-5">Category</th>
                  <th className="py-4 px-5">Price</th>
                  <th className="py-4 px-5">Stock</th>
                  <th className="py-4 px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-dark-900 text-sm">
                {products.map((product) => (
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit/Create Modal Overlay */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-dark-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-slate-200 dark:border-dark-850 p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-200 transition-colors duration-300">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-800 pb-4 transition-colors">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{modalTitle}</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Mechanical Keyboard"
                  className="form-input w-full py-2.5 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="99.99"
                    className="form-input w-full py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Stock count
                  </label>
                  <input
                    type="number"
                    required
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    placeholder="25"
                    className="form-input w-full py-2.5 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Product Image
                </label>
                <div className="flex items-center gap-4">
                  {image && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-50 border border-slate-200 shrink-0">
                      <img src={image} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="form-input w-full py-2 px-3 text-sm text-slate-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    required
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    placeholder="Keychron"
                    className="form-input w-full py-2.5 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="form-input w-full py-2.5 text-sm bg-white dark:bg-dark-900 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-dark-800"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Sports">Sports</option>
                    <option value="Beauty">Beauty</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Toys">Toys</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide product details..."
                  className="form-input w-full text-sm resize-none"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-dark-800 justify-end">
                <Button variant="secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" loading={submitLoading}>
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
