import React, {useEffect, useState} from 'react';
import {DndContext, PointerSensor, TouchSensor, useSensor, useSensors} from '@dnd-kit/core';
import Lobby from './components/Lobby';
import {RoomProvider} from './context/RoomContext';
import Game from './components/Game';
import {Room} from "colyseus.js";
import {preloadAll} from "./utils/animationUtils.ts";
import {animationCache} from "./utils/animationCache.ts";
import {createTheme, ThemeProvider} from "@mui/material";

import './Game.css';

preloadAll(['PlushPepe', 'ScaredCat', 'Cookie', 'Doll', 'JellyBunny', 'MadPumpkin', 'ToyBear', 'CrystalBall']);
// preloadAll(["Doll"]);

console.log({animationCache})
const theme = createTheme();
const App: React.FC = () => {
    const [battleRoom, setBattleRoom] = useState<null | Room>(null);
    const [dragging, setDragging] = useState(false);
    const [orientation, setOrientation] = useState(screen.orientation.type);

    useEffect(() => {
        if (battleRoom) {
            battleRoom.onMessage('matchEnd', () => {
                setBattleRoom(null);
            })
        }
    }, [battleRoom])

    useEffect(() => {
        screen.orientation.addEventListener('change', () => {
            setOrientation(screen.orientation.type);
        });

        return () => {
            screen.orientation.removeEventListener('change', () => {
                setOrientation(screen.orientation.type);
            });
        };
    }, []);

    const handleDragStart = () => {
        setDragging(true)
    };

    const handleDragEnd = () => {
        setDragging(false)
    };

    const pointerSensor = useSensor(PointerSensor)
    const touchSensor = useSensor(TouchSensor, {
        activationConstraint: {
            delay: 100,  // мс задержки перед тач-драгом
            tolerance: 5,    // px «шум» движения, который игнорируем
        }
    })

    const sensors = useSensors(
        pointerSensor,
        touchSensor
    );

    if (orientation.startsWith('portrait')) {
        return (
            <div style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <div style={{width: 400, height: 600}}>
                    <h1>Пожалуйста, поверните устройство</h1>
                </div>
            </div>
        )
    }

    if (!battleRoom) {
        return <Lobby onMatchFound={setBattleRoom}/>;
    }

    return (
        <ThemeProvider theme={theme}>
            <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd} sensors={sensors}>
                <RoomProvider room={battleRoom}>
                    <Game dragging={dragging}/>
                </RoomProvider>
            </DndContext>
        </ThemeProvider>
    );
};

export default App;
