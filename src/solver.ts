import {Expr, BoolVar, IntVar, BoolConstant, IntConstant} from './expr'
import {ExprArray, arraySize} from './expr_array'
import {Op} from './ops'
import {CSugarSolver} from './csugar_wrapper'

function stringifyVariable(v: (BoolVar | IntVar)): string {
    if (v instanceof BoolVar) {
        return "(bool " + v.name + ")";
    } else {
        return "(int " + v.name + " " + v.lo + " " + v.hi + ")";
    }
}

function stringifyExpr(expr: Expr): string {
    if (expr.kind === Op.ConstantBool || expr.kind === Op.ConstantInt) {
        return ((expr as (BoolConstant | IntConstant)).value).toString();
    } else if (expr.kind === Op.VarBool || expr.kind === Op.VarInt) {
        return (expr as (BoolVar | IntVar)).name;
    } else {
        let opString;
        switch (expr.kind) {
            case Op.Neg: opString = "-"; break;
            case Op.Add: opString = "+"; break;
            case Op.Sub: opString = "-"; break;
            case Op.Eq: opString = "=="; break;
            case Op.Ne: opString = "!="; break;
            case Op.Le: opString = "<="; break;
            case Op.Lt: opString = "<"; break;
            case Op.Ge: opString = ">="; break;
            case Op.Gt: opString = ">"; break;
            case Op.Not: opString = "!"; break;
            case Op.And: opString = "&&"; break;
            case Op.Or: opString = "||"; break;
            case Op.Iff: opString = "iff"; break;
            case Op.Xor: opString = "xor"; break;
            case Op.Imp: opString = "=>"; break;
            case Op.Ite: opString = "if"; break;
            case Op.Alldiff: opString = "alldifferent"; break;
            case Op.GraphActiveVerticesConnected: opString = "graph-active-vertices-connected"; break;
            default: throw Error("unknown expr kind: " + expr.kind);
        }

        return "(" + opString + " " + expr.operands.map(stringifyExpr).join(" ") + ")";
    }
}

export class Solver {
    variables: (BoolVar | IntVar)[];
    isAnswerKey: boolean[];
    constraints: Expr[];

    constructor() {
        this.variables = [];
        this.isAnswerKey = [];
        this.constraints = [];
    }

    boolVar(): BoolVar {
        const ret = new BoolVar(this.variables.length);
        this.variables.push(ret);
        this.isAnswerKey.push(false);
        return ret;
    }

    intVar(lo: number, hi: number): IntVar {
        const ret = new IntVar(this.variables.length, lo, hi);
        this.variables.push(ret);
        this.isAnswerKey.push(false);
        return ret;
    }

    boolArray(shape: number[]): ExprArray {
        const size = arraySize(shape);
        let content = [];
        for (let i = 0; i < size; ++i) {
            content.push(this.boolVar());
        }
        return new ExprArray(shape, content);
    }

    intArray(shape: number[], lo: number, hi: number): ExprArray {
        const size = arraySize(shape);
        let content = [];
        for (let i = 0; i < size; ++i) {
            content.push(this.intVar(lo, hi));
        }
        return new ExprArray(shape, content);
    }

    ensure(...constraint: (Expr | ExprArray | Expr[] | ExprArray[])[]) {
        for (let i = 0; i < constraint.length; ++i) {
            const c = constraint[i];
            if (c instanceof Expr) {
                this.constraints.push(c);
            } else if (c instanceof Array) {
                this.ensure(c);
            } else {
                for (let j = 0; j < c.content.length; ++j) {
                    this.constraints.push(c.content[j]);
                }
            }
        }
    }

    addAnswerKey(...variables: (BoolVar | IntVar | BoolVar[] | IntVar[] | ExprArray)[]) {
        for (let i = 0; i < variables.length; ++i) {
            const c = variables[i];
            if (c instanceof ExprArray) {
                for (let j = 0; j < c.content.length; ++j) {
                    let e = c.content[j];
                    if (e instanceof BoolVar || e instanceof IntVar) {
                        this.isAnswerKey[e.id] = true;
                    } else {
                        throw TypeError();
                    }
                }
            } else if (c instanceof BoolVar || c instanceof IntVar) {
                this.isAnswerKey[c.id] = true;
            } else {
                this.addAnswerKey(c);
            }
        }
    }

    findAnswer(): boolean {
        let solver = getCSugarSolver(this);
        let ans = solver.findAnswer();

        if (!ans['is_sat']) {
            return false;
        }
        for (let i = 0; i < this.variables.length; ++i) {
            this.variables[i].assignment = ans[this.variables[i].name];
        }
        return true;
    }

    solve(): boolean {
        let solver = getCSugarSolver(this);
        let answerKeys = [];
        for (let i = 0; i < this.variables.length; ++i) {
            if (this.isAnswerKey[i]) answerKeys.push(this.variables[i].name);
        }
        let ans = solver.solve(answerKeys);

        if (!ans['is_sat']) {
            return false;
        }
        for (let i = 0; i < this.variables.length; ++i) {
            let v = this.variables[i];
            if (v.name in ans) {
                v.assignment = ans[v.name];
            } else {
                v.assignment = null;
            }
        }
        return true;
    }
}

function getCSugarSolver(solver: Solver): CSugarSolver {
    let ret = new CSugarSolver();
    for (let i = 0; i < solver.variables.length; ++i) {
        ret.add(stringifyVariable(solver.variables[i]));
    }
    for (let i = 0; i < solver.constraints.length; ++i) {
        ret.add(stringifyExpr(solver.constraints[i]));
    }
    return ret;
}
