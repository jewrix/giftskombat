import React, {useRef, useEffect} from 'react';
import {useRoom} from '../context/RoomContext';
import {useDispatch, useSelector} from 'react-redux';
import {battleFinished} from '../store/gameSlice';
import {RootState} from "../store/store.ts";
import {AnimatedSprite, AnimatedSpriteFrames, Application, Graphics, Container} from "pixi.js";
import {UnitType} from "../store/playerSlice.ts";
import {animationCache} from "../utils/animationCache.ts";

import gsap from "gsap";

const CELL_SIZE = 35;
const GAP = 16;

const BattleField: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const room = useRoom();
    const dispatch = useDispatch();
    const playerBoard = useSelector((state: RootState) => state.game.playerBoard)!;
    const enemyBoard = useSelector((state: RootState) => state.game.enemyBoard)!;

    useEffect(() => {
        const app = new Application();
        app.init({
            width: 448,
            height: 242,
            backgroundAlpha: 0,
        }).then(async () => {

            if (!app) return

            containerRef?.current?.appendChild(app?.canvas as HTMLCanvasElement);

            app.ticker.add(() => app.render());
            app.ticker.start();

            const unitTypes = new Set<string>();

            playerBoard.forEach((u) => unitTypes.add(u.unitType));
            enemyBoard.forEach((u) => unitTypes.add(u.unitType));

            const animSets: Record<string, any> = {};
            unitTypes.forEach((type) => {
                animSets[type] = {
                    attack: animationCache[type]!.attack,
                    idle: animationCache[type]!.walk,
                    move: animationCache[type]!.walk,
                };
            });

            const containers: Record<string, Container> = {};
            const healthBars: Record<string, Graphics> = {};
            const currentHp: Record<string, number> = {};
            const maxHp: Record<string, number> = {};

            const sprites: Record<string, AnimatedSprite> = {};
            const idToType: Record<string, string> = {};

            function spawnUnit(u: UnitType, isEnemy?: boolean) {
                if (containers[u.id]) return;

                const container = new Container();
                container.x = (u.positionX ?? 0) * (CELL_SIZE + GAP);
                container.y = (u.positionY ?? 0) * (CELL_SIZE + GAP);

                const frames = animSets[u.unitType].idle as unknown as AnimatedSpriteFrames;
                const anim = new AnimatedSprite(frames);
                anim.animationSpeed = 0.2;
                anim.loop = true;
                anim.play();

                anim.width = CELL_SIZE;
                anim.height = CELL_SIZE;

                if (isEnemy) {
                    anim.anchor.set(1, 0);
                    anim.scale.x = -1;
                }

                maxHp[u.id] = u.hp;
                currentHp[u.id] = u.hp;

                // Задний фон бара
                const barBg = new Graphics()
                    .beginFill(0x000000)
                    .drawRect(0, 0, CELL_SIZE, 6)
                    .endFill();

                const barFg = new Graphics()
                    .beginFill(isEnemy ? 0xff0000 : 0x00ff00)
                    .drawRect(0, 0, CELL_SIZE, 6)
                    .endFill();

                barBg.y = -8;
                barFg.y = -8;
                healthBars[u.id] = barFg;

                container.addChild(anim);
                container.addChild(barBg);
                container.addChild(barFg);

                app.stage.addChild(container);
                containers[u.id] = container;
                sprites[u.id]    = anim;
                healthBars[u.id] = barFg;
                idToType[u.id]   = u.unitType;
            }

            // Создаём свои
            Array.from(playerBoard).forEach(u => spawnUnit(u));
            // Создаём противника (серым цветом)
            Array.from(enemyBoard).forEach(u => spawnUnit(u, true));

            // Обработка игровых событий
            room.onMessage('event', (msg: any) => {

                switch (msg.type) {
                    case 'move': {

                        const type = idToType[msg.id];
                        const sets = animSets[type];
                        const spr = sprites[msg.id];
                        const container = containers[msg.id];
                        if (!spr) return;

                        const targetX = msg.x * (CELL_SIZE + GAP);
                        const targetY = msg.y * (CELL_SIZE + GAP);

                        gsap.to(container, {
                            x: targetX,
                            y: targetY,
                            duration: 0.8,
                            ease: 'power1.out'
                        });

                        if (spr.textures !== animSets[idToType[msg.id]].move) {
                            spr.stop();
                            spr.textures = sets.move as unknown as AnimatedSpriteFrames;
                            spr.loop = true;
                            spr.play();
                        }

                        spr.play();
                        break;
                    }
                    case 'attack': {
                        const attackerType = idToType[msg.attacker];
                        const attackerSprite = sprites[msg.attacker];
                        const attackerSets = animSets[attackerType];
                        attackerSprite.animationSpeed = 0.3;
                        attackerSprite.textures = attackerSets.attack as unknown as AnimatedSpriteFrames;
                        attackerSprite.play();

                        currentHp[msg.target] = Math.max(0, currentHp[msg.target] - msg.damage);

                        const ratio = currentHp[msg.target] / maxHp[msg.target];
                        const bar = healthBars[msg.target];

                        const targetContainer = containers[msg.target];
                        const targetSprite = sprites[msg.target];
                        const targetType = idToType[msg.target];
                        const targetSets = animSets[targetType];

                        bar.clear();
                        if(ratio !== 0) {
                            bar.drawRect(0, 0, CELL_SIZE * ratio, 6).endFill();
                        } else {
                            targetContainer.alpha = 0.4;
                            targetSprite.textures = targetSets.idle as unknown as AnimatedSpriteFrames;
                        }
                        break;
                    }
                    // case 'death': {
                    //     if (!spr) return;
                    //     const dt = new AnimatedSprite(sets.death as unknown as AnimatedSpriteFrames);
                    //     dt.animationSpeed = 0.25;
                    //     dt.loop = false;
                    //     dt.x = spr.x;
                    //     dt.y = spr.y;
                    //     dt.width = CELL_SIZE;
                    //     dt.height = CELL_SIZE;
                    //     dt.anchor.set(0);
                    //     dt.onComplete = () => app.stage.removeChild(dt);
                    //     app.stage.addChild(dt);
                    //     app.stage.removeChild(spr);
                    //     delete sprites[msg.id];
                    //     delete idToType[msg.id];
                    //     dt.play();
                    //     break;
                    // }
                    case 'pairResult': {
                        // msg.playerA, msg.playerB, msg.winner
                        dispatch(battleFinished({
                            opponentIndex: msg.playerB === room.sessionId ? msg.playerA : msg.playerB,
                            win: msg.winner === room.sessionId,
                            playerRemaining: msg.winner === room.sessionId ? msg.playerA.remaining : msg.playerB.remaining,
                            opponentRemaining: msg.winner === room.sessionId ? msg.playerB.remaining : msg.playerA.remaining,
                        }));
                        break;
                    }
                    default:
                        break;
                }
            });
        })


        return () => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-expect-error
            room.removeAllListeners('event');
            app.ticker.stop();
            app.ticker.destroy();
            app.renderer.destroy();
            app.stage.destroy({children: true});
            gsap.globalTimeline.clear()
        };
    }, [room, dispatch]);

    return (
            <div
                ref={containerRef}
                style={{
                    overflow: 'hidden'
                }}
            />
    );
};

export default BattleField;