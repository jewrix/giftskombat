import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Schema } from "@colyseus/schema";
import {PlayerState, UnitType} from "./playerSlice.ts";

export interface PairResult {
    playerA: string;
    playerB: string;
    winner: string;
    side?: 'self' | 'enemy';
}

// Интерфейс по серверной схеме GameState.ts: round и combatStarted (флаг фазы боя)
export interface GameState extends Schema {
    round: number;
    combatStarted: boolean;
    players: Record<string, PlayerState> | Map<string, PlayerState>;
    lastResult?: {
        opponentIndex: number;
        win: boolean;
        playerRemaining: number;
        opponentRemaining: number;
    };
    pairs?: {a: string, b: string}[];
    pairResults: PairResult[];
    enemyBoard: UnitType[];
    playerBoard: UnitType[];
}

const initialState: Partial<GameState> = {
    round: 1,
    combatStarted: false,
    players: {},
    pairs: [],
    pairResults: [],
    enemyBoard: [],
    playerBoard: [],
};

const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        // Устанавливает текущий раунд
        setRound(state, action: PayloadAction<number>) {
            state.round = action.payload;
        },
        // Флаг начала/конца боя
        setCombatStarted(state, action: PayloadAction<boolean>) {
            state.combatStarted = action.payload;
        },
        // синхронизация списка всех игроков
        setPlayers(state, action: PayloadAction<Record<string, PlayerState>>) {
            state.players = action.payload;
        },
        // переопределение локальной фазы (LOBBY/PREP/BATTLE/RESULTS)
        phaseChanged(state, action: PayloadAction<'LOBBY' | 'PREP' | 'BATTLE' | 'RESULTS'>) {
            state.combatStarted = action.payload === 'BATTLE';
            if (action.payload === 'PREP') {
                // при вхождении в новую фазу подготовки сбрасываем историю пар
                state.pairResults = [];
            }
        },

        setPairs(state, action: PayloadAction< {a: string, b: string}[]>) { state.pairs = action.payload; },
        // завершение боя и сохранение результата
        battleFinished(
            state,
            action: PayloadAction<{
                opponentIndex: number;
                win: boolean;
                playerRemaining: number;
                opponentRemaining: number;
            }>
        ) {
            state.lastResult = action.payload;
        },

        setEnemyBoard(state, action: PayloadAction<UnitType[]>) {
            state!.enemyBoard = action.payload;
        },
        setPlayerBoard(state, action: PayloadAction<UnitType[]>) {
            state!.playerBoard = action.payload;
        },

        addPairResult(state, action: PayloadAction<PairResult>) {
            state!.pairResults!.push(action.payload);
        },
    },
});

export const {  setRound,
    setCombatStarted,
    setPlayers,
    setPairs,
    phaseChanged,
    battleFinished,
    setEnemyBoard,
    setPlayerBoard,
    addPairResult
} = gameSlice.actions;
export default gameSlice.reducer;