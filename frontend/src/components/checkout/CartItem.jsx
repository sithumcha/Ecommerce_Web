import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const CartItem = ({ item, onQtyChange, onRemove }) => {
  const { formatPrice } = useCurrency();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-white/40 dark:bg-dark-900/40 border border-slate-200/60 dark:border-dark-800/60 hover:border-slate-350 dark:hover:border-dark-800 transition-all duration-200">
      {/* Product info section */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base line-clamp-1">
            {item.name}
          </h4>
          <p className="text-xs text-primary-600 dark:text-primary-400 font-semibold mt-0.5">
            {formatPrice(item.price)} each
          </p>
        </div>
      </div>

      {/* Adjust quantity and remove */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
        {/* Quantity selectors */}
        <div className="flex items-center gap-1 bg-slate-50 dark:bg-dark-950 border border-slate-200 dark:border-dark-800 rounded-xl p-1">
          <button
            onClick={() => onQtyChange(item, item.qty - 1)}
            disabled={item.qty <= 1}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
          >
            <Minus size={14} />
          </button>
          <span className="w-8 text-center text-sm font-bold text-slate-700 dark:text-slate-200">
            {item.qty}
          </span>
          <button
            onClick={() => onQtyChange(item, item.qty + 1)}
            disabled={item.qty >= item.countInStock}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white disabled:opacity-40 disabled:hover:text-slate-400 transition-colors"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Subtotal & Delete */}
        <div className="flex items-center gap-4">
          <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-200">
            {formatPrice(item.price * item.qty)}
          </span>
          <button
            onClick={() => onRemove(item.product)}
            className="p-2 text-slate-505 hover:text-red-650 dark:hover:text-red-400 rounded-xl hover:bg-red-500/10 transition-all"
            title="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartItem;
