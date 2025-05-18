import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { UnitType } from './playerSlice';

interface ShopState {
    offers: UnitType[];
    rerollCost: number;
    isOpen: boolean
}

const initialState: ShopState = {
    offers: [],
    rerollCost: 2,
    isOpen: true,
};

const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
        setOffers(state, action: PayloadAction<UnitType[]>) {
            state.offers = action.payload;
        },
        clearOffers(state) {
            state.offers = [];
        },
        openShop(state) {
            state.isOpen = true
        },
        closeShop(state) {
            state.isOpen = false
        },
        rerollShop(state) {
            state.offers = []; // новые предложения придут по WebSocket
        },
    },
});

export const { setOffers, clearOffers, rerollShop, openShop, closeShop } = shopSlice.actions;
export default shopSlice.reducer;