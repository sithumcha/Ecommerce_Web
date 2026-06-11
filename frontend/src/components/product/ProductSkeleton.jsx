import React from 'react';

const ProductSkeleton = ({ count = 4 }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(count)].map((_, idx) => (
        <div
          key={idx}
          className="glass-panel rounded-2xl p-4 border border-slate-200/60 dark:border-dark-800/80 space-y-4 animate-pulse transition-colors"
        >
          {/* Image skeleton */}
          <div className="aspect-square w-full rounded-xl bg-slate-100 dark:bg-dark-950 transition-colors" />
          
          {/* Text lines skeletons */}
          <div className="space-y-2.5">
            <div className="h-3 bg-slate-200 dark:bg-dark-800 rounded w-1/4" />
            <div className="h-4 bg-slate-200 dark:bg-dark-800 rounded w-3/4" />
            <div className="h-3 bg-slate-200 dark:bg-dark-800 rounded w-1/2" />
          </div>

          {/* Action skeleton */}
          <div className="flex justify-between items-center pt-2">
            <div className="h-5 bg-slate-200 dark:bg-dark-800 rounded w-1/3" />
            <div className="w-8 h-8 bg-slate-200 dark:bg-dark-800 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductSkeleton;
