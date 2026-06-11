import React from 'react';
import { Loader2 } from 'lucide-react';

const Loader = ({ fullPage = false, size = 'md', message = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-primary-500',
    md: 'w-10 h-10 text-primary-500',
    lg: 'w-16 h-16 text-primary-500',
  };

  const containerStyles = fullPage
    ? 'fixed inset-0 z-50 bg-white dark:bg-dark-950 flex flex-col items-center justify-center gap-4 transition-colors duration-300'
    : 'flex flex-col items-center justify-center py-12 gap-3 w-full';

  return (
    <div className={containerStyles}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {message && (
        <p className="text-sm font-medium text-slate-400 tracking-wide animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
};

export default Loader;
