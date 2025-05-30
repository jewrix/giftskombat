import React, {useMemo} from 'react';
import {useSelector} from 'react-redux';
import {useRoom} from '../context/RoomContext';
import {RootState} from '../store/store';
import {Stack} from "@mui/material";

interface PlayerEntry {
    id: string;
    hp: number;
    avatarUrl: string;
    name: string;
}

const PlayersList: React.FC = () => {
    const room = useRoom();
    const players = useSelector((state: RootState) => state.game.players);

    const entries = useMemo(() => {
        return Object.entries(players)
            .map(([id, p]) => ({id, name: p.name, avatarUrl: p.avatarUrl, hp: p.hp}))
            .sort((a, b) => b.hp - a.hp);
    }, [players]);

    return (
        <div className="players-list">
            <ul>
                {entries.map(({id, hp, name, avatarUrl}: PlayerEntry) => (
                    <li key={id} style={{fontWeight: id === room.sessionId ? 'bold' : 'normal'}}>
                        <Stack gap={1}>
                            {avatarUrl && <img src={avatarUrl} alt={name} width={15} height={15}/>}
                            {id === room.sessionId ? 'Вы' : name}: {hp}❤️
                        </Stack>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PlayersList;
