import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('medicineCart');
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) return parsed.filter(item => item && item.medicineId);
      }
    } catch (e) {
      console.error("Error parsing cart:", e);
    }
    return [];
  });

  useEffect(() => {
    // Save to local storage whenever cart changes
    localStorage.setItem('medicineCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (medicine, quantity = 1) => {
    try {
      setCartItems(prevItems => {
        const safeItems = Array.isArray(prevItems) ? prevItems : [];
        const medId = medicine._id || medicine.medicineId || medicine.MedicineId;
        const existingItem = safeItems.find(item => item && item.medicineId === medId);
        
        const availableStock = medicine.stock !== undefined ? medicine.stock : (medicine.Stock !== undefined ? medicine.Stock : 999);

        const name = medicine.name || medicine.Name || "Unknown Medicine";
        const price = medicine.price !== undefined ? medicine.price : (medicine.Price !== undefined ? medicine.Price : 0);
        const imageUrl = medicine.imageUrl || medicine.Image || 'https://placehold.co/80x80';

        if (existingItem) {
          // If it exists, check stock limit
          const newQty = Math.min(existingItem.quantity + quantity, availableStock);
          return safeItems.map(item => 
            item.medicineId === medId 
              ? { ...item, quantity: newQty }
              : item
          );
        }
        
        // If it's a new item
        return [...safeItems, { 
          medicineId: medId, 
          name: name,
          price: price,
          imageUrl: imageUrl,
          stock: availableStock,
          quantity: Math.min(quantity, availableStock)
        }];
      });
      
      const debugName = medicine.name || medicine.Name || "Unknown";
      console.log(`Added ${debugName} to cart`);
    } catch (e) {
      console.error("Cart error:", e);
    }
  };

  const removeFromCart = (medicineId) => {
    setCartItems(prevItems => prevItems.filter(item => item.medicineId !== medicineId));
  };

  const updateQuantity = (medicineId, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => {
        if (item.medicineId === medicineId) {
          return { ...item, quantity: Math.min(newQuantity, item.stock) };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};
