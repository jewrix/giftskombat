import React, {useEffect, useState} from 'react';
import {DndContext, DragOverlay} from '@dnd-kit/core';
import Lobby from './components/Lobby';
import {RoomProvider} from './context/RoomContext';
import Game from './components/Game';
import {Room} from "colyseus.js";
import {preloadAll} from "./utils/animationUtils.ts";
import {animationCache} from "./utils/animationCache.ts";
import {createTheme, ThemeProvider} from "@mui/material";

import './Game.css';

preloadAll(['PlushPepe', 'ScaredCat', 'Cookie', 'Doll', 'JellyBunny', 'MadPumpkin', 'ToyBear', 'CrystalBall']);

console.log({animationCache})
const theme = createTheme();
const App: React.FC = () => {
    const [battleRoom, setBattleRoom] = useState<null | Room>(null);
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        if (battleRoom) {
            battleRoom.onMessage('matchEnd', () => {
                setBattleRoom(null);
            })
        }
    }, [battleRoom])

    if (!battleRoom) {
        return <Lobby onMatchFound={setBattleRoom}/>;
    }

    const handleDragStart = () => {
        setDragging(true)
    };

    const handleDragEnd = () => {
        setDragging(false)
    };

    return (
        <ThemeProvider theme={theme}>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
                <RoomProvider room={battleRoom}>
                    <Game dragging={dragging}/>
                </RoomProvider>
            </DndContext>
        </ThemeProvider>
    );
};

export default App;
