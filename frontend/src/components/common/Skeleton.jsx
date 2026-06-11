import React from 'react';

const Skeleton = ({ className = '' }) => {
  return (
    <div className={`animate-pulse bg-slate-200 dark:bg-dark-800 rounded-xl ${className}`}></div>
  );
};

export const SkeletonText = ({ lines = 3, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton 
          key={i} 
          className={`h-4 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} 
        />
      ))}
    </div>
  );
};

export const SkeletonProductCard = () => {
  return (
    <div className="glass-panel rounded-3xl p-4 flex flex-col gap-4">
      <Skeleton className="w-full aspect-square rounded-2xl" />
      <div className="space-y-2 mt-2">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex justify-between items-center mt-2">
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
    </div>
  );
};

export default Skeleton;
