import React, { useContext } from 'react';
import { ToastContext } from '../../context/ToastContext';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const toastTypes = {
  success: {
    icon: CheckCircle2,
    classes: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-850 dark:text-emerald-400',
    iconClass: 'text-emerald-600 dark:text-emerald-450',
  },
  error: {
    icon: XCircle,
    classes: 'bg-red-500/10 border-red-500/20 text-red-850 dark:text-red-400',
    iconClass: 'text-red-600 dark:text-red-450',
  },
  warning: {
    icon: AlertTriangle,
    classes: 'bg-amber-500/10 border-amber-500/20 text-amber-850 dark:text-amber-400',
    iconClass: 'text-amber-600 dark:text-amber-450',
  },
  info: {
    icon: Info,
    classes: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-850 dark:text-indigo-400',
    iconClass: 'text-indigo-600 dark:text-indigo-450',
  },
};

const ToastContainer = () => {
  const { toasts, removeToast } = useContext(ToastContext);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-55 flex flex-col gap-3 pointer-events-none max-w-[320px] sm:max-w-sm w-full">
      <AnimatePresence>
      {toasts.map((toast) => {
        const config = toastTypes[toast.type] || toastTypes.success;
        const IconComponent = config.icon;

        return (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            transition={{ duration: 0.3 }}
            className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-md shadow-xl pointer-events-auto select-none ${config.classes}`}
            role="alert"
          >
            <IconComponent size={18} className={`shrink-0 mt-0.5 ${config.iconClass}`} />
            
            <div className="flex-grow text-xs font-bold leading-relaxed pr-2">
              {toast.message}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="p-0.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors shrink-0"
              aria-label="Dismiss notification"
            >
              <X size={14} />
            </button>
          </motion.div>
        );
      })}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
