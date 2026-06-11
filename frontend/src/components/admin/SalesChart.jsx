import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import ChartContainer from './ChartContainer';
import Loader from '../common/Loader';

const SalesChart = () => {
  const [salesData, setSalesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        const { data } = await api.get('/orders/sales-data');
        setSalesData(data);
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, []);

  if (loading) return <div className="h-80 flex items-center justify-center"><Loader message="Loading sales data..." /></div>;
  if (error) return <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl">{error}</div>;

  return (
    <ChartContainer 
      data={salesData} 
      title="Daily Sales Revenue" 
      xKey="date" 
      yKey="sales" 
    />
  );
};

export default SalesChart;
