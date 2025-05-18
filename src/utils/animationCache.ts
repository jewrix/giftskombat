import { Texture } from 'pixi.js';

// Интерфейс набора анимаций для одного типа юнита
export interface AnimationSet {
    idle: Texture[];
    walk: Texture[];
    attack: Texture[];
    hurt: Texture[];
    death: Texture[];
}

// Глобальное хранилище кэша анимаций
export const animationCache: Record<string, AnimationSet> = {};