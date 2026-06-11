import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../../context/CartContext';
import { AuthContext } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';
import api from '../../services/api';
import PaymentForm from '../../components/checkout/PaymentForm';
import Invoice from '../../components/checkout/Invoice';
import { MapPin, CreditCard, CheckCircle, ArrowLeft, ArrowRight, ShieldCheck, Printer, Sparkles } from 'lucide-react';
import Button from '../../components/common/Button';
import AnimatedPage from '../../components/common/AnimatedPage';
import { motion, AnimatePresence } from 'framer-motion';

const Checkout = () => {
  const {
    cartItems,
    itemsPrice,
    shippingPrice,
    totalPrice,
    clearCart,
    couponCode,
    discountPrice,
    applyCouponCode,
    removeCoupon,
  } = useContext(CartContext);
  const { userInfo, fetchProfile } = useContext(AuthContext);
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = Address, 2 = Payment, 3 = Success
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('');
  const [createdOrder, setCreatedOrder] = useState(null);
  const [showInvoice, setShowInvoice] = useState(false);

  // Promo code local inputs
  const [promoInput, setPromoInput] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');

  const [usePoints, setUsePoints] = useState(false);

  React.useEffect(() => {
    fetchProfile();
    // eslint-disable-next-line
  }, []);

  const availablePoints = userInfo?.ecoPoints || 0;
  const maxPointsToUse = Math.min(availablePoints, Math.floor(totalPrice * 100));
  const redeemedPoints = usePoints ? maxPointsToUse : 0;
  const pointsDiscount = redeemedPoints / 100;
  const finalTotal = Math.max(0, totalPrice - pointsDiscount);

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

  const handleAddressSubmit = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const handlePaymentSubmit = async (paymentResult) => {
    try {
      // 1. Submit order payload to backend
      const orderPayload = {
        orderItems: cartItems,
        shippingAddress: { address, city, postalCode, country },
        paymentMethod: 'Stripe',
        itemsPrice,
        shippingPrice,
        totalPrice: finalTotal,
        couponCode,
        discountAmount: discountPrice,
        redeemedPoints,
      };

      const { data: order } = await api.post('/orders', orderPayload);
      setCreatedOrder(order);

      // 2. Mark order as paid with mock stripe charge details
      await api.put(`/orders/${order._id}/pay`, paymentResult);

      // 3. Clear cart in Context API and state
      clearCart();
      setStep(3);
    } catch (err) {
      console.error('Checkout error:', err.response?.data?.message || err.message);
      alert('Checkout Failed: ' + (err.response?.data?.message || err.message));
    }
  };

  if (cartItems.length === 0 && step !== 3) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 dark:text-slate-400 text-lg">Your cart is empty. Nothing to checkout.</p>
        <Link to="/shop" className="text-primary-600 dark:text-primary-400 hover:underline mt-4 inline-block">
          Go back to store
        </Link>
      </div>
    );
  }

  return (
    <AnimatedPage className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Step Progress Tracker */}
      <div className="flex items-center justify-center gap-4 border-b border-slate-100 dark:border-dark-900 pb-6 transition-colors duration-300">
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 1 ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-slate-400 dark:text-slate-500'
            }`}
          >
            1
          </span>
          <span className={`text-sm font-semibold ${step >= 1 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
            Shipping
          </span>
        </div>
        <div className="h-[1px] w-12 bg-slate-200 dark:bg-dark-800"></div>
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 2 ? 'bg-primary-600 text-white' : 'bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-slate-400 dark:text-slate-500'
            }`}
          >
            2
          </span>
          <span className={`text-sm font-semibold ${step >= 2 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
            Payment
          </span>
        </div>
        <div className="h-[1px] w-12 bg-slate-200 dark:bg-dark-800"></div>
        <div className="flex items-center gap-2">
          <span
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              step >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-slate-400 dark:text-slate-500'
            }`}
          >
            3
          </span>
          <span className={`text-sm font-semibold ${step >= 3 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500'}`}>
            Success
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
      {step === 1 && (
        <motion.div
          key="step1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-8"
        >
          {/* Shipping Form */}
          <div className="md:col-span-3 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-dark-800 space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2 transition-colors">
              <MapPin className="text-primary-600 dark:text-primary-400" size={20} /> Shipping Address
            </h2>

            <form onSubmit={handleAddressSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  placeholder="123 Main St"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="form-input w-full"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  City
                </label>
                <input
                  type="text"
                  required
                  placeholder="San Francisco"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="form-input w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="94103"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="form-input w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="United States"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="form-input w-full"
                  />
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full mt-4" icon={ArrowRight}>
                Continue to Payment
              </Button>
            </form>
          </div>

          {/* Cart review */}
          <div className="md:col-span-2 glass-panel rounded-3xl p-6 border border-slate-200/60 dark:border-dark-800 space-y-4 h-fit">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-dark-800 pb-3 text-xs uppercase tracking-wider">
              Order Review
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-3 pr-1">
              {cartItems.map((item) => (
                <div key={item.product} className="flex justify-between items-center text-xs">
                  <span className="text-slate-600 dark:text-slate-400 line-clamp-1 flex-grow pr-2">
                    {item.name} <span className="text-slate-400 dark:text-slate-500 font-bold">x{item.qty}</span>
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-bold shrink-0">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            {discountPrice > 0 && (
              <div className="border-t border-slate-100 dark:border-dark-800 pt-3 flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Promo Discount ({couponCode})</span>
                <span>-{formatPrice(discountPrice)}</span>
              </div>
            )}

            {pointsDiscount > 0 && (
              <div className="border-t border-slate-100 dark:border-dark-800 pt-3 flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span>Eco-Points Redeemed ({redeemedPoints} pts)</span>
                <span>-{formatPrice(pointsDiscount)}</span>
              </div>
            )}

            <div className="border-t border-slate-100 dark:border-dark-800 pt-3 flex justify-between font-bold text-sm">
              <span className="text-slate-700 dark:text-slate-300">Total Due</span>
              <span className="text-slate-900 dark:text-white">{formatPrice(finalTotal)}</span>
            </div>

            {/* Eco-Points Widget */}
            {availablePoints > 0 && (
              <div className="border-t border-slate-100 dark:border-dark-800 pt-3 space-y-2">
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={12} /> Eco Rewards Balance: {availablePoints} pts
                </span>
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs">
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                    Use {maxPointsToUse} pts for {formatPrice(maxPointsToUse / 100)} off?
                  </span>
                  <button
                    type="button"
                    onClick={() => setUsePoints(!usePoints)}
                    className={`px-3 py-1 font-bold rounded-lg transition-colors border ${
                      usePoints 
                        ? 'bg-emerald-500 text-white border-emerald-500' 
                        : 'bg-white dark:bg-dark-900 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10'
                    }`}
                  >
                    {usePoints ? 'Applied' : 'Apply'}
                  </button>
                </div>
              </div>
            )}

            {/* Promo Code Entry Widget */}
            <div className="border-t border-slate-100 dark:border-dark-800 pt-3 space-y-2">
              <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Have a Promo Code?
              </span>
              {couponCode ? (
                <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    Code <span className="font-mono bg-emerald-600/10 px-1 py-0.5 rounded">{couponCode}</span> Active
                  </span>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[10px] font-bold text-red-500 hover:text-red-650"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. ECO20"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    className="form-input flex-grow py-1 px-3 text-xs bg-slate-50 dark:bg-dark-900 border-slate-200 dark:border-dark-800 rounded-lg focus:ring-1"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-750 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-dark-700"
                  >
                    Apply
                  </button>
                </div>
              )}
              {promoError && (
                <p className="text-[10px] font-bold text-red-505 text-center animate-pulse">{promoError}</p>
              )}
              {promoSuccess && (
                <p className="text-[10px] font-bold text-emerald-505 text-center animate-pulse">{promoSuccess}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {step === 2 && (
        <motion.div
          key="step2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-8"
        >
          {/* Payment Gateway Form */}
          <div className="md:col-span-3 glass-panel rounded-3xl p-6 sm:p-8 border border-slate-200/60 dark:border-dark-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-dark-800 pb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="text-primary-600 dark:text-primary-400" size={20} /> Secure Checkout
              </h2>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center gap-1 font-semibold"
              >
                <ArrowLeft size={12} /> Edit Address
              </button>
            </div>

            <PaymentForm onSubmit={handlePaymentSubmit} totalPrice={finalTotal} />
          </div>

          {/* Checkout Totals Review */}
          <div className="md:col-span-2 space-y-6">
            <div className="glass-panel rounded-3xl p-6 border border-slate-200/60 dark:border-dark-800 space-y-4">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-dark-800 pb-3 text-xs uppercase tracking-wider">
                Shipping Details
              </h3>
              <div className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p className="font-bold text-slate-800 dark:text-slate-200">{userInfo?.name}</p>
                <p>{address}</p>
                <p>
                  {city}, {postalCode}
                </p>
                <p>{country}</p>
              </div>
            </div>

            <div className="glass-panel rounded-3xl p-6 border border-slate-200/60 dark:border-dark-800 space-y-3.5">
              <h3 className="font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-dark-800 pb-3 text-xs uppercase tracking-wider">
                Payment Summary
              </h3>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Subtotal</span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold">{formatPrice(itemsPrice)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400">Shipping</span>
                <span className="text-slate-700 dark:text-slate-200 font-semibold">{formatPrice(shippingPrice)}</span>
              </div>

              {discountPrice > 0 && (
                <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Promo Discount ({couponCode})</span>
                  <span>-{formatPrice(discountPrice)}</span>
                </div>
              )}

              {pointsDiscount > 0 && (
                <div className="flex justify-between text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  <span>Eco-Points Redeemed ({redeemedPoints} pts)</span>
                  <span>-{formatPrice(pointsDiscount)}</span>
                </div>
              )}

              <div className="border-t border-slate-100 dark:border-dark-800 pt-3 flex justify-between font-extrabold text-sm">
                <span className="text-slate-700 dark:text-slate-300">Total Charge</span>
                <span className="text-slate-900 dark:text-white text-base">{formatPrice(finalTotal)}</span>
              </div>

              {/* Promo Code Entry Widget */}
              <div className="border-t border-slate-100 dark:border-dark-800 pt-3 space-y-2">
                <span className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Have a Promo Code?
                </span>
                {couponCode ? (
                  <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-2 text-xs">
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      Code <span className="font-mono bg-emerald-600/10 px-1 py-0.5 rounded">{couponCode}</span> Active
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[10px] font-bold text-red-500 hover:text-red-650"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. ECO20"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="form-input flex-grow py-1 px-3 text-xs bg-slate-50 dark:bg-dark-900 border-slate-200 dark:border-dark-800 rounded-lg focus:ring-1"
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-dark-800 dark:hover:bg-dark-750 text-slate-750 dark:text-slate-200 text-xs font-bold rounded-lg border border-slate-200 dark:border-dark-700"
                    >
                      Apply
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-[10px] font-bold text-red-550 text-center animate-pulse">{promoError}</p>
                )}
                {promoSuccess && (
                  <p className="text-[10px] font-bold text-emerald-550 text-center animate-pulse">{promoSuccess}</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {step === 3 && (
        <motion.div
          key="step3"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="glass-panel rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto border border-slate-200/60 dark:border-dark-800 space-y-6"
        >
          <div className="inline-flex p-4 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20">
            <CheckCircle size={48} />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Payment Successful!</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base leading-relaxed">
              Thank you for your purchase. Your order was registered successfully under code:{' '}
              <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-250 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 px-2 py-0.5 rounded">
                {createdOrder?._id}
              </span>
            </p>
          </div>

          <div className="bg-slate-50 dark:bg-dark-900/40 border border-slate-200 dark:border-dark-800/80 rounded-2xl p-4 flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            <ShieldCheck size={16} className="text-emerald-650" />
            <span>A receipt confirmation was dispatched to your inbox.</span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Button variant="primary" className="w-full sm:w-auto" onClick={() => setShowInvoice(true)} icon={Printer}>
              Print Invoice
            </Button>
            <Link to="/profile" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full">
                Track Order Status
              </Button>
            </Link>
            <Link to="/shop" className="w-full sm:w-auto">
              <Button variant="secondary" className="w-full" icon={ArrowRight}>
                Continue Shopping
              </Button>
            </Link>
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      {showInvoice && createdOrder && (
        <Invoice order={createdOrder} onClose={() => setShowInvoice(false)} />
      )}
    </AnimatedPage>
  );
};

export default Checkout;
