export const Undecided: number = -1;
export const BlackCell: number = -2;
export const WhiteCell: number = -3;

export enum Direction {
    Up,
    Left,
    Right,
    Down
}

export type NumberWithDirection = { direction: Direction, value: number };
