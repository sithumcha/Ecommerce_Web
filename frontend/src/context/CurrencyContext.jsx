import React, { createContext, useState, useContext, useEffect } from 'react';

// Fallback fixed conversion rates relative to base currency (USD)
const FALLBACK_RATES = {
  USD: { symbol: '$', rate: 1, label: 'US Dollar' },
  EUR: { symbol: '€', rate: 0.92, label: 'Euro' },
  GBP: { symbol: '£', rate: 0.79, label: 'British Pound' },
  LKR: { symbol: 'Rs', rate: 300.00, label: 'Sri Lankan Rupee' },
};

export const CurrencyContext = createContext();

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('currency') || 'USD';
  });
  const [ratesData, setRatesData] = useState(FALLBACK_RATES);

  // Fetch real-time rates on mount
  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
        const data = await response.json();
        
        if (data && data.rates) {
          setRatesData(prev => ({
            ...prev,
            EUR: { ...prev.EUR, rate: data.rates.EUR || prev.EUR.rate },
            GBP: { ...prev.GBP, rate: data.rates.GBP || prev.GBP.rate },
            LKR: { ...prev.LKR, rate: data.rates.LKR || prev.LKR.rate },
          }));
        }
      } catch (error) {
        console.error('Failed to fetch real-time currency rates:', error);
      }
    };
    
    fetchRates();
  }, []);

  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  // Provide a specialized formatPrice function bound to the active currency
  const formatPrice = (priceInUSD) => {
    const { symbol, rate } = ratesData[currency] || ratesData['USD'];
    const converted = (priceInUSD || 0) * rate;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'narrowSymbol'
    }).format(converted);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, formatPrice, CURRENCY_RATES: ratesData }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
