import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useRoom } from '../context/RoomContext';
import { RootState } from '../store/store';

interface PlayerEntry {
    id: string;
    hp: number;
}

const PlayersList: React.FC = () => {
    const room = useRoom();
    const players = useSelector((state: RootState) => state.game.players);

    const entries = useMemo(() => {
        return Object.entries(players)
            .map(([id, p]) => ({ id, hp: p.hp }))
            .sort((a, b) => b.hp - a.hp);
    }, [players]);

    return (
        <div className="players-list">
            <ul>
                {entries.map(({ id, hp }: PlayerEntry) => (
                    <li key={id} style={{ fontWeight: id === room.sessionId ? 'bold' : 'normal' }}>
                        {id === room.sessionId ? 'Вы' : id}: {hp}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlayersList;
