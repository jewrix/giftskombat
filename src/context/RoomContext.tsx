import React, { createContext, useContext, ReactNode } from 'react';
import { Room } from 'colyseus.js';
import {GameState} from "../store/gameSlice.ts";
import {PlayerState} from "../store/playerSlice.ts";
import {Schema} from "@colyseus/schema";

const RoomContext = createContext<Room<{
    round: number;
    combatStarted: boolean;
    players: Map<string, PlayerState> & Schema;
    lastResult?: {
        opponentIndex: number;
        win: boolean;
        playerRemaining: number;
        opponentRemaining: number;
    };
    playerPairs?: string[][]
} & Schema> | null>(null);

export function useRoom() {
    const room = useContext(RoomContext);
    if (!room) {
        throw new Error('useRoom must be used within a RoomProvider');
    }
    return room;
}

interface RoomProviderProps { room: Room<GameState>; children: ReactNode }
export const RoomProvider: React.FC<RoomProviderProps> = ({ room, children }) => (
    // @ts-ignore
    <RoomContext.Provider value={room}>
        {children}
    </RoomContext.Provider>
);