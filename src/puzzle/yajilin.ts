import {Solver} from '../solver'
import {BoolGridFrame} from '../grid_frame'
import {activeEdgesSingleCycle} from '../graph'
import {countTrue, Op} from '../ops'
import {BoolVar} from '../expr'
import {Edge, NumberWithDirection} from './puzzle'
import * as common from './common'

export async function solveYajilinAsync(height: number, width: number, problem: (NumberWithDirection | null)[][]):
    Promise<{cell: number[][], horizontal: Edge[][], vertical: Edge[][]} | null> {
    let solver = new Solver();
    let gridFrame = new BoolGridFrame(solver, height - 1, width - 1);
    solver.addAnswerKey(gridFrame.horizontal);
    solver.addAnswerKey(gridFrame.vertical);
    let isPassed = activeEdgesSingleCycle(solver, gridFrame);
    let isBlack = solver.boolArray([height, width]);
    solver.ensure(isBlack.convolution(Op.And, 1, 2).not());
    solver.ensure(isBlack.convolution(Op.And, 2, 1).not());
    solver.addAnswerKey(isBlack);

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            let cell = problem[y][x];
            if (cell !== null) {
                solver.ensure(isPassed.at(y, x).not());
                solver.ensure(isBlack.at(y, x).not());
                let {direction, value} = cell;
                let relatedCells = [];
                if (direction === common.Direction.Up) {
                    for (let i = 0; i < y; ++i) relatedCells.push(isBlack.at(i, x));
                } else if (direction === common.Direction.Left) {
                    for (let i = 0; i < x; ++i) relatedCells.push(isBlack.at(y, i));
                } else if (direction === common.Direction.Down) {
                    for (let i = y + 1; i < height; ++i) relatedCells.push(isBlack.at(i, x));
                } else if (direction === common.Direction.Right) {
                    for (let i = x + 1; i < width; ++i) relatedCells.push(isBlack.at(y, i));
                }
                if (relatedCells.length === 0) continue;
                solver.ensure(countTrue(relatedCells).eq(value));
            } else {
                solver.ensure(isPassed.at(y, x).xor(isBlack.at(y, x)));
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
    let horizontal = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width - 1; ++x) {
            let v = (gridFrame.horizontal.at(y, x) as BoolVar).assignment;
            if (v === true) row.push(Edge.Line);
            else if (v === false) row.push(Edge.Blank);
            else row.push(Edge.Undecided);
        }
        horizontal.push(row);
    }
    let vertical = [];
    for (let y = 0; y < height - 1; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            let v = (gridFrame.vertical.at(y, x) as BoolVar).assignment;
            if (v === true) row.push(Edge.Line);
            else if (v === false) row.push(Edge.Blank);
            else row.push(Edge.Undecided);
        }
        vertical.push(row);
    }
    return {cell, horizontal, vertical};
}
