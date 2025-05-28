import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {Schema} from "@colyseus/schema";


export interface Item {
    id: string;
    name: string;
    attackBonus: number;
    hpBonus: number;
    speedBonus: number;
    rangeBonus: number;
    costBonus: number;
    armorBonus: number;
}

export interface UnitType {
    /** уникальный ID фигуры */
    id: string;

    /** чей это юнит */
    ownerId: string;

    /** внутренняя строка-тип (ScaredCat, и т.п.) */
    unitType: string;

    /** уровень (1–5) */
    tier: number;

    /** стоимость (для магазина / продажи) */
    cost: number;

    /** базовый максимум здоровья (без предметов) */
    baseHp: number;

    /** текущее здоровье (после урона и исцеления) */
    currentHp: number;

    /** базовая сила атаки (без предметов) */
    baseAttackPower: number;

    /** базовая дальность атаки (без предметов) */
    baseAttackRange: number;

    /** базовая скорость движения (без предметов) */
    baseSpeed: number;

    /** X–координата на сетке */
    positionX: number;

    /** Y–координата на сетке */
    positionY: number;

    /** “размер” фигуры (для обхода/занятости) */
    size: number;

    /** экипировка — массив предметов, дающих бонусы */
    items: Item[];
}


export interface PlayerState extends Schema {
    balance: number;
    hp: number;
    level: number;
    xp: number;
    winStreak: number;
    loseStreak: number;
    bench: UnitType[];
    board: UnitType[];
    shopOffers: UnitType[];
    aiBoards: UnitType[][];
    xpCost: number;
    name: string
    avatarUrl: string
}

const initialPlayerState: Omit<PlayerState, keyof Schema> = {
    balance: 0,
    hp: 100,
    level: 1,
    xp: 0,
    winStreak: 0,
    loseStreak: 0,
    bench: [],
    board: [],
    shopOffers: [],
    aiBoards: [],
    xpCost: 0,
    name: '',
    avatarUrl: ''
};

const playerSlice = createSlice({
    name: 'player',
    initialState: initialPlayerState,
    reducers: {
        setFullState(state, action: PayloadAction<Partial<PlayerState>>) {
            Object.assign(state, action.payload);
        },
        addCoins(state, action: PayloadAction<number>) {
            state.balance += action.payload;
        },
        addXp(state, action: PayloadAction<number>) {
            state.xp += action.payload;
        },
        buyUnit(state, action: PayloadAction<UnitType>) {
            state.bench.push(action.payload);
            state.balance -= action.payload.cost ?? 1;
        },
        placeUnit(state, action: PayloadAction<{ unitId: string; position: { row: number; col: number } }>) {
            const idx = state.bench.findIndex(u => u.id === action.payload.unitId);
            if (idx >= 0) {
                const [unit] = state.bench.splice(idx, 1);
                unit.positionX = action.payload.position.row;
                unit.positionY = action.payload.position.col;
                state.board.push(unit);
            }
        },
        returnUnitToBench(state, action: PayloadAction<{ unitId: string }>) {
            const idx = state.board.findIndex(u => u.id === action.payload.unitId);
            if (idx >= 0) {
                const [unit] = state.board.splice(idx, 1);
                unit.positionY = null;
                unit.positionX = null;
                state.bench.push(unit);
            }
        },
        setShopOffers(state, action: PayloadAction<UnitType[]>) {
            state.shopOffers = action.payload;
        },
        // Установить доски AI
        setOpponents(state, action: PayloadAction<UnitType[][]>) {
            state.aiBoards = action.payload;
        },
        setXpCost(state, action: PayloadAction<number>) {
            state.xpCost = action.payload;
        },
    },
});

export const {buyUnit, placeUnit, returnUnitToBench, setFullState, setOpponents, setXpCost } = playerSlice.actions;
export default playerSlice.reducer;