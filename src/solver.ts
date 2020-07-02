import {Expr, BoolVar, IntVar, BoolConstant, IntConstant} from './expr'
import {ExprArray, arraySize} from './expr_array'
import {Op} from './ops'

function stringifyExpr(expr: Expr): string {
    if (expr.kind == Op.ConstantBool || expr.kind == Op.ConstantInt) {
        return ((expr as (BoolConstant | IntConstant)).value).toString();
    } else if (expr.kind == Op.VarBool) {
        return "b" + (expr as BoolVar).id;
    } else if (expr.kind == Op.VarInt) {
        return "i" + (expr as IntVar).id;
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

    addConstraint(...constraint: (Expr | ExprArray | Expr[] | ExprArray[])[]) {
        for (let i = 0; i < constraint.length; ++i) {
            const c = constraint[i];
            if (c instanceof Expr) {
                this.constraints.push(c);
            } else if (c instanceof Array) {
                this.addConstraint(c);
            } else {
                for (let j = 0; j < c.content.length; ++j) {
                    this.constraints.push(c.content[j]);
                }
            }
        }
    }

    findAnswer() {
        // TODO
        for (let i = 0; i < this.constraints.length; ++i) {
            console.log(stringifyExpr(this.constraints[i]));
        }
    }
}
