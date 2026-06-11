import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AnimatedPage from '../../components/common/AnimatedPage';
import { CartContext } from '../../context/CartContext';
import CartItem from '../../components/checkout/CartItem';
import { useCurrency } from '../../context/CurrencyContext';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import Button from '../../components/common/Button';

const Cart = () => {
  const {
    cartItems,
    itemsPrice,
    shippingPrice,
    totalPrice,
    addToCart,
    removeFromCart,
  } = useContext(CartContext);

  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const handleQtyChange = (item, qty) => {
    addToCart({ _id: item.product, name: item.name, image: item.image, price: item.price, countInStock: item.countInStock }, qty);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  return (
    <AnimatedPage className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white transition-colors">Shopping Cart</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 transition-colors">
          Review your selected items and configure quantities before checkout.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center glass-panel rounded-3xl p-8 transition-colors duration-300">
          <div className="p-4 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-850 text-slate-400 dark:text-slate-500 rounded-2xl mb-4">
            <ShoppingBag size={36} />
          </div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">Your Cart is Empty</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 mb-6 max-w-xs leading-normal">
            Looks like you haven't added anything to your cart yet. Explore our latest items!
          </p>
          <Link to="/shop">
            <Button variant="primary" icon={ArrowRight}>
              Continue Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Cart Items List */}
          <div className="flex-grow space-y-4">
            <AnimatePresence>
              {cartItems.map((item) => (
                <motion.div
                  key={item.product}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, height: 0, padding: 0, margin: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.25 }}
                >
                  <CartItem
                    item={item}
                    onQtyChange={handleQtyChange}
                    onRemove={removeFromCart}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Pricing Order Summary */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="glass-panel rounded-3xl p-6 border border-slate-200 dark:border-dark-800/80 space-y-6 sticky top-24 transition-colors duration-300">
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider border-b border-slate-100 dark:border-dark-800 pb-4">
                Order Summary
              </h3>

              <div className="space-y-3.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Subtotal</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">{formatPrice(itemsPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Shipping</span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold">
                    {shippingPrice === 0 ? 'Free' : formatPrice(shippingPrice)}
                  </span>
                </div>
                <div className="border-t border-slate-100 dark:border-dark-800 pt-4 flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-bold">Total Price</span>
                  <span className="text-lg font-black text-slate-900 dark:text-white">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <Button
                variant="primary"
                onClick={handleCheckout}
                className="w-full py-3"
                icon={ArrowRight}
              >
                Proceed to Checkout
              </Button>

              <div className="text-[11px] text-slate-400 dark:text-slate-500 text-center leading-normal">
                Shipping calculated at checkout stage. Payments are fully secure.
              </div>
            </div>
          </div>
        </div>
      )}
    </AnimatedPage>
  );
};

export default Cart;
