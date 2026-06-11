import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { useCurrency } from '../../context/CurrencyContext';

const ChartContainer = ({ data, title, xKey = 'month', yKey = 'revenue' }) => {
  const { formatPrice } = useCurrency();

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-dark-950 border border-slate-200 dark:border-dark-800 p-3 rounded-xl shadow-xl">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{payload[0].payload[xKey]}</p>
          <p className="text-sm font-extrabold text-primary-600 dark:text-primary-400 mt-1">
            {yKey === 'revenue' || yKey === 'sales' ? 'Revenue:' : 'Value:'} {yKey === 'revenue' || yKey === 'sales' ? formatPrice(payload[0].value) : payload[0].value}
          </p>
          {payload[0].payload.orders !== undefined && (
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-0.5">
              Orders: {payload[0].payload.orders}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-200/60 dark:border-dark-800">
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-6">{title}</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2b2c34" vertical={false} />
            <XAxis
              dataKey={xKey}
              stroke="#a1a4b0"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#a1a4b0"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value}`}
              dx={-5}
            />
            <Tooltip content={customTooltip} />
            <Area
              type="monotone"
              dataKey={yKey}
              stroke="#8b5cf6"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ChartContainer;
