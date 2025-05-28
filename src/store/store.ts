import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import playerReducer from './playerSlice';
import shopReducer from './shopSlice';
import itemShopSlice from "./itemShopSlice.ts";

export const store = configureStore({
    reducer: {
        game: gameReducer,
        player: playerReducer,
        shop: shopReducer,
        itemShop: itemShopSlice,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;