import React, {useState} from 'react';
import {useClient} from '../context/ClientContext';
import {Room} from 'colyseus.js';

type Props = {
    onMatchFound: (room: Room<any>) => void;
};

const Lobby: React.FC<Props> = ({onMatchFound}) => {
    const client = useClient();
    const [searching, setSearching] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lobbyRoom, setLobbyRoom] = useState<Room<any> | null>(null);

    const reconnectionToken = localStorage.getItem('reconnectionToken');

    const [withReconnection, setWithReconnection] = useState(!!reconnectionToken);

    const findMatch = async () => {
        setSearching(true);
        setError(null);

        try {
            // 1) подключаемся в комнату-лобби
            const lobby = await client.joinOrCreate('lobby_room');

            setLobbyRoom(lobby);
            // 2) просим сервер найти пару
            lobby.send('find_match', {});
            // 3) ждем события match_found
            lobby.onMessage('match_found', async (msg: { battleRoomId: string }) => {
                // отписываемся от лобби и переходим в боевую комнату
                await lobby.leave();
                const battleRoom = await client.joinById(msg.battleRoomId)
                onMatchFound(battleRoom);
            });
        } catch (e: any) {
            console.error(e);
            setError(e.message || 'Ошибка поиска матча');
            setSearching(false);
            setLobbyRoom(null);
        }
    };

    const cancelSearch = async () => {
        if (lobbyRoom) {
            try {
                await lobbyRoom.leave();
            } catch {
            }
            setLobbyRoom(null);
        }
        setSearching(false);
    };

    const reconnect = async () => {
        if (reconnectionToken) {
            try {
                const reconnectionRoom = await client.reconnect(reconnectionToken)
                onMatchFound(reconnectionRoom);
            } catch (e) {
                console.error("reconnection error:", {e})
                localStorage.removeItem('reconnectionToken');
                setWithReconnection(false);
            }
        }
    }

    const disconnect = async () => {
        if (reconnectionToken) {
            localStorage.removeItem('reconnectionToken');
            setWithReconnection(false);
        }
    }


    return (
        <div className="lobby">
            <h1>Автобаттлер</h1>
            {withReconnection && <>
                <button onClick={reconnect}>Переподключиться</button>
                <button onClick={disconnect}>Отключится</button>
            </>}


            {!withReconnection && <>
                {!searching ? (
                    <button onClick={findMatch}>Найти матч</button>
                ) : (
                    <button onClick={cancelSearch}>Отменить поиск</button>
                )}
            </>}

            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default Lobby;
