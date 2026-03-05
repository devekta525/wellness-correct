import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';

export interface WishlistItem {
    id: string;
    name: string;
    price: number;
    image: string;
}

interface WishlistState {
    items: WishlistItem[];
    totalQuantity: number;
}

const getInitialState = (): WishlistState => {
    if (typeof window !== 'undefined') {
        const savedWishlist = localStorage.getItem('wellness_wishlist');
        if (savedWishlist) {
            try {
                const parsedWishlist = JSON.parse(savedWishlist);
                return {
                    items: parsedWishlist.items || [],
                    totalQuantity: parsedWishlist.totalQuantity || 0,
                };
            } catch (error) {
                console.error('Error parsing wishlist from localStorage:', error);
            }
        }
    }
    return {
        items: [],
        totalQuantity: 0,
    };
};

const initialState: WishlistState = getInitialState();

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        toggleWishlist(state, action: PayloadAction<WishlistItem>) {
            const newItem = action.payload;
            const existingItemIndex = state.items.findIndex((item) => item.id === newItem.id);

            if (existingItemIndex >= 0) {
                // Remove item from wishlist
                state.items.splice(existingItemIndex, 1);
                state.totalQuantity -= 1;
                toast.error(`"${newItem.name}" removed from wishlist.`);
            } else {
                // Add item to wishlist
                state.items.push(newItem);
                state.totalQuantity += 1;
                toast.success(`"${newItem.name}" added to wishlist!`);
            }

            localStorage.setItem('wellness_wishlist', JSON.stringify({ items: state.items, totalQuantity: state.totalQuantity }));
        },
        removeFromWishlist(state, action: PayloadAction<string>) {
            const id = action.payload;
            const existingItem = state.items.find((item) => item.id === id);

            if (existingItem) {
                state.totalQuantity -= 1;
                state.items = state.items.filter((item) => item.id !== id);
                toast.error(`"${existingItem.name}" removed from wishlist.`);
            }

            localStorage.setItem('wellness_wishlist', JSON.stringify({ items: state.items, totalQuantity: state.totalQuantity }));
        },
        clearWishlist(state) {
            state.items = [];
            state.totalQuantity = 0;
            localStorage.removeItem('wellness_wishlist');
            toast.success("Wishlist cleared!");
        },
    },
});

export const { toggleWishlist, removeFromWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
