// src/components/BattleField.tsx
import React, { useRef, useEffect } from 'react';
import {Renderer, Texture} from '@pixi/core';
import { Sprite } from '@pixi/sprite';
import { useRoom } from '../context/RoomContext';
import {useDispatch, useSelector} from 'react-redux';
import { battleFinished } from '../store/gameSlice';
import {Container} from "@pixi/display";
import {Ticker} from "@pixi/ticker";
import {RootState} from "../store/store.ts";
import {AnimatedSprite} from "pixi.js";

const CELL_SIZE = 80;
const GAP = 8;

/** Загружает массив текстур из последовательных файлов */
function loadTextures(baseName: string, count: number): Texture[] {
    return Array.from({ length: count }, (_, i) =>
        Texture.from(
            new URL(`../assets/${baseName}${i + 1}.png`, import.meta.url).href
        )
    );
}

const BattleField: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const room = useRoom();
    const dispatch = useDispatch();

    const spritesRef = useRef<Record<string, Sprite>>({});
    const stageRef = useRef<Container>();
    const appRef = useRef<Renderer>();
    const tickerRef = useRef<Ticker>();

    const pairs = useSelector((state: RootState) => state.game.pairs);

    // Подписка на события сервера и отрисовка
    useEffect(() => {
        if (!containerRef.current) return;
        containerRef.current.innerHTML = '';

        const width = CELL_SIZE * 4 + GAP * 3;
        const height = CELL_SIZE * 4 + GAP * 3;

        const renderer = new Renderer({ width, height, backgroundAlpha: 0 });
        appRef.current = renderer;
        containerRef.current.appendChild(renderer.view as HTMLCanvasElement);

        // Загружаем кадры для анимаций
        const moveFrames = loadTextures('move', 4);
        const attackFrames = loadTextures('attack', 5);
        const hurtFrames = loadTextures('hurt', 3);
        const deathFrames = loadTextures('death', 6);

        // Хранилище спрайтов по id
        const sprites: Record<string, Sprite> = {};

        // Спавним начальные спрайты
        const stage = new Container();
        stageRef.current = stage;

        const ticker = new Ticker();
        tickerRef.current = ticker;
        ticker.add(() => renderer.render(stage));
        ticker.start();

        // Перед подпиской на события — создание начальных спрайтов для обоих игроков
        { /* initial spawn */ }
        const statePlayers = room.state.players; // сериализуем всех игроков

        const selfId = room.sessionId;

        // Преобразуем словарь игроков в массив, отдельно для себя и противника
        const selfBoard: Array<any> = statePlayers.get(selfId)?.board || [];
        const opponentId = pairs?.find((pair) => pair.a === selfId)?.b || pairs?.find((pair) => pair.b === selfId)?.a;

        console.log({pairs, opponentId})

        const opponentBoard: Array<any> = statePlayers.get(opponentId!)?.board || [];

        // Функция создания спрайта
        const createSprite = (u: any, tint?: number) => {
            if (spritesRef.current[u.id]) return;
            const texture = Texture.from(`/assets/Archer.png`);
            const sprite = new Sprite(texture);
            sprite.width = CELL_SIZE;
            sprite.height = CELL_SIZE;
            sprite.x = u.positionX * (CELL_SIZE + GAP);
            sprite.y = u.positionY * (CELL_SIZE + GAP);
            sprite.anchor.set(0);
            if (tint !== undefined) sprite.tint = tint;
            stage.addChild(sprite);

            console.log({id: u})
            spritesRef.current[u.id] = sprite;
        };
        // Создаём свои
        selfBoard.forEach(u => createSprite(u));
        // Создаём противника (серым цветом)
        opponentBoard.forEach(u => createSprite(u, 0x777777));

        // Обработка входящих событий
        const onEvent = (msg: any) => {
            switch (msg.type) {
                case 'move': {
                    const spr = sprites[msg.id];
                    if (!spr) return;
                    // Анимация движения спрайта
                    const anim = new AnimatedSprite(moveFrames);
                    anim.animationSpeed = 0.25;
                    anim.loop = false;
                    anim.position.set(spr.x, spr.y);
                    anim.onComplete = () => {
                        stage.removeChild(anim);
                        // Перемещаем основной спрайт на новую позицию
                        spr.position.set(
                            msg.x * (CELL_SIZE + GAP),
                            msg.y * (CELL_SIZE + GAP)
                        );
                    };
                    stage.addChild(anim);
                    anim.play();
                    break;
                }
                case 'attack': {
                    const attacker = sprites[msg.attacker];
                    const target = sprites[msg.target];
                    if (!attacker || !target) return;
                    // Анимация атаки
                    const atk = new AnimatedSprite(attackFrames);
                    atk.animationSpeed = 0.3;
                    atk.loop = false;
                    atk.position.set(attacker.x, attacker.y);
                    atk.onComplete = () => stage.removeChild(atk);
                    stage.addChild(atk);
                    atk.play();
                    // Анимация получения урона
                    const hurt = new AnimatedSprite(hurtFrames);
                    hurt.animationSpeed = 0.4;
                    hurt.loop = false;
                    hurt.position.set(target.x, target.y);
                    hurt.onComplete = () => stage.removeChild(hurt);
                    stage.addChild(hurt);
                    hurt.play();
                    break;
                }
                case 'death': {
                    const spr = sprites[msg.id];
                    if (!spr) return;
                    const death = new AnimatedSprite(deathFrames as Texture[]);
                    death.animationSpeed = 0.25;
                    death.loop = false;
                    death.position.set(spr.x, spr.y);
                    death.onComplete = () => stage.removeChild(death);
                    stage.addChild(death);
                    stage.removeChild(spr);
                    delete sprites[msg.id];
                    death.play();
                    break;
                }
                case 'pairResult': {
                    dispatch(
                        battleFinished({
                            opponentIndex:
                                msg.playerB === room.sessionId ? msg.playerA : msg.playerB,
                            win: msg.winner === room.sessionId,
                            playerRemaining: msg.remainingPlayer,
                            opponentRemaining: msg.remainingOpponent,
                        })
                    );
                    break;
                }
            }
        };
        room.onMessage('event', onEvent);

        return () => {
            // room.removeListener('event', onEvent);
            // Уничтожаем спрайты
            Object.values(sprites).forEach(s => s.destroy());
        };
    }, [room, dispatch]);

    return (
        <div
            ref={containerRef}
            style={{
                width: CELL_SIZE * 4 + GAP * 3,
                height: CELL_SIZE * 4 + GAP * 3,
            }}
        />
    );
};

export default BattleField;
