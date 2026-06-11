import React, { useState, useEffect } from 'react';
import { CreditCard, Lock, ShieldCheck } from 'lucide-react';
import Button from '../common/Button';

const PaymentForm = ({ onSubmit, totalPrice }) => {
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || '';
    setCardNumber(formatted);
  };

  // Format Expiry (MM/YY)
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // CVC Length Check
  const handleCvcChange = (e) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) setCardCvc(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate Payment Gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      onSubmit({
        id: 'ch_' + Math.random().toString(36).substring(2, 12),
        status: 'succeeded',
        update_time: new Date().toISOString(),
        email_address: 'purchased_customer@example.com',
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
      {/* 3D Interactive Card View */}
      <div className="relative w-full max-w-sm mx-auto h-48 [perspective:1000px]">
        <div
          className={`w-full h-full relative rounded-2xl transition-transform duration-700 [transform-style:preserve-3d] ${
            isFlipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* Front Side */}
          <div className="absolute inset-0 w-full h-full rounded-2xl p-6 bg-gradient-to-br from-primary-600 to-indigo-800 text-white flex flex-col justify-between [backface-visibility:hidden] shadow-xl shadow-primary-950/20 border border-primary-500/20">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[10px] text-primary-200 uppercase tracking-widest font-semibold">NexusCard</p>
                <div className="w-10 h-7 bg-amber-400/20 rounded-md border border-amber-400/30 mt-1 flex items-center justify-center">
                  {/* Micro chip mockup */}
                  <div className="grid grid-cols-3 gap-0.5 w-6 h-4">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="border-[0.5px] border-amber-400/40 rounded-[1px]"></div>
                    ))}
                  </div>
                </div>
              </div>
              <CreditCard size={28} className="text-primary-100/80" />
            </div>

            <div className="my-2">
              <p className="text-lg font-bold tracking-widest font-mono">
                {cardNumber || '•••• •••• •••• ••••'}
              </p>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-[8px] text-primary-200 uppercase tracking-wider">Card Holder</p>
                <p className="text-xs font-semibold tracking-wide uppercase line-clamp-1">
                  {cardName || 'YOUR FULL NAME'}
                </p>
              </div>
              <div>
                <p className="text-[8px] text-primary-200 uppercase tracking-wider">Expires</p>
                <p className="text-xs font-semibold tracking-wider font-mono">
                  {cardExpiry || 'MM/YY'}
                </p>
              </div>
            </div>
          </div>

          {/* Back Side */}
          <div className="absolute inset-0 w-full h-full rounded-2xl bg-gradient-to-br from-indigo-900 to-dark-950 text-white flex flex-col justify-between [backface-visibility:hidden] [transform:rotateY(180deg)] shadow-xl border border-dark-800">
            <div className="w-full h-9 bg-dark-950 mt-4"></div>
            <div className="px-6 py-2">
              <div className="flex justify-end items-center gap-2">
                <span className="text-[9px] text-slate-400 uppercase">Authorized Signature</span>
                <div className="bg-white text-dark-950 font-mono px-3 py-1 text-right text-xs italic font-bold rounded w-20">
                  {cardCvc || '•••'}
                </div>
              </div>
            </div>
            <div className="px-6 pb-4 flex justify-between items-center text-[8px] text-slate-500">
              <p>Secure Tokenized Checkout System.</p>
              <Lock size={10} />
            </div>
          </div>
        </div>
      </div>

      {/* Credit Card inputs */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Cardholder Name
          </label>
          <input
            type="text"
            required
            placeholder="John Doe"
            value={cardName}
            onChange={(e) => setCardName(e.target.value)}
            className="form-input w-full"
            onFocus={() => setIsFlipped(false)}
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Card Number
          </label>
          <div className="relative">
            <input
              type="text"
              required
              placeholder="4111 2222 3333 4444"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className="form-input w-full pl-11"
              onFocus={() => setIsFlipped(false)}
            />
            <CreditCard size={18} className="absolute left-4 top-3.5 text-slate-500" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Expiration Date
            </label>
            <input
              type="text"
              required
              placeholder="MM/YY"
              value={cardExpiry}
              onChange={handleExpiryChange}
              className="form-input w-full"
              onFocus={() => setIsFlipped(false)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              CVC
            </label>
            <input
              type="password"
              required
              placeholder="123"
              value={cardCvc}
              onChange={handleCvcChange}
              className="form-input w-full font-mono"
              onFocus={() => setIsFlipped(true)}
              onBlur={() => setIsFlipped(false)}
            />
          </div>
        </div>

        <div className="bg-dark-900/50 border border-dark-800 rounded-xl p-3 flex items-start gap-2.5 mt-2">
          <ShieldCheck className="text-emerald-500 shrink-0" size={18} />
          <p className="text-[11px] text-slate-400 leading-normal">
            Your payment is fully encrypted and processed securely. Transactions are sandboxed.
          </p>
        </div>

        <Button
          type="submit"
          variant="primary"
          className="w-full mt-4"
          loading={isProcessing}
        >
          Pay {totalPrice ? `$${totalPrice.toFixed(2)}` : ''} Securely
        </Button>
      </form>
    </div>
  );
};

export default PaymentForm;
