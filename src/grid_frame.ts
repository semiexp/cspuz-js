import { ExprArray } from './expr_array'
import { Graph } from './graph'
import { Solver } from './solver'

export class BoolGridFrame {
    height: number;
    width: number;
    horizontal: ExprArray;
    vertical: ExprArray;

    constructor(solver: Solver, height: number, width: number) {
        this.height = height;
        this.width = width;
        this.horizontal = solver.boolArray([height + 1, width]);
        this.vertical = solver.boolArray([height, width + 1]);
    }

    toGraph(): {graph: Graph, edges: ExprArray} {
        let height = this.height;
        let width = this.width;

        let graph = new Graph((height + 1) * (width + 1));
        let edges = [];

        for (let y = 0; y <= height; ++y) {
            for (let x = 0; x <= width; ++x) {
                if (x < width) {
                    graph.addEdge(y * (width + 1) + x, y * (width + 1) + (x + 1));
                    edges.push(this.horizontal.at(y, x));
                }
                if (y < height) {
                    graph.addEdge(y * (width + 1) + x, (y + 1) * (width + 1) + x);
                    edges.push(this.vertical.at(y, x));
                }
            }
        }

        return {graph, edges: new ExprArray([edges.length], edges)};
    }
}
