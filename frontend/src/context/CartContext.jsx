import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { ToastContext } from './ToastContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { addToast } = useContext(ToastContext);

  const [cartItems, setCartItems] = useState(() => {
    const saved = localStorage.getItem('cartItems');
    return saved ? JSON.parse(saved) : [];
  });

  const [couponCode, setCouponCode] = useState(() => localStorage.getItem('couponCode') || '');
  const [discountPrice, setDiscountPrice] = useState(() => Number(localStorage.getItem('discountPrice')) || 0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Calculate pricing numbers
  const itemsPrice = Number(
    cartItems.reduce((acc, item) => acc + item.price * item.qty, 0).toFixed(2)
  );
  
  // Shipping calculation:
  // Standard products: Free shipping over $100 subtotal, otherwise $10 flat rate.
  // Agent products: sum of (item.shippingPrice * item.qty)
  const standardItemsSubtotal = cartItems
    .filter((item) => !item.isAgentProduct)
    .reduce((acc, item) => acc + item.price * item.qty, 0);

  const standardShipping = (standardItemsSubtotal > 100 || standardItemsSubtotal === 0) ? 0 : 10;

  const agentShipping = cartItems
    .filter((item) => item.isAgentProduct)
    .reduce((acc, item) => acc + (item.shippingPrice || 0) * item.qty, 0);

  const shippingPrice = Number((standardShipping + agentShipping).toFixed(2));

  const taxPrice = 0; // Tax removed as requested

  // Dynamically scale coupon discount if cart items are updated
  useEffect(() => {
    if (couponCode) {
      const upperCode = couponCode.toUpperCase().trim();
      if (upperCode === 'ECO20') {
        setDiscountPrice(Number((itemsPrice * 0.2).toFixed(2)));
      } else if (upperCode === 'NEXUS10') {
        setDiscountPrice(Number((itemsPrice * 0.1).toFixed(2)));
      } else if (upperCode === 'WELCOME5') {
        setDiscountPrice(Math.min(5.0, itemsPrice));
      } else {
        setDiscountPrice(0);
        setCouponCode('');
      }
    } else {
      setDiscountPrice(0);
    }
  }, [itemsPrice, couponCode]);

  const totalPrice = Number(Math.max(0, itemsPrice + shippingPrice - discountPrice).toFixed(2));

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
    localStorage.setItem('couponCode', couponCode);
    localStorage.setItem('discountPrice', discountPrice.toString());
  }, [cartItems, couponCode, discountPrice]);

  const addToCart = (product, qty) => {
    const existItem = cartItems.find((x) => x.product === product._id);
    if (existItem) {
      addToast(`Updated ${product.name} quantity to ${qty}`, 'info');
    } else {
      addToast(`${product.name} added to cart 🛒`, 'success');
    }

    setCartItems((prevItems) => {
      if (existItem) {
        return prevItems.map((x) =>
          x.product === product._id ? { ...x, qty: Number(qty) } : x
        );
      } else {
        return [
          ...prevItems,
          {
            product: product._id,
            name: product.name,
            image: product.image,
            price: product.price,
            countInStock: product.countInStock,
            qty: Number(qty),
            shippingPrice: product.shippingPrice !== undefined ? product.shippingPrice : 0,
            isAgentProduct: product.isAgentProduct || false,
          },
        ];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    const item = cartItems.find((x) => x.product === id);
    if (item) {
      addToast(`${item.name} removed from cart`, 'info');
    }
    setCartItems((prevItems) => prevItems.filter((x) => x.product !== id));
  };

  const clearCart = () => {
    setCartItems([]);
    setCouponCode('');
    setDiscountPrice(0);
  };

  const applyCouponCode = async (code) => {
    try {
      const response = await api.post('/orders/coupon', { code, cartTotal: itemsPrice });
      setCouponCode(response.data.code);
      setDiscountPrice(response.data.discount);
      addToast(response.data.message, 'success');
      return { success: true, message: response.data.message };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      addToast(errMsg, 'error');
      return { success: false, message: errMsg };
    }
  };

  const removeCoupon = () => {
    setCouponCode('');
    setDiscountPrice(0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
        couponCode,
        discountPrice,
        addToCart,
        removeFromCart,
        clearCart,
        applyCouponCode,
        removeCoupon,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
