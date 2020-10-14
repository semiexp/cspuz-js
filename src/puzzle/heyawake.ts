import {Solver} from '../solver'
import {countTrue, foldOr, Op} from '../ops'
import {activeVerticesConnected} from '../graph'
import {BoolVar} from '../expr';
import * as common from './common'

export async function solveHeyawakeAsync(height: number, width: number, regions: {y: number, x: number}[][], clues: number[]): Promise<number[][] | null> {
    let solver = new Solver();
    let isBlack = solver.boolArray([height, width]);
    solver.addAnswerKey(isBlack);

    solver.ensure(isBlack.convolution(Op.And, 1, 2).not());
    solver.ensure(isBlack.convolution(Op.And, 2, 1).not());
    activeVerticesConnected(solver, isBlack.not());

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

    let regionId = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            row.push(-1);
        }
        regionId.push(row);
    }
    for (let i = 0; i < n; ++i) {
        for (let pos of regions[i]) {
            regionId[pos.y][pos.x] = i;
        }
    }

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (x < width - 1 && regionId[y][x] != regionId[y][x + 1]) {
                let x2 = x + 1;
                while (x2 + 1 < width && regionId[y][x2] == regionId[y][x2 + 1]) ++x2;
                if (x2 + 1 < width) {
                    let cells = [];
                    for (let i = x; i <= x2 + 1; ++i) {
                        cells.push(isBlack.at(y, i));
                    }
                    solver.ensure(foldOr(cells));
                }
            }
            if (y < height - 1 && regionId[y][x] != regionId[y + 1][x]) {
                let y2 = y + 1;
                while (y2 + 1 < height && regionId[y2][x] == regionId[y2 + 1][x]) ++y2;
                if (y2 + 1 < height) {
                    let cells = [];
                    for (let i = y; i <= y2 + 1; ++i) {
                        cells.push(isBlack.at(i, x));
                    }
                    solver.ensure(foldOr(cells));
                }
            }
        }
    }

    const isSat = await solver.solveAsync();
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
