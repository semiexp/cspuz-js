import {Solver} from '../solver'
import {BoolGridFrame} from '../grid_frame'
import {activeEdgesSingleCycle} from '../graph'
import {countTrue} from '../ops'
import {BoolVar} from '../expr'
import {Edge} from './puzzle'

export async function solveSlitherlinkAsync(height: number, width: number, problem: number[][]): Promise<{horizontal: Edge[][], vertical: Edge[][]} | null> {
    let solver = new Solver();
    let gridFrame = new BoolGridFrame(solver, height, width);
    solver.addAnswerKey(gridFrame.horizontal);
    solver.addAnswerKey(gridFrame.vertical);
    activeEdgesSingleCycle(solver, gridFrame);

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (0 <= problem[y][x] && problem[y][x] <= 3) {
                let neighbors = [
                    gridFrame.horizontal.at(y, x),
                    gridFrame.horizontal.at(y + 1, x),
                    gridFrame.vertical.at(y, x),
                    gridFrame.vertical.at(y, x + 1)
                ];
                solver.ensure(countTrue(neighbors).eq(problem[y][x]));
            }
        }
    }

    const isSat = await solver.solveAsync();
    if (!isSat) return null;

    let horizontal = [];
    for (let y = 0; y <= height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            let v = (gridFrame.horizontal.at(y, x) as BoolVar).assignment;
            if (v === true) row.push(Edge.Line);
            else if (v === false) row.push(Edge.Blank);
            else row.push(Edge.Undecided);
        }
        horizontal.push(row);
    }
    let vertical = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x <= width; ++x) {
            let v = (gridFrame.vertical.at(y, x) as BoolVar).assignment;
            if (v === true) row.push(Edge.Line);
            else if (v === false) row.push(Edge.Blank);
            else row.push(Edge.Undecided);
        }
        vertical.push(row);
    }
    return {horizontal, vertical};
}

export function solveSlitherlink(height: number, width: number, problem: number[][]): {horizontal: Edge[][], vertical: Edge[][]} | null {
    let solver = new Solver();
    let gridFrame = new BoolGridFrame(solver, height, width);
    solver.addAnswerKey(gridFrame.horizontal);
    solver.addAnswerKey(gridFrame.vertical);
    activeEdgesSingleCycle(solver, gridFrame);

    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (0 <= problem[y][x] && problem[y][x] <= 3) {
                let neighbors = [
                    gridFrame.horizontal.at(y, x),
                    gridFrame.horizontal.at(y + 1, x),
                    gridFrame.vertical.at(y, x),
                    gridFrame.vertical.at(y, x + 1)
                ];
                solver.ensure(countTrue(neighbors).eq(problem[y][x]));
            }
        }
    }

    const isSat = solver.solve();
    if (!isSat) return null;

    let horizontal = [];
    for (let y = 0; y <= height; ++y) {
        let row = [];
        for (let x = 0; x < width; ++x) {
            let v = (gridFrame.horizontal.at(y, x) as BoolVar).assignment;
            if (v === true) row.push(Edge.Line);
            else if (v === false) row.push(Edge.Blank);
            else row.push(Edge.Undecided);
        }
        horizontal.push(row);
    }
    let vertical = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x <= width; ++x) {
            let v = (gridFrame.vertical.at(y, x) as BoolVar).assignment;
            if (v === true) row.push(Edge.Line);
            else if (v === false) row.push(Edge.Blank);
            else row.push(Edge.Undecided);
        }
        vertical.push(row);
    }
    return {horizontal, vertical};
}
