import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    cartOpen: false,
    searchOpen: false,
    darkMode: localStorage.getItem('darkMode') === 'true',
    mobileMenuOpen: false,
  },
  reducers: {
    toggleSidebar: (state) => { state.sidebarOpen = !state.sidebarOpen; },
    setSidebarOpen: (state, action) => { state.sidebarOpen = action.payload; },
    toggleCart: (state) => { state.cartOpen = !state.cartOpen; },
    setCartOpen: (state, action) => { state.cartOpen = action.payload; },
    toggleSearch: (state) => { state.searchOpen = !state.searchOpen; },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode);
      document.documentElement.classList.toggle('dark', state.darkMode);
    },
    toggleMobileMenu: (state) => { state.mobileMenuOpen = !state.mobileMenuOpen; },
  },
});

export const { toggleSidebar, setSidebarOpen, toggleCart, setCartOpen, toggleSearch, toggleDarkMode, toggleMobileMenu } = uiSlice.actions;
export default uiSlice.reducer;
