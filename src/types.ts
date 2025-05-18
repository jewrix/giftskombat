export interface Unit {
    id: string;
    name: string;
    cost: number;
    hp: number;
    damage: number;
    traits?: string[];
}

export interface PlayerState {
    gold: number;
    hp: number;
    exp: number;
    bench: Unit[];
    board: Unit[];
    winStreak: number;
    loseStreak: number;
}
