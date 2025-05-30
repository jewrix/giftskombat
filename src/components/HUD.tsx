import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const HUD: React.FC = () => {
    const round = useSelector((s: RootState) => s.game.round);
    const health = useSelector((s: RootState) => s.player.hp);
    const balance = useSelector((s: RootState) => s.player.balance);
    const winStreak = useSelector((s: RootState) => s.player.winStreak);
    const loseStreak = useSelector((s: RootState) => s.player.loseStreak);

    return (
        <div className="hud-container">
            <div>{balance}🪙</div>
            <div>{health}❤️</div>
            <div>Round: {round}</div>
            <div>Win-streak: {winStreak}</div>
            <div>Lose-streak: {loseStreak}</div>
        </div>
    );
};

export default HUD;