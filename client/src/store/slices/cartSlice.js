import { createSlice } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

const loadCart = () => {
  try {
    const data = localStorage.getItem('Wellness_fuel_cart');
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveCart = (items) => {
  localStorage.setItem('Wellness_fuel_cart', JSON.stringify(items));
};

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: loadCart(),
    coupon: null,
    discount: 0,
    referralCode: null,
  },
  reducers: {
    addToCart: (state, action) => {
      const { product, quantity = 1, variant } = action.payload;
      const idStr = typeof product._id === 'string' ? product._id : (product._id?.toString?.() || String(product._id));
      const key = variant ? `${idStr}_${JSON.stringify(variant)}` : idStr;
      const existing = state.items.find(i => i.key === key);

      if (existing) {
        existing.quantity += quantity;
        toast.success(`${product.title} quantity updated in cart`);
      } else {
        state.items.push({
          key,
          product: { _id: product._id, title: product.title, thumbnail: product.thumbnail, price: product.price, comparePrice: product.comparePrice, discount: product.discount, slug: product.slug, stock: product.stock },
          quantity,
          variant,
          price: product.discount > 0 ? product.price * (1 - product.discount / 100) : product.price,
        });
        toast.success(`${product.title} added to cart`);
      }
      saveCart(state.items);
    },

    removeFromCart: (state, action) => {
      state.items = state.items.filter(i => i.key !== action.payload);
      saveCart(state.items);
      toast.success('Item removed');
    },

    updateQuantity: (state, action) => {
      const { key, quantity } = action.payload;
      const item = state.items.find(i => i.key === key);
      if (item) {
        if (quantity <= 0) {
          state.items = state.items.filter(i => i.key !== key);
        } else {
          item.quantity = Math.min(quantity, item.product.stock || 999);
        }
        saveCart(state.items);
      }
    },

    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      state.discount = 0;
      localStorage.removeItem('Wellness_fuel_cart');
    },

    applyCoupon: (state, action) => {
      state.coupon = action.payload.coupon;
      state.discount = action.payload.discount;
    },

    removeCoupon: (state) => {
      state.coupon = null;
      state.discount = 0;
    },

    setReferralCode: (state, action) => {
      state.referralCode = action.payload;
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, applyCoupon, removeCoupon, setReferralCode } = cartSlice.actions;

// Selectors
export const selectCartItems = (state) => state.cart.items;
export const selectCartTotal = (state) => state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
export const selectCartCount = (state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0);

export default cartSlice.reducer;
