import {Solver} from '../solver'
import {BoolGridFrame} from '../grid_frame'
import {activeEdgesSingleCycle} from '../graph'
import {countTrue, foldOr} from '../ops'
import {BoolVar, Expr, BoolConstant} from '../expr'
import {Edge} from './puzzle'

// 1: white circle, 2: black circle
export function solveMasyu(height: number, width: number, problem: number[][]): {horizontal: Edge[][], vertical: Edge[][]} | null {
    let solver = new Solver();
    let gridFrame = new BoolGridFrame(solver, height - 1, width - 1);
    solver.addAnswerKey(gridFrame.horizontal);
    solver.addAnswerKey(gridFrame.vertical);
    activeEdgesSingleCycle(solver, gridFrame);

    let trueVar = new BoolConstant(true);
    let falseVar = new BoolConstant(false);
    let getEdge = function (y: number, x: number, neg?: boolean): Expr {
        if (0 <= y && y <= 2 * (height - 1) && 0 <= x && x <= 2 * (width - 1)) {
            if (neg === true) {
                return gridFrame.at(y, x).not();
            } else {
                return gridFrame.at(y, x);
            }
        } else {
            if (neg === true) {
                return trueVar;
            } else {
                return falseVar;
            }
        }
    };

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (problem[y][x] === 1) {
                solver.ensure(
                    getEdge(y * 2, x * 2 - 1).and(getEdge(y * 2, x * 2 + 1)).and(getEdge(y * 2, x * 2 - 3, true).or(getEdge(y * 2, x * 2 + 3, true))).or(
                        getEdge(y * 2 - 1, x * 2).and(getEdge(y * 2 + 1, x * 2)).and(getEdge(y * 2 - 3, x * 2, true).or(getEdge(y * 2 + 3, x * 2, true)))
                    ));
            } else if (problem[y][x] === 2) {
                let dirs = [
                    getEdge(y * 2, x * 2 - 1).and(getEdge(y * 2, x * 2 - 3)),
                    getEdge(y * 2 - 1, x * 2).and(getEdge(y * 2 - 3, x * 2)),
                    getEdge(y * 2, x * 2 + 1).and(getEdge(y * 2, x * 2 + 3)),
                    getEdge(y * 2 + 1, x * 2).and(getEdge(y * 2 + 3, x * 2))
                ];
                solver.ensure((dirs[0].or(dirs[2])).and(dirs[1].or(dirs[3])));
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
