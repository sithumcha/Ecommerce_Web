import React, { createContext, useState, useEffect, useContext } from 'react';
import { ToastContext } from './ToastContext';

export const CompareContext = createContext();

export const CompareProvider = ({ children }) => {
  const { addToast } = useContext(ToastContext);

  const [compareItems, setCompareItems] = useState(() => {
    const saved = localStorage.getItem('compareItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [isCompareOpen, setCompareOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('compareItems', JSON.stringify(compareItems));
  }, [compareItems]);

  const toggleCompareItem = (product) => {
    const exists = compareItems.some((item) => item._id === product._id);
    if (exists) {
      addToast(`${product.name} removed from comparison`, 'info');
    } else {
      if (compareItems.length >= 3) {
        addToast('Comparison limit reached (max 3 products) ⚠️', 'warning');
        return;
      }
      addToast(`${product.name} added to comparison list 📊`, 'success');
    }

    setCompareItems((prevItems) => {
      if (exists) {
        // Remove item
        return prevItems.filter((item) => item._id !== product._id);
      } else {
        // Add item with details
        return [
          ...prevItems,
          {
            _id: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            brand: product.brand,
            category: product.category,
            rating: product.rating,
            numReviews: product.numReviews,
            countInStock: product.countInStock,
            description: product.description,
          },
        ];
      }
    });
  };

  const isInCompare = (productId) => {
    return compareItems.some((item) => item._id === productId);
  };

  const clearCompare = () => {
    setCompareItems([]);
    setCompareOpen(false);
  };

  return (
    <CompareContext.Provider
      value={{
        compareItems,
        toggleCompareItem,
        isInCompare,
        clearCompare,
        isCompareOpen,
        setCompareOpen,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
};
