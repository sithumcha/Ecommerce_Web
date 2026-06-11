import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { WishlistContext } from '../../context/WishlistContext';
import { Star, ArrowLeft, ShieldCheck, ShoppingCart, Calendar, Heart, Briefcase, MessageSquare } from 'lucide-react';
import { formatDate } from '../../utils/format';
import { useCurrency } from '../../context/CurrencyContext';
import ReviewForm from '../../components/product/ReviewForm';
import Loader from '../../components/common/Loader';
import Button from '../../components/common/Button';

import { CompareContext } from '../../context/CompareContext';
import AnimatedPage from '../../components/common/AnimatedPage';
import { motion, AnimatePresence } from 'framer-motion';

const defaultGalleryImages = {
  Electronics: [
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?auto=format&fit=crop&q=80&w=600',
  ],
  Fashion: [
    'https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=600',
  ],
  Accessories: [
    'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=600',
    'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=600',
  ],
};

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { addToCart } = useContext(CartContext);
  const { userInfo } = useContext(AuthContext);
  const { toggleWishlistItem, isWishlisted } = useContext(WishlistContext);
  const { toggleCompareItem, isInCompare } = useContext(CompareContext);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [canReview, setCanReview] = useState(false);
  const [checkingPurchase, setCheckingPurchase] = useState(true);

  // Gallery & Zoom States
  const [activeImage, setActiveImage] = useState('');
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [isZooming, setIsZooming] = useState(false);

  const favorited = product ? isWishlisted(product._id) : false;
  const compared = product ? isInCompare(product._id) : false;
  const [selectedStarFilter, setSelectedStarFilter] = useState(null);

  // Review Breakdown math
  const totalReviews = product?.reviews?.length || 0;
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  product?.reviews?.forEach((rev) => {
    if (starCounts[rev.rating] !== undefined) {
      starCounts[rev.rating]++;
    }
  });

  const starPercentages = {};
  [5, 4, 3, 2, 1].forEach((star) => {
    starPercentages[star] = totalReviews > 0 ? Math.round((starCounts[star] / totalReviews) * 100) : 0;
  });

  const filteredReviews = selectedStarFilter
    ? product?.reviews?.filter((rev) => rev.rating === selectedStarFilter)
    : product?.reviews || [];

  const fetchProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
      setActiveImage(data.image);
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

  useEffect(() => {
    fetchProduct();
  }, [id]);

  useEffect(() => {
    const checkPurchaseStatus = async () => {
      if (!userInfo) {
        setCanReview(false);
        setCheckingPurchase(false);
        return;
      }
      try {
        setCheckingPurchase(true);
        const { data } = await api.get(`/orders/verify-purchase/${id}`);
        setCanReview(data.canReview);
      } catch (err) {
        console.error('Error checking purchase status', err);
        setCanReview(false);
      } finally {
        setCheckingPurchase(false);
      }
    };

    checkPurchaseStatus();
  }, [id, userInfo]);

  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPos({ x, y });
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
  };

  const handleReviewSubmit = async (reviewData) => {
    setReviewLoading(true);
    setReviewError(null);
    setReviewSuccess(false);
    try {
      await api.post(`/products/${id}/reviews`, reviewData);
      setReviewSuccess(true);
      // Reload product details to show newly added review and updated rating metrics
      const { data } = await api.get(`/products/${id}`);
      setProduct(data);
    } catch (err) {
      setReviewError(
        err.response && err.response.data.message
          ? err.response.data.message
          : err.message
      );
    } finally {
      setReviewLoading(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={16} className="fill-amber-400 text-amber-400" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <div key={i} className="relative">
            <Star size={16} className="text-slate-200" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star size={16} className="fill-amber-400 text-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} size={16} className="text-slate-200 fill-slate-100" />);
      }
    }
    return stars;
  };

  if (loading) return <Loader message="Fetching product specifications..." />;
  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500 text-lg">{error}</p>
        <Link to="/shop" className="text-primary-600 hover:underline mt-4 inline-block">
          Go back to shop catalog
        </Link>
      </div>
    );
  }

  if (!product) return null;

  const galleryImages = [product.image, ...(defaultGalleryImages[product.category] || [])];

  return (
    <AnimatedPage className="space-y-12 pb-16">
      {/* Back button */}
      <div>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>

      {/* Product main information */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Product Image Block */}
        <div className="flex flex-col">
          <div 
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsZooming(true)}
            onMouseLeave={() => setIsZooming(false)}
            className="w-full aspect-square rounded-3xl overflow-hidden bg-slate-50 dark:bg-dark-950 border border-slate-200/60 dark:border-dark-800 flex items-center justify-center relative cursor-zoom-in"
          >
            {/* Floating Heart Button */}
            <button
              onClick={() => toggleWishlistItem(product)}
              className={`absolute top-4 right-4 p-3 rounded-2xl border backdrop-blur-md transition-all duration-300 active:scale-90 z-20 ${
                favorited
                  ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 hover:bg-rose-500/35'
                  : 'bg-white/45 dark:bg-dark-950/45 border-slate-200/50 dark:border-dark-800/50 text-slate-600 dark:text-slate-400 hover:text-rose-500'
              }`}
              title={favorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              <Heart size={20} className={favorited ? 'fill-rose-500' : ''} />
            </button>

            <AnimatePresence mode="wait">
              <motion.img
                key={activeImage}
                src={activeImage}
                alt={product.name}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.3 }}
                className="w-full h-full object-cover transition-transform duration-150 ease-out pointer-events-none"
                style={{
                  transformOrigin: `${zoomPos.x}% ${zoomPos.y}%`,
                  transform: isZooming ? 'scale(2.2)' : 'scale(1)',
                }}
              />
            </AnimatePresence>
          </div>

          {/* Thumbnails list */}
          <div className="flex gap-3 mt-4 overflow-x-auto pb-1">
            {galleryImages.map((imgUrl, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImage(imgUrl)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                  activeImage === imgUrl
                    ? 'border-primary-650 dark:border-primary-450 scale-95 shadow-md'
                    : 'border-slate-200 dark:border-dark-800 hover:border-slate-350 hover:scale-102'
                }`}
              >
                <img src={imgUrl} alt="Product preview" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Product Details Columns */}
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex flex-col justify-between py-2 space-y-6"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="px-3 py-1 rounded-full bg-primary-600/10 border border-primary-500/20 text-primary-600 text-xs font-bold uppercase tracking-wider">
                {product.category}
              </span>
              {product.isAgentProduct && product.agentName && (
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs font-bold flex items-center gap-1.5">
                    <Briefcase size={12} /> Sold by: {product.agentName}
                  </span>
                  <Link
                    to={`/messages?userId=${product.user || ''}&productId=${product._id}`}
                    className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold flex items-center gap-1.5 hover:bg-indigo-500/20 transition-colors"
                  >
                    <MessageSquare size={12} /> Message Seller
                  </Link>
                </div>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-2">
              {product.name}
            </h1>

            {/* Rating summary */}
            <div className="flex items-center gap-2">
              <div className="flex items-center">{renderStars(product.rating)}</div>
              <span className="text-sm font-semibold text-slate-800">
                {product.rating.toFixed(1)}
              </span>
              <span className="text-xs text-slate-500">
                ({product.numReviews} review{product.numReviews !== 1 ? 's' : ''})
              </span>
            </div>

            {/* Price & Shipping tag */}
            <div className="flex items-center gap-4 flex-wrap">
              <p className="text-2xl sm:text-3xl font-black text-slate-950 dark:text-white transition-colors">
                {formatPrice(product.price)}
              </p>
              {product.shippingPrice === 0 || product.shippingPrice === undefined ? (
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-black tracking-wider uppercase animate-pulse">
                  Free Shipping
                </span>
              ) : (
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-dark-800 text-slate-600 dark:text-slate-400 text-xs font-bold transition-colors">
                  Shipping: {formatPrice(product.shippingPrice)}
                </span>
              )}
            </div>

            <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
              {product.description}
            </p>
          </div>

          <div className="border-t border-slate-100 dark:border-dark-800 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase">Status</span>
              <span
                className={`text-xs font-extrabold uppercase px-2.5 py-1 rounded-md ${
                  product.countInStock > 0
                    ? 'bg-emerald-500/10 text-emerald-600'
                    : 'bg-red-500/10 text-red-650'
                }`}
              >
                {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            {product.countInStock > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase">Quantity</span>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="form-input py-1 px-3 text-sm"
                >
                  {[...Array(product.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Button
                variant="primary"
                onClick={handleAddToCart}
                disabled={product.countInStock === 0}
                className="flex-grow py-3 animate-pulse-once"
                icon={ShoppingCart}
              >
                Add to Cart
              </Button>
              <button
                onClick={() => toggleCompareItem(product)}
                className={`px-6 py-3 rounded-xl border text-xs font-extrabold transition-all active:scale-95 flex items-center justify-center gap-2 ${
                  compared
                    ? 'bg-primary-600/10 border-primary-500/30 text-primary-600 dark:text-primary-400'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-dark-950 dark:hover:bg-dark-900 border-slate-200 dark:border-dark-800 text-slate-700 dark:text-slate-200'
                }`}
              >
                {compared ? 'Comparing' : 'Compare Product'}
              </button>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 justify-center">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>30-Day Money Back Guarantee & Free returns</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Reviews section */}
      <section className="border-t border-slate-100 dark:border-dark-800 pt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* List Reviews */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-100 dark:border-dark-800 pb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Customer Reviews
              {selectedStarFilter && (
                <button
                  onClick={() => setSelectedStarFilter(null)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-600/10 hover:bg-primary-600/25 border border-primary-500/20 text-primary-600 dark:text-primary-450 text-[10px] font-black uppercase rounded-lg transition-all"
                >
                  Clear Filter ({selectedStarFilter} ★) &times;
                </button>
              )}
            </h2>
          </div>

          {product.reviews.length > 0 && (
            <div className="glass-panel p-6 border border-slate-200/50 dark:border-dark-800/80 rounded-3xl grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              {/* Average Stats Panel */}
              <div className="text-center sm:border-r border-slate-100 dark:border-dark-800 sm:pr-6 space-y-2">
                <div className="text-4xl font-black text-slate-800 dark:text-white">
                  {product.rating.toFixed(1)}
                </div>
                <div className="flex justify-center gap-0.5">
                  {renderStars(product.rating)}
                </div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-450">
                  Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                </div>
              </div>

              {/* Progress Bars Breakdown List */}
              <div className="sm:col-span-2 space-y-2">
                {[5, 4, 3, 2, 1].map((star) => {
                  const percent = starPercentages[star];
                  const count = starCounts[star];
                  const isCurrentFilter = selectedStarFilter === star;

                  return (
                    <button
                      key={star}
                      onClick={() => setSelectedStarFilter(isCurrentFilter ? null : star)}
                      className={`w-full flex items-center gap-3 text-left py-1 px-2.5 rounded-xl transition-all border ${
                        isCurrentFilter
                          ? 'bg-primary-600/10 border-primary-500/30 text-primary-600 dark:text-primary-450 font-bold'
                          : 'bg-transparent border-transparent text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dark-950/40'
                      }`}
                      title={`Filter by ${star} stars`}
                    >
                      <span className="text-[11px] font-bold w-12 shrink-0">{star} star</span>
                      
                      {/* Progress Bar Track */}
                      <div className="flex-grow h-2 bg-slate-100 dark:bg-dark-950 rounded-full overflow-hidden border border-slate-200/40 dark:border-dark-800/40">
                        <div 
                          className="h-full bg-amber-400 dark:bg-amber-450 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>

                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 w-10 text-right shrink-0">
                        {percent}%
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {filteredReviews.length === 0 ? (
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              {selectedStarFilter 
                ? `No ${selectedStarFilter}-star reviews match your active filter.`
                : 'No reviews yet for this product. Be the first to leave one!'
              }
            </p>
          ) : (
            <div className="space-y-4">
              {filteredReviews.map((rev) => (
                <div
                  key={rev._id}
                  className="p-5 rounded-2xl bg-white/40 dark:bg-dark-900/40 border border-slate-200/60 dark:border-dark-800 space-y-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{rev.name}</h4>
                      <div className="flex items-center gap-1 mt-0.5">
                        {renderStars(rev.rating)}
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 font-semibold uppercase">
                      <Calendar size={12} /> {formatDate(rev.createdAt)}
                    </span>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed">{rev.comment}</p>
                  {rev.image && (
                    <div className="pt-2">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 dark:border-dark-800 bg-slate-50 dark:bg-dark-950 shrink-0">
                        <img 
                          src={rev.image} 
                          alt="Customer review attachment" 
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Review */}
        <div>
          <div className="glass-panel rounded-2xl p-6 border border-slate-200/60 space-y-4">
            <h3 className="text-base font-bold text-slate-800">Write a Review</h3>

            {reviewSuccess && (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-xl font-semibold">
                Review submitted successfully!
              </div>
            )}
            {reviewError && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl font-semibold">
                {reviewError}
              </div>
            )}

            {userInfo ? (
              checkingPurchase ? (
                <div className="text-center py-4">
                  <p className="text-xs text-slate-450 animate-pulse">Checking purchase status...</p>
                </div>
              ) : canReview ? (
                <ReviewForm onSubmit={handleReviewSubmit} loading={reviewLoading} />
              ) : (
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-dark-900 border border-slate-200/60 dark:border-dark-800 flex flex-col items-center text-center gap-3">
                  <div className="p-3 bg-primary-500/10 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400 rounded-full">
                    <ShieldCheck size={24} />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-white">Verified Purchase Required</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px] mx-auto">
                      You can only leave reviews for products you have purchased and received.
                    </p>
                  </div>
                </div>
              )
            ) : (
              <div className="text-center py-4 space-y-3">
                <p className="text-sm text-slate-500">Please sign in to write a review</p>
                <Link
                  to="/login"
                  className="inline-block text-xs font-bold text-primary-600 hover:text-primary-500"
                >
                  Sign In &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </AnimatedPage>
  );
};

export default ProductDetails;
