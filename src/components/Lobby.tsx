import React, {useState} from 'react';
import {useClient} from '../context/ClientContext';
import {Room} from 'colyseus.js';
// import {useLaunchParams} from "@telegram-apps/sdk-react";

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

    // const launchParams = useLaunchParams();

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
                const battleRoom = await client.joinById(msg.battleRoomId, {
                    // name: launchParams.tgWebAppData.user.username,
                    // avatarUrl: launchParams.tgWebAppData.user.photoUrl,
                })
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


    const src = new URL(`/assets/Logo.png`, import.meta.url).href;
    const findMatchSrc = new URL(`/assets/FindMatch.png`, import.meta.url).href;
    const reconnectMatchSrc = new URL(`/assets/Reconnect.png`, import.meta.url).href;
    const cancelQueueSrc = new URL(`/assets/Cancel.png`, import.meta.url).href;
    const disconnectMatchSrc = new URL(`/assets/Disconnect.png`, import.meta.url).href;

    return (
        <div className="lobby">
            {withReconnection && <div className='lobby_container'>
                <button className='lobby_button' onClick={reconnect}><img src={reconnectMatchSrc} width={250} height={60}/></button>
                <button className='lobby_button' onClick={disconnect}><img src={disconnectMatchSrc} width={250} height={60}/></button>
            </div>}

            <img src={src} style={{
                position: 'absolute',
                width: '250px',
                height: '200px',
                objectFit: 'cover',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)'
            }}/>

            {!withReconnection && <div className='lobby_container'>
                {error && <p className="lobby_error">{error}</p>}
                {!searching ? (
                    <button className='lobby_button' onClick={findMatch}>
                        <img src={findMatchSrc} width={250}
                             height={60}/></button>
                ) : (
                    <button className='lobby_button' onClick={cancelSearch}><img src={cancelQueueSrc} width={250} height={60}/></button>
                )}
            </div>}

        </div>
    );
};

export default Lobby;
