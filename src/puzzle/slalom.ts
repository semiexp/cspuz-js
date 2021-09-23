import {Solver} from '../solver'
import {BoolGridFrame} from '../grid_frame'
import {activeEdgesSingleCycle} from '../graph'
import {countTrue, Op} from '../ops'
import {BoolVar, Expr} from '../expr'
import {Edge, NumberWithDirection} from './puzzle'
import * as common from './common'

export async function solveSlalomAsync(
    height: number,
    width: number,
    origin: {y: number, x: number},
    isBlack: boolean[][],
    gates: {y: number, x: number, length: number, order: number, vertical: boolean}[]):
        Promise<{horizontal: Edge[][], vertical: Edge[][]} | null> {
    let solver = new Solver();
    let loop = new BoolGridFrame(solver, height - 1, width - 1);
    solver.addAnswerKey(loop.horizontal);
    solver.addAnswerKey(loop.vertical);
    let loopDir = new BoolGridFrame(solver, height - 1, width - 1);
    //let isPassed = activeEdgesSingleCycle(solver, loop);
    activeEdgesSingleCycle(solver, loop);
    let isPassed = solver.boolArray([height, width]);
    let gateOrd = solver.intArray([height, width], 0, gates.length);

    let gateId: (number | null)[][] = [];
    for (let y = 0; y < height; ++y) {
        gateId.push(new Array(width).fill(null));
    }
    for (let i = 0; i < gates.length; ++i) {
        const gate = gates[i];
        let gateCells = [];
        if (gate.vertical) {
            for (let j = 0; j < gate.length; ++j) {
                gateCells.push(isPassed.at(gate.y + j, gate.x));
                gateId[gate.y + j][gate.x] = gate.order;
            }
        } else {
            for (let j = 0; j < gate.length; ++j) {
                gateCells.push(isPassed.at(gate.y, gate.x + j));
                gateId[gate.y][gate.x + j] = gate.order;
            }
        }
        solver.ensure(countTrue(gateCells).eq(1));
    }
    solver.ensure(isPassed.at(origin.y, origin.x));

    solver.ensure(gateOrd.at(origin.y, origin.x).eq(0));
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            let neighbors = [];
            if (y > 0) neighbors.push({y: y - 1, x: x});
            if (y < height - 1) neighbors.push({y: y + 1, x: x});
            if (x > 0) neighbors.push({y: y, x: x - 1});
            if (x < width - 1) neighbors.push({y: y, x: x + 1});

            // in-degree / out-degree
            {
                let conds = [];
                for (let i = 0; i < neighbors.length; ++i) {
                    let y2 = neighbors[i].y;
                    let x2 = neighbors[i].x;
                    conds.push(loop.at(y + y2, x + x2).and(loopDir.at(y + y2, x + x2).xor(y2 < y || (y2 == y && x2 < x))) as Expr);
                }
                solver.ensure(countTrue(conds).eq(isPassed.at(y, x).ite(1, 0)));
            }
            {
                let conds = [];
                for (let i = 0; i < neighbors.length; ++i) {
                    let y2 = neighbors[i].y;
                    let x2 = neighbors[i].x;
                    conds.push(loop.at(y + y2, x + x2).and(loopDir.at(y + y2, x + x2).iff(y2 < y || (y2 == y && x2 < x))) as Expr);
                }
                solver.ensure(countTrue(conds).eq(isPassed.at(y, x).ite(1, 0)));
            }

            if (isBlack[y][x]) {
                solver.ensure(isPassed.at(y, x).not());
                continue;
            }
            if (y === origin.y && x === origin.x) {
                continue;
            }
            let id = gateId[y][x];
            if (id === null) {
                for (let i = 0; i < neighbors.length; ++i) {
                    let y2 = neighbors[i].y;
                    let x2 = neighbors[i].x;
                    solver.ensure(loop.at(y + y2, x + x2).and(loopDir.at(y + y2, x + x2).xor(y2 < y || (y2 === y && x2 < x))).imp(
                        gateOrd.at(y2, x2).eq(gateOrd.at(y, x))
                    ));
                }
            } else {
                for (let i = 0; i < neighbors.length; ++i) {
                    let y2 = neighbors[i].y;
                    let x2 = neighbors[i].x;
                    solver.ensure(loop.at(y + y2, x + x2).and(loopDir.at(y + y2, x + x2).xor(y2 < y || (y2 === y && x2 < x))).imp(
                        gateOrd.at(y2, x2).eq(gateOrd.at(y, x).sub(1))
                    ));
                }
                if (id >= 1) {
                    solver.ensure(isPassed.at(y, x).imp(gateOrd.at(y, x).eq(id)));
                }
            }
        }
    }

    // auxiliary constraint
    for (let y0 = 0; y0 < height; ++y0) {
        for (let x0 = 0; x0 < width; ++x0) {
            for (let y1 = 0; y1 < height; ++y1) {
                for (let x1 = 0; x1 < width; ++x1) {
                    if ((y0 < y1 || (y0 == y1 && x0 < x1)) && gateId[y0][x0] !== null && gateId[y1][x1] !== null) {
                        solver.ensure((isPassed.at(y0, x0).and(isPassed.at(y1, x1))).imp(gateOrd.at(y0, x0).ne(gateOrd.at(y1, x1))));
                    }
                }
            }
        }
    }
    const isSat = await solver.solveAsync();
    if (!isSat) return null;

    let horizontal = [];
    for (let y = 0; y < height; ++y) {
        let row = [];
        for (let x = 0; x < width - 1; ++x) {
            let v = (loop.horizontal.at(y, x) as BoolVar).assignment;
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
            let v = (loop.vertical.at(y, x) as BoolVar).assignment;
            if (v === true) row.push(Edge.Line);
            else if (v === false) row.push(Edge.Blank);
            else row.push(Edge.Undecided);
        }
        vertical.push(row);
    }
    return {horizontal, vertical};
}
