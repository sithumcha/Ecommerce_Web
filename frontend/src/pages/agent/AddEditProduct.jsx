import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Upload, Sparkles, AlertCircle, HelpCircle } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';
import { useCurrency } from '../../context/CurrencyContext';
import { AuthContext } from '../../context/AuthContext';
import AnimatedPage from '../../components/common/AnimatedPage';

const AddEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { userInfo } = useContext(AuthContext);

  const isEditMode = !!id;

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [countInStock, setCountInStock] = useState('10');
  const [description, setDescription] = useState('');
  const [shippingPrice, setShippingPrice] = useState('0');
  const [isFreeShipping, setIsFreeShipping] = useState(true);

  // Status states
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch product data if in edit mode
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        setLoading(true);
        setError(null);
        try {
          const { data } = await api.get(`/products/${id}`);
          setName(data.name);
          setPrice(data.price);
          setImage(data.image);
          setBrand(data.brand);
          setCategory(data.category);
          setCountInStock(data.countInStock);
          setDescription(data.description);
          setShippingPrice(data.shippingPrice !== undefined ? String(data.shippingPrice) : '0');
          setIsFreeShipping(data.shippingPrice === 0 || data.shippingPrice === undefined);
        } catch (err) {
          setError(err.response?.data?.message || 'Failed to load product details');
        } finally {
          setLoading(false);
        }
      };
      fetchProduct();
    } else {
      setBrand(userInfo?.name || '');
    }
  }, [id, isEditMode, userInfo]);

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
    setError(null);

    const payload = {
      name,
      price: Number(price) || 0,
      image,
      brand,
      category,
      countInStock: Number(countInStock) || 0,
      description,
      shippingPrice: isFreeShipping ? 0 : Number(shippingPrice) || 0,
    };

    try {
      if (isEditMode) {
        await api.put(`/products/${id}`, payload);
      } else {
        // Create blank model template, then update with values
        const { data } = await api.post('/products', payload);
        await api.put(`/products/${data._id}`, payload);
      }
      navigate('/agent/products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product listing');
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader message="Loading product configuration details..." />
      </div>
    );
  }

  return (
    <AnimatedPage>
      <div className="max-w-6xl mx-auto space-y-6 pb-20">
        {/* Top Header Navigation */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 dark:border-dark-800 pb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/agent/products')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-dark-800 hover:border-slate-350 dark:hover:border-slate-600 bg-white dark:bg-dark-900 text-slate-700 dark:text-slate-200 transition-all active:scale-95 shadow-sm"
              title="Go Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {isEditMode ? 'Edit Product Listing' : 'Create Product Listing'}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                {isEditMode ? 'Modify your product details and parameters.' : 'Publish a new product to the global marketplace.'}
              </p>
            </div>
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button
              variant="secondary"
              onClick={() => navigate('/agent/products')}
              className="flex-grow sm:flex-grow-0"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              loading={submitLoading}
              icon={Save}
              className="flex-grow sm:flex-grow-0 shadow-lg shadow-primary-500/20"
            >
              Save Product
            </Button>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400 text-sm rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} className="shrink-0" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Main Workspace Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Side: Form Controls */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            {/* Section 1: Basic Information */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-dark-800/80 shadow-xl space-y-6 bg-white dark:bg-dark-900/30">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-dark-800">
                <Sparkles size={18} className="text-primary-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Basic Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Product Title
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Premium Wireless Gaming Headset"
                    className="form-input w-full py-3 text-sm rounded-xl focus:border-primary-500 bg-white dark:bg-dark-950 border-slate-200 dark:border-dark-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Brand / Seller Name
                    </label>
                    <input
                      type="text"
                      required
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="e.g. Sony, Logitech"
                      className="form-input w-full py-3 text-sm rounded-xl bg-white dark:bg-dark-950 border-slate-200 dark:border-dark-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                      Category
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="form-input w-full py-3 text-sm bg-white dark:bg-dark-950 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-dark-800 rounded-xl"
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
                    Product Description
                  </label>
                  <textarea
                    required
                    rows="4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe product highlights, specifications, features, and package details..."
                    className="form-input w-full text-sm resize-none rounded-xl bg-white dark:bg-dark-950 border-slate-200 dark:border-dark-800"
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Section 2: Pricing & Inventory */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-dark-800/80 shadow-xl space-y-6 bg-white dark:bg-dark-900/30">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-dark-800">
                <Sparkles size={18} className="text-emerald-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pricing & Logistics</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Unit Price ($)
                  </label>
                  <div className="relative rounded-xl shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="text-slate-400 text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="99.99"
                      className="form-input w-full pl-8 py-3 text-sm bg-white dark:bg-dark-950 border-slate-200 dark:border-dark-800 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Available Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={countInStock}
                    onChange={(e) => setCountInStock(e.target.value)}
                    placeholder="25"
                    className="form-input w-full py-3 text-sm bg-white dark:bg-dark-950 border-slate-200 dark:border-dark-800 rounded-xl"
                  />
                </div>
              </div>

              {/* Shipping Configurations */}
              <div className="p-5 rounded-2xl border border-slate-200/50 dark:border-dark-800/80 bg-slate-50/40 dark:bg-dark-950/20 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Shipping Method Settings
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                      Free Shipping Available
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <label className="flex items-center gap-3 cursor-pointer select-none py-2 shrink-0">
                    <input
                      type="checkbox"
                      checked={isFreeShipping}
                      onChange={(e) => {
                        setIsFreeShipping(e.target.checked);
                        if (e.target.checked) setShippingPrice('0');
                      }}
                      className="rounded border-slate-300 text-primary-600 focus:ring-primary-500 w-4.5 h-4.5 cursor-pointer"
                    />
                    <span className="text-sm font-bold text-slate-750 dark:text-slate-200">
                      Offer Free Shipping
                    </span>
                  </label>

                  {!isFreeShipping && (
                    <div className="w-full sm:max-w-xs animate-in slide-in-from-left-2 fade-in duration-300">
                      <div className="relative rounded-xl shadow-sm">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                          <span className="text-slate-400 text-sm">$</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required={!isFreeShipping}
                          value={shippingPrice}
                          onChange={(e) => setShippingPrice(e.target.value)}
                          placeholder="5.00"
                          className="form-input w-full pl-8 py-3 text-sm bg-white dark:bg-dark-950 border-slate-200 dark:border-dark-800 rounded-xl"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Product Visual Media */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/60 dark:border-dark-800/80 shadow-xl space-y-6 bg-white dark:bg-dark-900/30">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-dark-800">
                <Sparkles size={18} className="text-indigo-500" />
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Product Visuals</h2>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Product Image Uploader or URL
                </label>
                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                  {/* File Selector */}
                  <div className="relative flex-grow border-2 border-dashed border-slate-200 dark:border-dark-800 rounded-2xl p-4 text-center hover:border-slate-350 dark:hover:border-slate-600 transition-colors flex flex-col justify-center items-center gap-2 min-h-[140px] bg-slate-50/30 dark:bg-dark-950/10">
                    <Upload size={24} className="text-slate-400" />
                    <div>
                      <span className="text-xs font-bold text-primary-600 hover:text-primary-500 cursor-pointer">
                        Upload Image File
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                    </div>
                    <span className="text-[10px] text-slate-450 dark:text-slate-500">Supports PNG, JPG, WEBP formats</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 block text-center uppercase tracking-widest">— Or enter an Image URL directly —</span>
                  <input
                    type="url"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="form-input w-full py-2.5 text-xs rounded-xl bg-white dark:bg-dark-950 border-slate-200 dark:border-dark-800"
                  />
                </div>
              </div>
            </div>
          </form>

          {/* Right Side: Real-Time Live Shop Preview Card */}
          <div className="lg:col-span-1 lg:sticky lg:top-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Live Store Card Preview
              </h3>
              <div className="flex items-center gap-1.5 text-xs font-bold text-primary-600 dark:text-primary-400">
                <Sparkles size={12} className="animate-spin duration-3000" />
                Real-Time Preview
              </div>
            </div>

            {/* Live Interactive Shop Card */}
            <motion.div
              layout
              className="glass-panel overflow-hidden rounded-3xl border border-slate-200/80 dark:border-dark-800/80 bg-white dark:bg-dark-900 shadow-xl group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              {/* Image Preview Container */}
              <div className="relative aspect-[4/3] bg-slate-50 dark:bg-dark-950 overflow-hidden border-b border-slate-100 dark:border-dark-850 shrink-0">
                <img
                  src={image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'}
                  alt={name || 'Placeholder'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute top-3 right-3 flex flex-col gap-1.5">
                  <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-white/95 dark:bg-dark-900/90 text-slate-800 dark:text-white uppercase tracking-wider shadow-md border border-slate-200/50 dark:border-dark-850">
                    {category}
                  </span>
                </div>
              </div>

              {/* Card Details Body */}
              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {brand || 'Brand Name'}
                  </span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-base line-clamp-2 leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {name || 'Product Title Example'}
                  </h4>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 dark:border-dark-850/50 pt-3">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">Price</span>
                    <span className="font-extrabold text-slate-950 dark:text-white text-lg">
                      {formatPrice(Number(price) || 0)}
                    </span>
                  </div>
                  <div className="text-right">
                    {isFreeShipping ? (
                      <span className="px-2.5 py-1 text-[10px] font-black rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-450 uppercase tracking-wide">
                        Free Shipping
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 dark:bg-dark-800 text-slate-600 dark:text-slate-450 block">
                        + Shipping: {formatPrice(Number(shippingPrice) || 0)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Quick Tips */}
            <div className="p-5 rounded-2xl bg-primary-600/5 border border-primary-500/10 text-xs text-slate-550 dark:text-slate-400 space-y-2 leading-relaxed">
              <div className="flex items-center gap-1.5 font-bold text-primary-650 dark:text-primary-400">
                <HelpCircle size={14} /> Tips for Success
              </div>
              <p>
                Use descriptive titles and list key product features first. Professional images get up to 3x higher CTR.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default AddEditProduct;
