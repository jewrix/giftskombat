import * as PIXI from 'pixi.js';
import {animationCache, AnimationSet} from './animationCache';
import {Assets} from "pixi.js";

// Сколько кадров у каждой анимации
export const FRAME_COUNTS = {
    Idle: 12,
    Walk: 10,
    Attack: 9,
    Hurt: 3,
    Death: 6,
    Projectile: 6,
} as const;

/**
 * Загружает текстуры для одного набора анимаций unitType и сохраняет в кэш.
 */
export async function preloadAnimationSet(unitType: string): Promise<AnimationSet> {
    // Если уже загружено — сразу возвращаем
    if (animationCache[unitType]) {
        return animationCache[unitType];
    }

    // Функция для загрузки массива текстур
    const load = async (action: keyof typeof FRAME_COUNTS) => {

        console.log({action})
        try {
            await Assets.load(`${import.meta.env.BASE_URL}assets/${unitType}/` + unitType + action + '.json');
            return Array.from({length: FRAME_COUNTS[action]}, (_, i) =>
                PIXI.Texture.from(
                    `hero_${action.toLowerCase()}_${i}.png`
                )
            );
        }
        catch (e) {
            console.error(e);
        }
    }

    const walk = await load('Walk');
    const attack = await load('Attack');
    const idle = await load('Idle');
    const projectile = await load('Projectile');
    // const hurt = await load('Hurt');
    // const death = await load('Death');

    // Собираем полный набор
    const set: AnimationSet = {
        idle,
        walk,
        attack,
        projectile,
        hurt: [],
        death: [],
    };

    // Кладём в кэш и возвращаем
    animationCache[unitType] = set;
    return set;
}

/**
 * Предзагружает анимации для массива типов сразу.
 */
export function preloadAll(unitTypes: string[]) {
    unitTypes.forEach(preloadAnimationSet);
}
