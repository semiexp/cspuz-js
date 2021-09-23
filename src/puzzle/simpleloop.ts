import {Solver} from '../solver'
import {BoolGridFrame} from '../grid_frame'
import {activeEdgesSingleCycle} from '../graph'
import {BoolVar} from '../expr'
import {Edge} from './puzzle'

// 1: white circle, 2: black circle
export function solveSimpleLoop(height: number, width: number, blocked: boolean[][]): {horizontal: Edge[][], vertical: Edge[][]} | null {
    let solver = new Solver();
    let gridFrame = new BoolGridFrame(solver, height - 1, width - 1);
    solver.addAnswerKey(gridFrame.horizontal);
    solver.addAnswerKey(gridFrame.vertical);
    let isPassed = activeEdgesSingleCycle(solver, gridFrame);

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (blocked[y][x]) {
                solver.ensure(isPassed.at(y, x).not());
            } else {
                solver.ensure(isPassed.at(y, x));
            }
        }
    }

    const isSat = solver.solve();
    if (!isSat) return null;

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
    return {horizontal, vertical};
}
