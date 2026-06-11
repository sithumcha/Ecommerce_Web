import React, { createContext, useState, useEffect, useContext } from 'react';
import { ToastContext } from './ToastContext';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { addToast } = useContext(ToastContext);

  const [wishlistItems, setWishlistItems] = useState(() => {
    const saved = localStorage.getItem('wishlistItems');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('wishlistItems', JSON.stringify(wishlistItems));
  }, [wishlistItems]);

  const toggleWishlistItem = (product) => {
    const exist = wishlistItems.find((item) => item._id === product._id);
    if (exist) {
      addToast(`${product.name} removed from wishlist`, 'info');
    } else {
      addToast(`${product.name} added to wishlist! ❤️`, 'success');
    }

    setWishlistItems((prevItems) => {
      if (exist) {
        // Remove
        return prevItems.filter((item) => item._id !== product._id);
      } else {
        // Add
        return [
          ...prevItems,
          {
            _id: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            rating: product.rating,
            category: product.category,
            numReviews: product.numReviews,
            countInStock: product.countInStock,
          },
        ];
      }
    });
  };

  const isWishlisted = (productId) => {
    return wishlistItems.some((item) => item._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        toggleWishlistItem,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
