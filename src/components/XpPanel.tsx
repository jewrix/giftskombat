import React from 'react';
import { useSelector } from 'react-redux';
import { useRoom } from '../context/RoomContext';
import { RootState } from '../store/store';

const XpPanel: React.FC = () => {
    const room    = useRoom();
    const { balance, xp, level, xpCost } = useSelector((s: RootState) => s.player);

    const canBuy = balance >= xpCost;
    const xpToNext = level * 10; // порог получен из BattleRoom.xpToNextLevel

    const handleBuy = () => {
        if (!canBuy) return;
        room.send('buyXp', { amount: 1 });
    };

    return (
        <div className="xp-panel">
            <div className="xp-info">
                <div>Уровень: {level}</div>
                <div className="xp-count">XP: {xp} / {xpToNext}</div>
            </div>
            <button onClick={handleBuy} disabled={!canBuy}>
                +1 XP ({xpCost} 🪙)
            </button>
        </div>
    );
};

export default XpPanel;
