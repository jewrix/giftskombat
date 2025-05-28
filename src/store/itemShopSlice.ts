import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {Item} from './playerSlice';

interface ShopState {
    offers: Item[];
    isOpen: boolean
}

const initialState: ShopState = {
    offers: [],
    isOpen: false,
};

const itemShopSlice = createSlice({
    name: 'item-shop',
    initialState,
    reducers: {
        setItemOffers(state, action: PayloadAction<Item[]>) {
            state.offers = action.payload;
        },
        clearOffers(state) {
            state.offers = [];
        },
        openItemShop(state) {
            state.isOpen = true
        },
        closeItemShop(state) {
            state.isOpen = false
        },
    },
});

export const { setItemOffers, clearOffers, openItemShop, closeItemShop } = itemShopSlice.actions;
export default itemShopSlice.reducer;