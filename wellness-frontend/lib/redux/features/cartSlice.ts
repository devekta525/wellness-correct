import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface CartState {
    items: CartItem[];
    totalQuantity: number;
    totalAmount: number;
}

const getInitialState = (): CartState => {
    if (typeof window !== 'undefined') {
        const savedCart = localStorage.getItem('wellness_cart');
        if (savedCart) {
            try {
                const parsedCart = JSON.parse(savedCart);
                return {
                    items: parsedCart.items || [],
                    totalQuantity: parsedCart.totalQuantity || 0,
                    totalAmount: parsedCart.totalAmount || 0,
                };
            } catch (error) {
                console.error('Error parsing cart from localStorage:', error);
            }
        }
    }
    return {
        items: [],
        totalQuantity: 0,
        totalAmount: 0,
    };
};

const initialState: CartState = getInitialState();

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart(state, action: PayloadAction<Omit<CartItem, 'quantity'>>) {
            const newItem = action.payload;
            const existingItem = state.items.find((item) => item.id === newItem.id);

            state.totalQuantity++;
            state.totalAmount += newItem.price;

            if (!existingItem) {
                state.items.push({
                    ...newItem,
                    quantity: 1,
                });
                toast.success(`"${newItem.name}" added to cart!`);
            } else {
                existingItem.quantity++;
                toast.success(`Increased "${newItem.name}" quantity!`);
            }

            localStorage.setItem('wellness_cart', JSON.stringify(state));
        },
        removeFromCart(state, action: PayloadAction<string>) {
            const id = action.payload;
            const existingItem = state.items.find((item) => item.id === id);

            if (existingItem) {
                state.totalQuantity -= existingItem.quantity;
                state.totalAmount -= existingItem.price * existingItem.quantity;
                state.items = state.items.filter((item) => item.id !== id);
                toast.error(`"${existingItem.name}" removed from cart.`);
            }

            localStorage.setItem('wellness_cart', JSON.stringify(state));
        },
        updateQuantity(state, action: PayloadAction<{ id: string; quantity: number }>) {
            const { id, quantity } = action.payload;
            const existingItem = state.items.find((item) => item.id === id);

            if (existingItem) {
                const quantityDifference = quantity - existingItem.quantity;
                state.totalQuantity += quantityDifference;
                state.totalAmount += quantityDifference * existingItem.price;
                existingItem.quantity = quantity;

                if (existingItem.quantity <= 0) {
                    state.items = state.items.filter((item) => item.id !== id);
                }
            }

            localStorage.setItem('wellness_cart', JSON.stringify(state));
        },
        clearCart(state) {
            state.items = [];
            state.totalQuantity = 0;
            state.totalAmount = 0;
            localStorage.removeItem('wellness_cart');
            toast.success("Cart cleared!");
        },
    },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } = cartSlice.actions;
export default cartSlice.reducer;
