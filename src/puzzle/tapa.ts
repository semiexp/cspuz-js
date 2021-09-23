import {Solver} from '../solver'
import {countTrue, foldOr, foldAnd, Op} from '../ops'
import {activeVerticesConnected} from '../graph'
import {BoolVar, Expr} from '../expr';
import * as common from './common'

const EightNeighborY = [-1, -1, -1, 0, 1, 1, 1, 0];
const EightNeighborX = [-1, 0, 1, 1, 1, 0, -1, -1];

export function solveTapa(height: number, width: number, clues: (number[] | null)[][]): number[][] | null {
    let solver = new Solver();
    let isBlack = solver.boolArray([height, width]);
    solver.addAnswerKey(isBlack);

    solver.ensure(isBlack.convolution(Op.And, 2, 2).not());
    activeVerticesConnected(solver, isBlack);

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            let clue = clues[y][x];
            if (clue === null) continue;

            solver.ensure(isBlack.at(y, x).not());

            let neighbors = [];
            for (let i = 0; i < 8; ++i) {
                let y2 = y + EightNeighborY[i];
                let x2 = x + EightNeighborX[i];
                if (0 <= y2 && y2 < height && 0 <= x2 && x2 < width) {
                    neighbors.push(isBlack.at(y2, x2));
                } else {
                    neighbors.push(isBlack.at(y, x));
                }
            }

            if (clue.length === 0 || clue[0] === 0) {
                solver.ensure(foldOr(neighbors).not());
                continue;
            }
            if (clue[0] === 8) {
                solver.ensure(foldAnd(neighbors));
                continue;
            }

            let clueCounts = new Array(9).fill(0);
            for (let i = 0; i < clue.length; ++i) {
                clueCounts[clue[i]]++;
            }

            for (let len = 1; len <= 8; ++len) {
                if (clueCounts[len] === 0) continue;
                let conditions = [];
                for (let s = 0; s < 8; ++s) {
                    let cond = [neighbors[s].not(), neighbors[(s + len + 1) % 8].not()];
                    for (let i = 0; i < len; ++i) {
                        cond.push(neighbors[(s + i + 1) % 8]);
                    }
                    conditions.push(foldAnd(cond));
                }
                solver.ensure(countTrue(conditions).eq(clueCounts[len]));
            }

            let unitCount = [];
            for (let s = 0; s < 8; ++s) {
                unitCount.push(neighbors[s].and(neighbors[(s + 1) % 8].not()) as Expr);
            }
            solver.ensure(countTrue(unitCount).eq(clue.length));
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
