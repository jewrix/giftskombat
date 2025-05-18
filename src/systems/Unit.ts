export interface IUnitConfig {
    name: string;
    maxHealth: number;
    damage: number;
    attackInterval?: number; // миллисекунд между атаками
}

export default class Unit {
    public name: string;
    public health: number;
    public maxHealth: number;
    public damage: number;
    private attackInterval: number;
    private lastAttackTime: number;

    constructor(config: IUnitConfig) {
        this.name = config.name;
        this.maxHealth = config.maxHealth;
        this.health = config.maxHealth;
        this.damage = config.damage;
        this.attackInterval = config.attackInterval ?? 500;
        this.lastAttackTime = 0;
    }

    /**
     * Пытается атаковать цель, если прошёл интервал атаки.
     * @param target Unit — цель для атаки
     * @param currentTime number — текущее время (ms) от начала симуляции
     */
    public attack(target: Unit, currentTime: number = Date.now()): void {
        if (currentTime - this.lastAttackTime < this.attackInterval) return;
        this.lastAttackTime = currentTime;
        target?.receiveDamage(this?.damage);
    }

    /** Получить урон */
    public receiveDamage(amount: number): void {
        this.health -= amount;
        if (this.health < 0) this.health = 0;
    }

    /** Проверка, жив ли юнит */
    public isAlive(): boolean {
        return this.health > 0;
    }

    /** Сброс состояния для повторного использования */
    public reset(): void {
        this.health = this.maxHealth;
        this.lastAttackTime = 0;
    }

}
export class Pepe extends Unit {
    constructor() {
        super({
            name: "PlushPepe",
            maxHealth: 120,
            damage: 15,
            attackInterval: 400 // Быстрая атака
        });
    }
}

export class Cat extends Unit {
    constructor() {
        super({
            name: "ScaredCat",
            maxHealth: 90,
            damage: 25,
            attackInterval: 600 // Средняя скорость атаки
        });
    }
}

export class Cookie extends Unit {
    constructor() {
        super({
            name: "Cookie",
            maxHealth: 80,
            damage: 30,
            attackInterval: 800 // Медленная но мощная атака
        });
    }
}

export class Pumpkin extends Unit {
    constructor() {
        super({
            name: "MadPumpkin",
            maxHealth: 200,
            damage: 10,
            attackInterval: 1000 // Очень медленный, но живучий
        });
    }
}

export class ToyBear extends Unit {
    constructor() {
        super({
            name: "ToyBear",
            maxHealth: 150,
            damage: 20,
            attackInterval: 700 // Универсальные характеристики
        });
    }
}

export class CrystalBall extends Unit {
    constructor() {
        super({
            name: "CrystalBall",
            maxHealth: 100,
            damage: 40,
            attackInterval: 1500 // Очень медленная но разрушительная атака
        });
    }

}
function createUnit(name: string): Unit {
    switch (name) {
        case "PlushPepe":
            return new Pepe();
        case "ScaredCat":
            return new Cat();
        case "Cookie":
            return new Cookie();
        case "MadPumpkin":
            return new Pumpkin();
        case "ToyBear":
            return new ToyBear();
        case "CrystalBall":
            return new CrystalBall();
        default:
            // Для неизвестных юнитов используем базовый класс с параметрами по умолчанию
            return new Unit({
                name,
                maxHealth: 100,
                damage: 20,
                attackInterval: 500
            });
    }
}