import { configureStore } from '@reduxjs/toolkit';
import gameReducer from './gameSlice';
import playerReducer from './playerSlice';
import shopReducer from './shopSlice';

export const store = configureStore({
    reducer: {
        game: gameReducer,
        player: playerReducer,
        shop: shopReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;