import {Solver} from '../solver'
import {countTrue, Op} from '../ops'
import {activeVerticesConnected} from '../graph'
import {BoolVar} from '../expr';
import * as common from './common'

const NeighborY = [-1, 0, 1, 0];
const NeighborX = [0, -1, 0, 1];

export function solveNurimisaki(height: number, width: number, problem: number[][]): number[][] | null {
    let solver = new Solver();
    let isWhite = solver.boolArray([height, width]);
    solver.addAnswerKey(isWhite);

    solver.ensure(isWhite.convolution(Op.Or, 2, 2));
    solver.ensure(isWhite.convolution(Op.And, 2, 2).not());
    activeVerticesConnected(solver, isWhite);

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            let adj = [];
            if (y > 0) adj.push(isWhite.at(y - 1, x));
            if (x > 0) adj.push(isWhite.at(y, x - 1));
            if (y < height - 1) adj.push(isWhite.at(y + 1, x));
            if (x < width - 1) adj.push(isWhite.at(y, x + 1));

            if (problem[y][x] === -1) {
                // no clue
                solver.ensure(isWhite.at(y, x).imp(countTrue(adj).ge(2)));
            } else {
                solver.ensure(isWhite.at(y, x));
                solver.ensure(countTrue(adj).eq(1));

                let c = problem[y][x];
                if (c === 0) continue;
                if (c === 1) return null;
                for (let d = 0; d < 4; ++d) {
                    const dy = NeighborY[d];
                    const dx = NeighborX[d];
                    const y2 = y + dy * (c - 1);
                    const x2 = x + dx * (c - 1);
                    if (0 <= y2 && y2 < height && 0 <= x2 && x2 < width) {
                        for (let i = 2; i < c; ++i) {
                            solver.ensure(isWhite.at(y + dy, x + dx).imp(isWhite.at(y + dy * i, x + dx * i)));
                        }
                        const y3 = y + dy * c;
                        const x3 = x + dx * c;
                        if (0 <= y3 && y3 < height && 0 <= x3 && x3 < width) {
                            solver.ensure(isWhite.at(y + dy, x + dx).imp(isWhite.at(y3, x3).not()));
                        }
                    } else {
                        const y3 = y + dy;
                        const x3 = x + dx;
                        if (0 <= y3 && y3 < height && 0 <= x3 && x3 < width) {
                            solver.ensure(isWhite.at(y3, x3).not());
                        }
                    }
                }
            }
        }
    }

    const isSat = solver.solve();
    if (!isSat) return null;

    let cell = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            let v = (isWhite.at(y, x) as BoolVar).assignment;
            if (v === true) row.push(common.WhiteCell);
            else if (v === false) row.push(common.BlackCell);
            else row.push(common.Undecided);
        }
        cell.push(row);
    }
    return cell;
}
