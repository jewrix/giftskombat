import {useEffect} from 'react';
import {useDispatch} from 'react-redux';
import {setFullState, setOpponents, setXpCost} from "../store/playerSlice.ts";
import {
    addPairResult,
    battleFinished,
    phaseChanged,
    setEnemyBoard,
    setPairs,
    setPlayerBoard,
    setPlayers, setRound
} from "../store/gameSlice.ts";
import {PlayerState} from "../store/playerSlice.ts";
import {closeShop, openShop, setOffers} from "../store/shopSlice.ts";
import {useRoom} from "../context/RoomContext.tsx";
import {openItemShop, setItemOffers} from "../store/itemShopSlice.ts";

export function useGameSocket() {
    const dispatch = useDispatch();

    const room = useRoom()

    useEffect(() => {
        localStorage.setItem('reconnectionToken', room.reconnectionToken);
        // Синхронизируем при каждом изменении состояния комнаты
        room.onStateChange((state) => {
            // Текущий игрок
            const meSchema: PlayerState | undefined = state.players.get(room.sessionId);

            if (!meSchema) {
                return;
            }

            const me = meSchema.toJSON()

            if (me) {
                dispatch(setFullState(me));
                dispatch(setOffers(Array.from(me.shopOffers.values())));
                dispatch(setItemOffers(Array.from(me.itemOffers.values())))
            }

            const players = state.players.toJSON();

            // @ts-ignore
            dispatch(setPlayers(players))
            dispatch(setRound(state.round));

            // Оппоненты: все другие игроки
            const opponents: Array<PlayerState> = [];
            // @ts-ignore
            Object.entries(players)?.forEach(([sessionId, player]: [string, PlayerState]) => {
                if (sessionId !== room.sessionId) opponents.push(player);
            });
            dispatch(setOpponents(opponents.map(op => Array.from(Object.values(op.board)))));
        });

        room.onMessage('prepare', ({isWasNpcRound}: { isWasNpcRound: boolean }) => {
            if(isWasNpcRound) {
                console.log({isWasNpcRound})
                dispatch(openItemShop());
            } else {
                dispatch(openShop());
            }
        })

        room.onMessage('xpCost', (msg: { amount: number, cost: number }) => {
            // Записываем полученную цену в Redux
            dispatch(setXpCost(msg.cost));
        });
        room.onMessage('boardSnapshot', (msg: { self: any[], enemy: any[]}) => {
            dispatch(phaseChanged('BATTLE'));
            dispatch(closeShop());

            console.log('boardSnapshot', {msg})

            dispatch(setEnemyBoard(msg.enemy))
            dispatch(setPlayerBoard(msg.self))
        });

        room.onMessage('matchEnd', () => {
            room.leave();
            localStorage.removeItem('reconnectionToken');
        })
        room.onMessage('roundEnd', () => {
            dispatch(setPairs([]))
            dispatch(phaseChanged('PREP'));
        });
        room.onMessage('pairResult', (msg: {
            playerA: string;
            playerB: string;
            winner: string;
        }) => {
            dispatch(addPairResult({
                playerA: msg.playerA,
                playerB: msg.playerB,
                winner: msg.winner,
            }));
        });

        room.onMessage('buyXpResult', (msg: {
            success: boolean;
            amount: number;
            cost: number;
            balance: number;
            xp: number;
            level: number;
            reason?: string;
        }) => {
            if (!msg.success) {
                console.warn('Не удалось купить XP:', msg.reason);
                return;
            }
            // Обновляем баланс, XP и уровень в Redux
            dispatch(setFullState({
                balance: msg.balance,
                xp:      msg.xp,
                level:   msg.level,
            }));
        });

        room.onMessage('battle_results', (msg) => {
            // msg: { win, remaining, opponentRemaining }
            dispatch(battleFinished({
                opponentIndex: msg.opponentIndex,
                win: msg.win,
                playerRemaining: msg.remaining,
                opponentRemaining: msg.opponentRemaining,
            }));
        });

        return () => {
            room.removeAllListeners();
        };
    }, [room]);
}