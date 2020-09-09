import { Solver } from './solver'
import { Expr, IntConstant } from './expr'
import { ExprArray } from './expr_array'
import { Op } from './ops'

export class Graph {
    numVertices: number;
    edges: {x: number, y: number}[];
    incidentEdges: number[][];

    constructor(n: number) {
        this.numVertices = n;
        this.edges = [];
        this.incidentEdges = [];
        for (let i = 0; i < n; ++i) {
            this.incidentEdges.push([]);
        }
    }

    get numEdges(): number {
        return this.edges.length;
    }

    addEdge(x: number, y: number) {
        const edgeId = this.edges.length;
        this.edges.push({x, y});
        this.incidentEdges[x].push(edgeId);
        this.incidentEdges[y].push(edgeId);
    }
}

function getGridGraph(height: number, width: number): Graph {
    let ret = new Graph(height * width);
    for (let y = 0; y < height; ++y) {
        for (let x = 0; x < width; ++x) {
            if (x < width - 1) {
                ret.addEdge(y * width + x, y * width + (x + 1));
            }
            if (y < height - 1) {
                ret.addEdge(y * width + x, (y + 1) * width + x);
            }
        }
    }
    return ret;
}

export function activeVerticesConnected(solver: Solver, isActive: ExprArray): void;
export function activeVerticesConnected(solver: Solver, isActive: ExprArray | Expr[], graph: Graph): void;

export function activeVerticesConnected(solver: Solver, ...value: any) {
    if (value.length === 1) {
        let isActive = value[0];
        if (!(isActive instanceof ExprArray)) throw TypeError();
        if (isActive.shape.length != 2) throw Error("dimension of isActive must be 2 is graph is not specified");

        const graph = getGridGraph(isActive.shape[0], isActive.shape[1]);
        activeVerticesConnected(solver, isActive.content, graph);
    } else {
        const isActive = value[0];
        const graph = value[1];

        let isActiveContent: Expr[];
        if (isActive instanceof ExprArray) {
            isActiveContent = isActive.content;
        } else if (isActive instanceof Array) {
            isActiveContent = isActive;
        } else {
            throw TypeError();
        }
        if (!(graph instanceof Graph)) {
            throw TypeError();
        }

        let operands = [];
        operands.push(new IntConstant(graph.numVertices));
        operands.push(new IntConstant(graph.numEdges));
        for (let i = 0; i < isActiveContent.length; ++i) {
            operands.push(isActiveContent[i]);
        }
        for (let i = 0; i < graph.numEdges; ++i) {
            const edge = graph.edges[i];
            operands.push(new IntConstant(edge.x));
            operands.push(new IntConstant(edge.y));
        }
        solver.ensure(new Expr(Op.GraphActiveVerticesConnected, operands));
    }
}
