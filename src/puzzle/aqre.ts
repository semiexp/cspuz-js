import {Solver} from '../solver'
import {countTrue, Op} from '../ops'
import {activeVerticesConnected} from '../graph'
import {BoolVar} from '../expr';
import * as common from './common'

export function solveAqre(height: number, width: number, regions: {y: number, x: number}[][], clues: number[]): number[][] | null {
    let solver = new Solver();
    let isBlack = solver.boolArray([height, width]);
    solver.addAnswerKey(isBlack);

    if (width >= 4) {
        solver.ensure(isBlack.convolution(Op.Or, 1, 4));
        solver.ensure(isBlack.convolution(Op.Or, 4, 1));
    }
    if (height >= 4) {
        solver.ensure(isBlack.convolution(Op.And, 1, 4).not());
        solver.ensure(isBlack.convolution(Op.And, 4, 1).not());
    }
    activeVerticesConnected(solver, isBlack);

    let n = clues.length;
    for (let i = 0; i < n; ++i) {
        if (clues[i] >= 0) {
            let cells = [];
            for (let j = 0; j < regions[i].length; ++j) {
                cells.push(isBlack.at(regions[i][j].y, regions[i][j].x));
            }
            solver.ensure(countTrue(cells).eq(clues[i]));
        }
    }

    const isSat = solver.solve();
    if (!isSat) return null;

    let cell = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            let v = (isBlack.at(y, x) as BoolVar).assignment;
            if (v === true) row.push(common.BlackCell);
            else if (v === false) row.push(common.WhiteCell);
            else row.push(common.Undecided);
        }
        cell.push(row);
    }
    return cell;
}
