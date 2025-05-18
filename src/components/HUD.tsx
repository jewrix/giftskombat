import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

const HUD: React.FC = () => {
    const round = useSelector((s: RootState) => s.game.round);
    const health = useSelector((s: RootState) => s.player.hp);
    const winStreak = useSelector((s: RootState) => s.player.winStreak);
    const loseStreak = useSelector((s: RootState) => s.player.loseStreak);
    const playerLvl = useSelector((s: RootState) => s.player.level);

    return (
        <div className="hud-container">
            <div>Уровень: {playerLvl}</div>
            <div>Раунд: {round}</div>
            <div>Раунд: {round}</div>
            <div>Здоровье: {health}</div>
            <div>Вин-стрики: {winStreak}</div>
            <div>Луз-стрики: {loseStreak}</div>
        </div>
    );
};

export default HUD;