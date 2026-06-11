import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Star, ShoppingCart, Heart, GitCompare } from 'lucide-react';
import { CartContext } from '../../context/CartContext';
import { WishlistContext } from '../../context/WishlistContext';
import { CompareContext } from '../../context/CompareContext';
import { useCurrency } from '../../context/CurrencyContext';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { toggleWishlistItem, isWishlisted } = useContext(WishlistContext);
  const { toggleCompareItem, isInCompare } = useContext(CompareContext);
  const { formatPrice } = useCurrency();
  
  const favorited = isWishlisted(product._id);
  const compared = isInCompare(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    addToCart(product, 1);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    toggleWishlistItem(product);
  };

  const handleCompareToggle = (e) => {
    e.preventDefault();
    toggleCompareItem(product);
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;

    for (let i = 1; i <= 5; i++) {
      if (i <= fullStars) {
        stars.push(<Star key={i} size={14} className="fill-amber-400 text-amber-400" />);
      } else if (i === fullStars + 1 && hasHalf) {
        stars.push(
          <div key={i} className="relative">
            <Star size={14} className="text-slate-200" />
            <div className="absolute top-0 left-0 overflow-hidden w-1/2">
              <Star size={14} className="fill-amber-400 text-amber-400" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} size={14} className="text-slate-200 fill-slate-100" />);
      }
    }
    return stars;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Link
        to={`/product/${product._id}`}
        className="glass-panel glass-panel-hover flex flex-col h-full rounded-3xl overflow-hidden group border-slate-200/50 dark:border-dark-800/60"
      >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-slate-50/50 dark:bg-dark-950/50 border-b border-slate-100 dark:border-dark-900/50 transition-colors duration-500">
        {/* Iridescent Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 via-transparent to-accent-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10 mix-blend-overlay"></div>
        {/* Floating Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 left-3 p-2 rounded-xl border backdrop-blur-md transition-all duration-300 active:scale-90 z-10 ${
            favorited
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-500 hover:bg-rose-500/35'
              : 'bg-white/45 dark:bg-dark-950/45 border-slate-200/50 dark:border-dark-800/50 text-slate-600 dark:text-slate-400 hover:text-rose-500'
          }`}
          title={favorited ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          <Heart size={15} className={favorited ? 'fill-rose-500' : ''} />
        </button>

        {/* Floating Compare Button */}
        <button
          onClick={handleCompareToggle}
          className={`absolute top-[46px] left-3 p-2 rounded-xl border backdrop-blur-md transition-all duration-300 active:scale-90 z-10 ${
            compared
              ? 'bg-primary-600/20 border-primary-500/40 text-primary-600 dark:text-primary-400 hover:bg-primary-600/35'
              : 'bg-white/45 dark:bg-dark-950/45 border-slate-200/50 dark:border-dark-800/50 text-slate-600 dark:text-slate-400 hover:text-primary-600'
          }`}
          title={compared ? 'Remove from Compare' : 'Add to Compare'}
        >
          <GitCompare size={15} />
        </button>

        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out"
          loading="lazy"
        />
        {product.countInStock === 0 && (
          <span className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded-md">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        <span className="text-xs text-primary-600 dark:text-primary-400 font-semibold tracking-wide uppercase">
          {product.category}
        </span>
        <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
          {product.name}
        </h3>

        {/* Ratings */}
        <div className="flex items-center gap-1.5 mt-2">
          <div className="flex items-center">{renderStars(product.rating)}</div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">({product.numReviews})</span>
        </div>

        {/* Price and Add button */}
        <div className="flex items-center justify-between mt-auto pt-4">
          <span className="text-base font-extrabold text-slate-950 dark:text-white">
            {formatPrice(product.price)}
          </span>

          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className="p-2.5 bg-slate-100/80 dark:bg-dark-900/80 hover:bg-gradient-to-r hover:from-primary-600 hover:to-accent-500 text-slate-600 dark:text-slate-400 hover:text-white rounded-xl shadow-sm hover:shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all duration-300 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-slate-100 disabled:hover:text-slate-600 disabled:hover:shadow-none"
          >
            <ShoppingCart size={16} className="group-hover/btn:animate-bounce" />
          </button>
        </div>
      </div>
      </Link>
    </motion.div>
  );
};

export default ProductCard;
