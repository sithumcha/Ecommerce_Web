import React from 'react';

const StatCard = ({ title, value, icon: Icon, description, trend }) => {
  return (
    <div className="glass-panel rounded-2xl p-6 flex items-start justify-between transition-colors duration-300">
      <div className="space-y-2">
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider transition-colors">
          {title}
        </p>
        <p className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors truncate" title={value}>
          {value}
        </p>
        {(description || trend) && (
          <div className="flex items-center gap-1.5 pt-1">
            {trend && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 transition-colors">
                {trend}
              </span>
            )}
            {description && (
              <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium transition-colors">
                {description}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 dark:bg-dark-900 border border-slate-200 dark:border-dark-800 text-primary-600 dark:text-primary-400 rounded-xl transition-colors duration-300">
        <Icon size={20} />
      </div>
    </div>
  );
};

export default StatCard;
