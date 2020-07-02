import {Expr} from './expr'
import {Op, OperandType, doOperation} from './ops'

export function sameShape(shape1: number[], shape2: number[]): boolean {
    if (shape1.length != shape2.length) return false;
    for (let i = 0; i < shape1.length; ++i) {
        if (shape1[i] != shape2[i]) return false;
    }
    return true;
}

export function arraySize(shape: number[]): number {
    let ret = 1;
    for (let i = 0; i < shape.length; ++i) ret *= shape[i];
    return ret;
}

export class ExprArray {
    shape: number[];
    content: Expr[];

    constructor(shape: number[], content: Expr[]) {
        this.shape = shape;
        this.content = content;
    }

    getShape(): number[] { 
        return this.shape;
    }

    at(...index: number[]) {
        if (this.shape.length != index.length) {
            throw Error("the number of indexing arguments is different from the number of dimension")
        }
        for (let i = 0; i < this.shape.length; ++i) {
            if (!(0 <= index[i] && index[i] < this.shape[i])) {
                throw Error("index " + index[i] + " is out of bounds for the axis with size " + this.shape[i]);
            }
        }
        let pos = 0;
        for (let i = 0; i < this.shape.length; ++i) {
            pos *= this.shape[i];
            pos += index[i];
        }
        return this.content[pos];
    }

    neg(): ExprArray {
        return doOperation(Op.Neg, [this]) as ExprArray;
    }
    add(other: OperandType): ExprArray {
        return doOperation(Op.Add, [this, other]) as ExprArray;
    }
    sub(other: OperandType): ExprArray {
        return doOperation(Op.Sub, [this, other]) as ExprArray;
    }
    eq(other: OperandType): ExprArray {
        return doOperation(Op.Eq, [this, other]) as ExprArray;
    }
    ne(other: OperandType): ExprArray {
        return doOperation(Op.Ne, [this, other]) as ExprArray;
    }
    le(other: OperandType): ExprArray {
        return doOperation(Op.Le, [this, other]) as ExprArray;
    }
    lt(other: OperandType): ExprArray {
        return doOperation(Op.Lt, [this, other]) as ExprArray;
    }
    ge(other: OperandType): ExprArray {
        return doOperation(Op.Ge, [this, other]) as ExprArray;
    }
    gt(other: OperandType): ExprArray {
        return doOperation(Op.Gt, [this, other]) as ExprArray;
    }
    not(): ExprArray {
        return doOperation(Op.Not, [this]) as ExprArray;
    }
    and(other: OperandType): ExprArray {
        return doOperation(Op.And, [this, other]) as ExprArray;
    }
    or(other: OperandType): ExprArray {
        return doOperation(Op.Or, [this, other]) as ExprArray;
    }
    iff(other: OperandType): ExprArray {
        return doOperation(Op.Iff, [this, other]) as ExprArray;
    }
    xor(other: OperandType): ExprArray {
        return doOperation(Op.Xor, [this, other]) as ExprArray;
    }
    imp(other: OperandType): ExprArray {
        return doOperation(Op.Imp, [this, other]) as ExprArray;
    }
    ite(other: OperandType): ExprArray {
        return doOperation(Op.Ite, [this, other]) as ExprArray;
    }
};
