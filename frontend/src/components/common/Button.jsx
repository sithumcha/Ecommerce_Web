import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary: 'bg-primary-600 hover:bg-primary-500 text-white shadow-lg shadow-primary-500/10 hover:shadow-primary-500/20 active:scale-[0.98]',
    secondary: 'bg-slate-100 hover:bg-slate-200/80 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 hover:border-slate-350 dark:hover:border-slate-600 text-slate-700 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white dark:hover:bg-dark-800 active:scale-[0.98]',
    outline: 'border border-primary-500/30 hover:border-primary-500 bg-transparent text-primary-600 dark:text-primary-400 hover:bg-primary-600/5 active:scale-[0.98]',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/10 hover:shadow-red-500/20 active:scale-[0.98]',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-5 py-2.5 text-sm gap-2',
    lg: 'px-7 py-3.5 text-base gap-2.5',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <Loader2 className="animate-spin" size={16} />
      ) : Icon ? (
        <Icon size={16} />
      ) : null}
      <span>{children}</span>
    </button>
  );
};

export default Button;
