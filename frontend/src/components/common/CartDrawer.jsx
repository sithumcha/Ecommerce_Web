import React, { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CartContext } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { X, Plus, Minus, Trash2, ShoppingBag, Tag, ShieldCheck } from 'lucide-react';
import Button from './Button';

const CartDrawer = () => {
  const {
    cartItems,
    itemsPrice,
    shippingPrice,
    totalPrice,
    couponCode,
    discountPrice,
    addToCart,
    removeFromCart,
    applyCouponCode,
    removeCoupon,
    isCartOpen,
    setIsCartOpen,
  } = useContext(CartContext);

  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Promo states
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    if (!promoInput.trim()) return;

    const res = await applyCouponCode(promoInput);
    if (res.success) {
      setPromoSuccess(res.message);
      setPromoInput('');
    } else {
      setPromoError(res.message);
    }
  };

  const handleIncrement = (item) => {
    if (item.qty < item.countInStock) {
      addToCart(item, item.qty + 1);
    }
  };

  const handleDecrement = (item) => {
    if (item.qty > 1) {
      addToCart(item, item.qty - 1);
    }
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Background Backdrop Blur overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-slate-900/40 dark:bg-dark-950/60 backdrop-blur-xs pointer-events-auto"
            onClick={() => setIsCartOpen(false)}
          />

          {/* Slide-over Drawer Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
            className="fixed top-0 right-0 h-full z-50 w-full sm:w-[440px] bg-white dark:bg-dark-900 shadow-2xl border-l border-slate-200/50 dark:border-dark-850 flex flex-col"
          >
            {/* Drawer Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-100 dark:border-dark-800 transition-colors">
          <h3 className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2 text-base">
            <ShoppingBag size={18} className="text-primary-600 dark:text-primary-400" />
            Shopping Cart
            <span className="text-xs bg-primary-600/10 border border-primary-500/20 text-primary-600 dark:text-primary-400 px-2.5 py-0.5 rounded-full font-bold">
              {cartItems.reduce((acc, item) => acc + item.qty, 0)} Items
            </span>
          </h3>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-dark-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drawer Items list */}
        <div className="flex-grow overflow-y-auto p-6 space-y-4">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 space-y-4 py-20">
              <div className="p-4 bg-slate-50 dark:bg-dark-950 border border-slate-200/50 dark:border-dark-800 rounded-full">
                <ShoppingBag size={36} className="text-slate-350 dark:text-slate-500" />
              </div>
              <div className="space-y-1">
                <p className="font-bold text-slate-650 dark:text-slate-350 text-sm">Your cart is empty</p>
                <p className="text-xs text-slate-400">Fill it with eco-friendly products today!</p>
              </div>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  navigate('/shop');
                }}
                className="text-xs font-black text-primary-600 dark:text-primary-400 hover:underline pt-2"
              >
                Browse Shop catalog &rarr;
              </button>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {cartItems.map((item) => (
                <motion.div
                  key={item.product}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, height: 0, padding: 0, margin: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-4 p-3.5 bg-slate-50 dark:bg-dark-950/40 border border-slate-150 dark:border-dark-850 rounded-2xl hover:scale-[1.01] transition-transform duration-300"
                >
                {/* Item Thumbnail */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 dark:bg-dark-900 border border-slate-200/50 dark:border-dark-800 shrink-0">
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                </div>

                {/* Details */}
                <div className="flex-grow min-w-0 space-y-1">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate" title={item.name}>
                    {item.name}
                  </h4>
                  <p className="text-xs font-extrabold text-slate-950 dark:text-white">
                    {formatPrice(item.price)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2.5 pt-1">
                    <div className="flex items-center bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 rounded-lg p-0.5">
                      <button
                        onClick={() => handleDecrement(item)}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        disabled={item.qty <= 1}
                      >
                        <Minus size={10} />
                      </button>
                      <span className="text-[11px] font-black w-6 text-center text-slate-800 dark:text-slate-250">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => handleIncrement(item)}
                        className="p-1 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
                        disabled={item.qty >= item.countInStock}
                      >
                        <Plus size={10} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeFromCart(item.product)}
                  className="p-2 bg-slate-100 hover:bg-red-500/10 dark:bg-dark-900 dark:hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-xl transition-all duration-350 shrink-0"
                  title="Remove Item"
                >
                  <Trash2 size={13} />
                </button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* Drawer Billing Summary (Only if cart not empty) */}
        {cartItems.length > 0 && (
          <div className="p-6 border-t border-slate-150 dark:border-dark-800 bg-slate-50/50 dark:bg-dark-900/60 transition-colors space-y-4">
            {/* Promo Widget */}
            <div className="border-b border-slate-150 dark:border-dark-800/80 pb-3.5 space-y-2">
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Apply Promo Code
              </span>
              {couponCode ? (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-450 flex items-center gap-1.5">
                    <Tag size={12} />
                    Code <span className="font-mono bg-emerald-650/15 px-1 py-0.5 rounded">{couponCode}</span> Active
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[10px] font-black text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. ECO20"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="form-input flex-grow py-1 px-3 text-xs bg-white dark:bg-dark-900 border-slate-200 dark:border-dark-800 rounded-lg focus:ring-1"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-750 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-dark-700"
                  >
                    Apply
                  </button>
                </form>
              )}
              {promoError && (
                <p className="text-[10px] font-bold text-red-500 text-center animate-pulse">{promoError}</p>
              )}
              {promoSuccess && (
                <p className="text-[10px] font-bold text-emerald-500 text-center animate-pulse">{promoSuccess}</p>
              )}
            </div>

            {/* Calculations breakdown */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatPrice(itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-slate-500 dark:text-slate-400">
                <span>Eco-Shipping charge:</span>
                <span className="font-semibold">{shippingPrice === 0 ? 'Free' : formatPrice(shippingPrice)}</span>
              </div>
              {discountPrice > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Deduction ({couponCode}):</span>
                  <span>-{formatPrice(discountPrice)}</span>
                </div>
              )}
              <div className="border-t border-slate-200 dark:border-dark-800 pt-2 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                <span>Grand Total:</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2.5 pt-2">
              <Button variant="primary" className="w-full py-3" onClick={handleCheckout}>
                Proceed to Checkout
              </Button>
              <Link to="/cart" className="w-full" onClick={() => setIsCartOpen(false)}>
                <Button variant="secondary" className="w-full py-2 bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800">
                  View Full Cart Page
                </Button>
              </Link>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 justify-center">
              <ShieldCheck size={12} className="text-emerald-600 shrink-0" />
              <span>Climate offsets apply to this transaction.</span>
            </div>
          </div>
        )}
      </motion.div>
      </>
      )}
    </AnimatePresence>
  );
};

export default CartDrawer;
