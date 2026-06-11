import React, { forwardRef } from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';
import { formatDate } from '../../utils/format';
import Button from '../common/Button';

const Invoice = forwardRef(({ order, customer, isAgent, onClose }, ref) => {
  const { formatPrice } = useCurrency();
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-dark-950/80 backdrop-blur-sm flex items-center justify-center p-4 print-hide-parent">
      {/* Printable Area Wrapper */}
      <div 
        id="print-section" 
        className="glass-panel w-full max-w-2xl rounded-3xl border border-slate-200 dark:border-dark-850 p-6 sm:p-8 space-y-6 shadow-2xl relative bg-white dark:bg-dark-900 transition-all duration-300 max-h-[90vh] overflow-y-auto"
      >
        {/* Style block for print media overrides */}
        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            body * {
              visibility: hidden;
            }
            #print-section, #print-section * {
              visibility: visible;
            }
            #print-section {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              border: none !important;
              box-shadow: none !important;
              background: white !important;
              color: black !important;
              padding: 0 !important;
              margin: 0 !important;
            }
            /* Collapse all hidden layout containers to prevent extra blank pages */
            html, body, #root, main, .print-hide-parent {
              height: 0 !important;
              min-height: 0 !important;
              overflow: visible !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            .print-hide {
              display: none !important;
            }
          }
        `}} />

        {/* Modal Header (Hidden in Print) */}
        <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-800 pb-4 print-hide">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Printer size={18} className="text-primary-600 dark:text-primary-400" /> Order Invoice Receipt
          </h3>
          <button
            onClick={onClose}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Invoice Body */}
        <div className="space-y-6 text-slate-800 dark:text-slate-200">
          {/* Logo & Bill To Grid */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 border-b border-slate-100 dark:border-dark-800 pb-6">
            <div>
              <span className="text-xl font-bold text-slate-900 dark:text-white">
                Nexus<span className="text-primary-600 dark:text-primary-400 font-extrabold">Cart</span>
              </span>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Transaction Invoice & Details</p>
            </div>
            <div className="text-left sm:text-right text-xs space-y-1">
              <p className="font-bold text-slate-900 dark:text-white">Order Code: <span className="font-mono">{order._id}</span></p>
              <p className="font-medium text-slate-500">Date: {formatDate(order.createdAt)}</p>
              <p className="font-medium text-slate-500">Payment: Stripe Sandbox</p>
            </div>
          </div>

          {/* Customer Particulars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs border-b border-slate-100 dark:border-dark-800 pb-6">
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Shipping Information</h4>
              <p className="font-bold text-slate-900 dark:text-white mb-1">{order.user?.name || 'Customer'}</p>
              <p className="text-slate-600 dark:text-slate-400">{order.shippingAddress?.address}</p>
              <p className="text-slate-600 dark:text-slate-400">{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
              <p className="text-slate-600 dark:text-slate-400">{order.shippingAddress?.country}</p>
            </div>
            <div>
              <h4 className="font-bold text-slate-400 uppercase tracking-wider mb-2">Billing Reference</h4>
              <p className="font-bold text-slate-900 dark:text-white mb-1">NexusCart Sandbox</p>
              <p className="text-slate-600 dark:text-slate-400">Merchant Code: #NXC-2026</p>
              <p className="text-emerald-600 dark:text-emerald-400 font-extrabold flex items-center gap-1 mt-2">
                <ShieldCheck size={14} /> Paid & Cleared
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-dark-800 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-2.5">Item Description</th>
                <th className="py-2.5 text-center">Qty</th>
                <th className="py-2.5 text-right">Price</th>
                <th className="py-2.5 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-800/40">
              {order.orderItems?.map((item) => (
                <tr key={item._id || item.product}>
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-8 h-8 object-cover rounded-lg border border-slate-200/60 dark:border-dark-800 shrink-0" 
                      />
                      <span>{item.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-center font-bold text-slate-600 dark:text-slate-400">{item.qty}</td>
                  <td className="py-3 text-right font-medium text-slate-600 dark:text-slate-400">{formatPrice(item.price)}</td>
                  <td className="py-3 text-right font-bold text-slate-900 dark:text-white">{formatPrice(item.price * item.qty)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Invoice Totals */}
          <div className="border-t border-slate-100 dark:border-dark-800 pt-4 flex justify-end text-xs">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal:</span>
                <span className="font-semibold">{formatPrice(order.itemsPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Shipping charge:</span>
                <span className="font-semibold">{order.shippingPrice === 0 ? 'Free' : formatPrice(order.shippingPrice)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Discount ({order.couponCode || 'Promo'}):</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-slate-100 dark:border-dark-800 pt-2 flex justify-between font-black text-sm text-slate-900 dark:text-white">
                <span>Grand Total:</span>
                <span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Printable Footer Actions (Hidden in Print) */}
        <div className="flex justify-end gap-4 border-t border-slate-100 dark:border-dark-800 pt-6 print-hide">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handlePrint} icon={Printer}>
            Print Receipt
          </Button>
        </div>
      </div>
    </div>
  );
});

export default Invoice;
