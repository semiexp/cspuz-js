import {Undecided, BlackCell, WhiteCell} from './common'
import {Solver} from '../solver'
import {activeVerticesConnected} from '../graph'
import {BoolVar} from '../expr'
import {Op} from '../ops'

export function solveNurikabe(height: number, width: number, problem: number[][]): number[][] | null {
    let solver = new Solver();
    let clues = [];
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (problem[y][x] >= 1) {
                clues.push({x, y, n: problem[y][x]});
            }
        }
    }
    let division = solver.intArray([height, width], 0, clues.length);
    let isWhite = solver.boolArray([height, width]);
    solver.ensure(isWhite.iff(division.ne(0)));
    solver.addAnswerKey(isWhite);
    activeVerticesConnected(solver, isWhite.not());
    solver.ensure(isWhite.convolution(Op.And, 2, 1).imp(division.convolution(Op.Eq, 2, 1)));
    solver.ensure(isWhite.convolution(Op.And, 1, 2).imp(division.convolution(Op.Eq, 1, 2)));
    solver.ensure(isWhite.convolution(Op.Or, 2, 2));

    for (let i = 0; i < clues.length; ++i) {
        let {y, x, n} = clues[i];
        solver.ensure(division.at(y, x).eq(i + 1));
        if (n > 0) solver.ensure(division.eq(i + 1).countTrue().eq(n));
        activeVerticesConnected(solver, division.eq(i + 1));
    }

    const isSat = solver.solve();
    if (!isSat) return null;

    let ret = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            let v = (isWhite.at(y, x) as BoolVar).assignment;
            if (v === true) row.push(WhiteCell);
            else if (v === false) row.push(BlackCell);
            else row.push(Undecided);
        }
        ret.push(row);
    }
    return ret;
}

export async function solveNurikabeAsync(height: number, width: number, problem: number[][]): Promise<number[][] | null> {
    let solver = new Solver();
    let clues = [];
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (problem[y][x] >= 1) {
                clues.push({x, y, n: problem[y][x]});
            }
        }
    }
    let division = solver.intArray([height, width], 0, clues.length);
    let isWhite = solver.boolArray([height, width]);
    solver.ensure(isWhite.iff(division.ne(0)));
    solver.addAnswerKey(isWhite);
    activeVerticesConnected(solver, isWhite.not());
    solver.ensure(isWhite.convolution(Op.And, 2, 1).imp(division.convolution(Op.Eq, 2, 1)));
    solver.ensure(isWhite.convolution(Op.And, 1, 2).imp(division.convolution(Op.Eq, 1, 2)));
    solver.ensure(isWhite.convolution(Op.Or, 2, 2));

    for (let i = 0; i < clues.length; ++i) {
        let {y, x, n} = clues[i];
        solver.ensure(division.at(y, x).eq(i + 1));
        if (n > 0) solver.ensure(division.eq(i + 1).countTrue().eq(n));
        activeVerticesConnected(solver, division.eq(i + 1));
    }

    const isSat = await solver.solveAsync();
    if (!isSat) return null;

    let ret = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            let v = (isWhite.at(y, x) as BoolVar).assignment;
            if (v === true) row.push(WhiteCell);
            else if (v === false) row.push(BlackCell);
            else row.push(Undecided);
        }
        ret.push(row);
    }
    return ret;
}
