import React, { useContext } from 'react';
import { CompareContext } from '../../context/CompareContext';
import { CartContext } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { X, GitCompare, Star, ShoppingCart, Trash2 } from 'lucide-react';
import Button from '../common/Button';

const ComparePanel = () => {
  const {
    compareItems,
    toggleCompareItem,
    clearCompare,
    isCompareOpen,
    setCompareOpen,
  } = useContext(CompareContext);

  const { formatPrice } = useCurrency();
  const { addToCart } = useContext(CartContext);

  if (compareItems.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Dashboard Bar */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border border-slate-200 dark:border-dark-800 rounded-3xl shadow-2xl px-6 py-4 flex flex-wrap items-center gap-6 transition-all duration-300 max-w-[95%] sm:max-w-2xl animate-in slide-in-from-bottom-6 duration-300">
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-2 bg-primary-600/10 text-primary-600 dark:text-primary-400 rounded-xl">
            <GitCompare size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-250 uppercase tracking-wide">Compare Queue</h4>
            <p className="text-[10px] text-slate-400">{compareItems.length} of 3 items selected</p>
          </div>
        </div>

        {/* Thumbnails */}
        <div className="flex items-center gap-3 overflow-x-auto py-1">
          {compareItems.map((item) => (
            <div key={item._id} className="relative group shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950"
              />
              <button
                onClick={() => toggleCompareItem(item)}
                className="absolute -top-1.5 -right-1.5 p-0.5 bg-red-500 hover:bg-red-650 text-white rounded-full transition-colors"
                title="Remove"
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0 ml-auto">
          <button
            onClick={clearCompare}
            className="text-xs font-extrabold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          >
            Clear
          </button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setCompareOpen(true)}
            className="font-bold py-1.5 text-xs rounded-xl"
          >
            Compare Now
          </Button>
        </div>
      </div>

      {/* Main Side-by-Side Compare Modal Overlay */}
      {isCompareOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-dark-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-4xl rounded-3xl border border-slate-200 dark:border-dark-850 p-6 sm:p-8 space-y-6 shadow-2xl relative bg-white dark:bg-dark-900 transition-all duration-300 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-dark-800 pb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitCompare size={18} className="text-primary-600 dark:text-primary-400" />
                Product Comparison Board
              </h3>
              <button
                onClick={() => setCompareOpen(false)}
                className="text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Compare Grid Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-150 dark:border-dark-850 bg-slate-50/20 dark:bg-dark-950/20 transition-colors">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-150 dark:border-dark-850 divide-x divide-slate-150 dark:divide-dark-850">
                    <th className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-dark-900/50 w-[20%] uppercase tracking-wider text-[10px]">Specifications</th>
                    {compareItems.map((item) => (
                      <th key={item._id} className="p-4 w-[26%] bg-white dark:bg-dark-900 transition-colors">
                        <div className="flex flex-col items-center text-center space-y-3 relative">
                          <button
                            onClick={() => toggleCompareItem(item)}
                            className="absolute -top-1 -right-1 p-1 bg-slate-100 hover:bg-red-500/10 dark:bg-dark-950 dark:hover:bg-red-500/20 text-slate-400 hover:text-red-500 rounded-xl transition-all"
                            title="Remove from compare"
                          >
                            <Trash2 size={12} />
                          </button>
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 rounded-xl object-cover border border-slate-200 dark:border-dark-800 bg-white dark:bg-dark-950 shadow-sm"
                          />
                          <h4 className="font-extrabold text-slate-900 dark:text-white text-xs line-clamp-2 min-h-[32px]">
                            {item.name}
                          </h4>
                          <span className="text-sm font-black text-slate-950 dark:text-white">
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </th>
                    ))}
                    {/* Placeholder columns if less than 3 items */}
                    {compareItems.length < 3 &&
                      [...Array(3 - compareItems.length)].map((_, idx) => (
                        <th key={idx} className="p-4 w-[26%] bg-slate-50/10 dark:bg-dark-950/10 text-center text-slate-400">
                          <div className="flex flex-col items-center justify-center py-6 space-y-2 text-[10px]">
                            <GitCompare size={20} className="opacity-30" />
                            <span>Select another item to compare</span>
                          </div>
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 dark:divide-dark-850">
                  {/* Brand Row */}
                  <tr className="divide-x divide-slate-150 dark:divide-dark-850">
                    <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-dark-900/50 uppercase tracking-wider text-[10px]">Brand</td>
                    {compareItems.map((item) => (
                      <td key={item._id} className="p-4 text-slate-800 dark:text-slate-200 font-semibold bg-white dark:bg-dark-900">
                        {item.brand}
                      </td>
                    ))}
                    {compareItems.length < 3 &&
                      [...Array(3 - compareItems.length)].map((_, idx) => (
                        <td key={idx} className="p-4 bg-slate-50/10 dark:bg-dark-950/10" />
                      ))}
                  </tr>

                  {/* Category Row */}
                  <tr className="divide-x divide-slate-150 dark:divide-dark-850">
                    <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-dark-900/50 uppercase tracking-wider text-[10px]">Category</td>
                    {compareItems.map((item) => (
                      <td key={item._id} className="p-4 text-slate-650 dark:text-slate-400 bg-white dark:bg-dark-900 font-medium">
                        {item.category}
                      </td>
                    ))}
                    {compareItems.length < 3 &&
                      [...Array(3 - compareItems.length)].map((_, idx) => (
                        <td key={idx} className="p-4 bg-slate-50/10 dark:bg-dark-950/10" />
                      ))}
                  </tr>

                  {/* Rating Row */}
                  <tr className="divide-x divide-slate-150 dark:divide-dark-850">
                    <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-dark-900/50 uppercase tracking-wider text-[10px]">Rating</td>
                    {compareItems.map((item) => (
                      <td key={item._id} className="p-4 bg-white dark:bg-dark-900">
                        <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                          <Star size={14} className="fill-amber-400 text-amber-400" />
                          <span>{item.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-slate-400">({item.numReviews} Reviews)</span>
                        </div>
                      </td>
                    ))}
                    {compareItems.length < 3 &&
                      [...Array(3 - compareItems.length)].map((_, idx) => (
                        <td key={idx} className="p-4 bg-slate-50/10 dark:bg-dark-950/10" />
                      ))}
                  </tr>

                  {/* Inventory Status Row */}
                  <tr className="divide-x divide-slate-150 dark:divide-dark-850">
                    <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-dark-900/50 uppercase tracking-wider text-[10px]">Availability</td>
                    {compareItems.map((item) => (
                      <td key={item._id} className="p-4 bg-white dark:bg-dark-900">
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                            item.countInStock > 0
                              ? 'bg-emerald-500/10 text-emerald-600'
                              : 'bg-red-500/10 text-red-650'
                          }`}
                        >
                          {item.countInStock > 0 ? `${item.countInStock} In Stock` : 'Out of Stock'}
                        </span>
                      </td>
                    ))}
                    {compareItems.length < 3 &&
                      [...Array(3 - compareItems.length)].map((_, idx) => (
                        <td key={idx} className="p-4 bg-slate-50/10 dark:bg-dark-950/10" />
                      ))}
                  </tr>

                  {/* Description Row */}
                  <tr className="divide-x divide-slate-150 dark:divide-dark-850">
                    <td className="p-4 font-bold text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-dark-900/50 uppercase tracking-wider text-[10px]">Description</td>
                    {compareItems.map((item) => (
                      <td key={item._id} className="p-4 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-[200px] bg-white dark:bg-dark-900 align-top">
                        {item.description}
                      </td>
                    ))}
                    {compareItems.length < 3 &&
                      [...Array(3 - compareItems.length)].map((_, idx) => (
                        <td key={idx} className="p-4 bg-slate-50/10 dark:bg-dark-950/10" />
                      ))}
                  </tr>

                  {/* Actions Row */}
                  <tr className="divide-x divide-slate-150 dark:divide-dark-850">
                    <td className="p-4 font-bold text-slate-505 dark:text-slate-400 bg-slate-100/50 dark:bg-dark-900/50 uppercase tracking-wider text-[10px]" />
                    {compareItems.map((item) => (
                      <td key={item._id} className="p-4 text-center bg-white dark:bg-dark-900">
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={item.countInStock === 0}
                          onClick={() => {
                            addToCart(item, 1);
                          }}
                          className="w-full flex items-center justify-center gap-1.5 font-bold py-2 text-xs"
                          icon={ShoppingCart}
                        >
                          Add to Cart
                        </Button>
                      </td>
                    ))}
                    {compareItems.length < 3 &&
                      [...Array(3 - compareItems.length)].map((_, idx) => (
                        <td key={idx} className="p-4 bg-slate-50/10 dark:bg-dark-950/10" />
                      ))}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Modal Footer actions */}
            <div className="flex justify-end pt-4">
              <Button variant="secondary" onClick={() => setCompareOpen(false)}>
                Close Board
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ComparePanel;
