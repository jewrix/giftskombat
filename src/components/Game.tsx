// src/components/Game.tsx
import React from 'react';
import {useSelector} from 'react-redux';
import {RootState} from '../store/store';
import HUD from './HUD';
import ShopPanel from './ShopPanel';
import BoardGrid from './BoardGrid';
import BenchGrid from './BenchGrid';
import SellSlot from './SellSlot';
import BattleField from './BattleField';
import {useGameSocket} from "../hooks/useGameSocket.ts";
import PlayersList from "./PlayersList.tsx";
import XpPanel from "./XpPanel.tsx";

const Game: React.FC<{dragging: boolean}> = ({dragging}) => {
    useGameSocket()

    const combatStarted = useSelector((s: RootState) => s.game.combatStarted);

    // можно слушать серверные сообщения о смене фазы тоже
    // React.useEffect(() => {
    // room.onMessage('start_preparation', () => dispatch(phaseChanged('PREP')));
    // room.onMessage('start_battle',     () => dispatch(phaseChanged('BATTLE')));
    // room.onMessage('battle_results',   () => dispatch(phaseChanged('RESULTS')));
    // return () => room.removeAllListeners();
    // }, [room, dispatch]);

    console.log({combatStarted})

    return (
        <div className="game-ui">

            {/* 1. HEADER */}
            <HUD/>

            {/* 2. MAIN CONTENT */}
            <div className="main-content">

                {/* 2.1 Left Sidebar: список игроков */}
                <aside className="left-sidebar">
                    <PlayersList/>
                </aside>

                {/* 2.2 Center Area */}
                <div className="center-area">
                    <>
                        {/* XP bar */}
                        <div className="top-panel">
                        </div>

                        {/* Shop + Sell */}
                        <div className="shop-sell-panel">

                        </div>

                        {/* Board Grid */}
                        {
                            !combatStarted ? (
                                    <div className="board-panel">
                                        <BoardGrid/>
                                    </div>
                                ) :
                                <div className="battle-field">
                                    <BattleField/>
                                </div>
                        }

                        {/* Bench below */}
                        <div className="bench-panel">
                            <XpPanel/>

                            <BenchGrid/>

                            {dragging ? <SellSlot/> : <ShopPanel/>}
                        </div>
                    </>
                </div>
            </div>

        </div>
    );
};

export default Game;
