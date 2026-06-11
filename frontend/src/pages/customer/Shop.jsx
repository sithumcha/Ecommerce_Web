import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import ProductGrid from '../../components/product/ProductGrid';
import ProductSkeleton from '../../components/product/ProductSkeleton';
import Loader from '../../components/common/Loader';
import AnimatedPage from '../../components/common/AnimatedPage';
import { useCurrency } from '../../context/CurrencyContext';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, RefreshCw } from 'lucide-react';

const Shop = () => {
  const { formatPrice } = useCurrency();
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states initialized from URL search params if present
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [rating, setRating] = useState(searchParams.get('rating') || '');

  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  // Synchronize category state when URL search parameters change (e.g. from homepage click)
  useEffect(() => {
    setCategory(searchParams.get('category') || '');
  }, [searchParams]);

  const fetchFilteredProducts = async (page = 1, shouldAppend = false) => {
    if (page === 1) setLoading(true);
    else setLoadingMore(true);
    setError(null);
    try {
      const params = { pageNumber: page, pageSize: 8 };
      if (keyword) params.keyword = keyword;
      if (category) params.category = category;
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (rating) params.rating = rating;

      const { data } = await api.get('/products', { params });
      setProducts(prev => shouldAppend ? [...prev, ...data.products] : data.products);
      setHasMore(data.page < data.pages);
    } catch (err) {
      setError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      if (page === 1) setLoading(false);
      else setLoadingMore(false);
    }
  };

  // Fetch filtered products from backend API when filters change
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPageNumber(1);
      fetchFilteredProducts(1, false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [keyword, category, minPrice, maxPrice, rating]);

  // Fetch more products when pageNumber changes
  useEffect(() => {
    if (pageNumber > 1) {
      fetchFilteredProducts(pageNumber, true);
    }
  }, [pageNumber]);

  // Intersection Observer for Infinite Scroll
  const observer = useRef();
  const lastElementRef = useCallback(node => {
    if (loading || loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPageNumber(prevPageNumber => prevPageNumber + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, loadingMore, hasMore]);

  const handleResetFilters = () => {
    setKeyword('');
    setCategory('');
    setMinPrice('');
    setMaxPrice('');
    setRating('');
    setSearchParams({});
  };

  const handleCategoryClick = (catName) => {
    const nextCat = category === catName ? '' : catName;
    setCategory(nextCat);
    if (nextCat) {
      setSearchParams({ category: nextCat });
    } else {
      setSearchParams({});
    }
  };

  return (
    <AnimatedPage className="pb-16">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-dark-950 dark:via-dark-900 dark:to-dark-950 py-16 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">{t('shop.title')}</h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
            {t('shop.subtitle')}
          </p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        {/* Sidebar Filters */}
        <aside className="lg:w-1/4 space-y-6">
          <div className="glass-panel p-6 rounded-3xl border border-slate-200/60 dark:border-dark-800/60 sticky top-24 shadow-xl transition-colors duration-300">
            <div className="flex items-center justify-between mb-6 text-slate-800 dark:text-white">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={20} />
                <h3 className="text-lg font-extrabold tracking-tight">{t('shop.filters')}</h3>
              </div>
              <button
                onClick={handleResetFilters}
                className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-500 dark:hover:text-primary-300 font-semibold flex items-center gap-1 transition-all"
              >
                <RefreshCw size={12} /> {t('shop.reset')}
              </button>
            </div>

            {/* Keyword Search */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase transition-colors">{t('shop.search')}</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder={t('shop.search_placeholder')}
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="form-input w-full pl-4 py-2.5 text-sm"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t('shop.categories')}</label>
              <div className="flex flex-col gap-1.5">
                {['Electronics', 'Fashion', 'Accessories', 'Home & Garden', 'Sports', 'Beauty', 'Automotive', 'Toys'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleCategoryClick(cat)}
                    className={`w-full text-left px-3.5 py-2.5 text-sm rounded-xl border transition-all ${
                      category === cat
                        ? 'bg-primary-600/10 border-primary-500/30 text-primary-600 dark:text-primary-450 font-semibold'
                        : 'bg-slate-50 dark:bg-dark-950 border-slate-200 dark:border-dark-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Filter */}
            <div className="space-y-2 mb-6">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase transition-colors">{t('shop.price_range')}</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder={t('shop.min')}
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="form-input w-full py-2 px-3 text-sm font-semibold"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="form-input w-full py-2 px-3 text-sm font-semibold"
                />
              </div>
            </div>

            {/* Rating Filter */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase transition-colors">Minimum Rating</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="form-input w-full py-2.5 text-sm font-semibold bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 text-slate-800 dark:text-slate-200"
              >
                <option value="">Any Rating</option>
                <option value="4">4 Stars & Above</option>
                <option value="3">3 Stars & Above</option>
                <option value="2">2 Stars & Above</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Products Grid Content */}
        <main className="flex-grow">
          {loading ? (
            <ProductSkeleton count={6} />
          ) : error ? (
            <div className="text-center py-12 text-red-500 bg-red-50/10 border border-red-200 dark:border-red-500/10 rounded-2xl">
              {error}
            </div>
          ) : (
            <div className="space-y-8">
              <ProductGrid products={products} />
              
              {/* Invisible element to trigger intersection observer */}
              <div ref={lastElementRef} className="h-10"></div>
              
              {loadingMore && (
                <div className="flex justify-center py-6">
                  <div className="w-8 h-8 border-4 border-primary-500/30 border-t-primary-600 rounded-full animate-spin"></div>
                </div>
              )}
              
              {!hasMore && products.length > 0 && (
                <div className="text-center py-8 text-sm font-bold text-slate-400 dark:text-slate-500">
                  You've reached the end of the catalog!
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </AnimatedPage>
  );
};

export default Shop;
