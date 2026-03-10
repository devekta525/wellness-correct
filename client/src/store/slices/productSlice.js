import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI, categoryAPI, brandAPI } from '../../services/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const res = await productAPI.getAll(params);
    return res.data;
  } catch (err) { return rejectWithValue(err.message); }
});

export const fetchFeatured = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    const res = await productAPI.getFeatured();
    return res.data.products;
  } catch (err) { return rejectWithValue(err.message); }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    const res = await categoryAPI.getAll();
    return res.data.categories;
  } catch (err) { return rejectWithValue(err.message); }
});

export const fetchBrands = createAsyncThunk('products/fetchBrands', async (_, { rejectWithValue }) => {
  try {
    const res = await brandAPI.getAll();
    return res.data.brands;
  } catch (err) { return rejectWithValue(err.message); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    featured: [],
    flashDeals: [],
    categories: [],
    brands: [],
    pagination: null,
    loading: false,
    error: null,
    filters: { sort: 'newest', page: 1, limit: 20 },
  },
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearProducts: (state) => {
      state.items = [];
      state.pagination = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.loading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeatured.fulfilled, (state, action) => {
        state.featured = action.payload;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      });
  },
});

export const { setFilters, clearProducts } = productSlice.actions;
export default productSlice.reducer;
