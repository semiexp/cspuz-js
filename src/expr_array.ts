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

function toLinearIndex(shape: number[], position: number[]): number {
    let ret = 0;
    for (let i = 0; i < shape.length; ++i) {
        ret = ret * shape[i] + position[i];
    }
    return ret;
}

function toPosition(shape: number[], index: number): number[] {
    let ret = [];
    let v = index;
    for (let i = shape.length - 1; i >= 0; --i) {
        const p = v % shape[i];
        ret.push(p);
        v = (v - p) / shape[i];
    }
    ret.reverse();
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

    reshape(newShape: number[]): ExprArray {
        if (this.content.length != arraySize(newShape)) {
            new Error("reshaping into array of different size");
        }
        return new ExprArray(newShape, this.content);
    }

    at(...index: number[]) {
        if (this.shape.length != index.length) {
            throw Error("the number of indexing arguments must be equal to the number of dimension")
        }
        for (let i = 0; i < this.shape.length; ++i) {
            if (!(0 <= index[i] && index[i] < this.shape[i])) {
                throw Error("index " + index[i] + " is out of bounds for the axis with size " + this.shape[i]);
            }
        }
        return this.content[toLinearIndex(this.shape, index)];
    }

    convolution(op: Op, ...kernelSize: number[]) {
        if (this.shape.length != kernelSize.length) {
            throw Error("the number of kernelSize must be equal to the number of dimension");
        }

        const kernelSizeProduct = arraySize(kernelSize);
        if (op === Op.Add || op === Op.And || op === Op.Or) {
            // ok
        } else if (op === Op.Eq || op === Op.Ne || op === Op.Iff || op === Op.Xor) {
            if (kernelSizeProduct > 2) {
                throw Error("for binary operators, convolution kernel size must be 2");
            }
        } else {
            throw Error("unsupported convolution operator");
        }

        let resShape = [];
        for (let i = 0; i < this.shape.length; ++i) {
            if (!(1 <= kernelSize[i] && kernelSize[i] <= this.shape[i])) {
                throw Error("invalid kernel size: " + kernelSize[i]);
            }
            resShape.push(this.shape[i] - kernelSize[i] + 1);
        }

        let contents = [];
        let n = arraySize(resShape);

        for (let i = 0; i < n; ++i) {
            let basePos = toPosition(resShape, i);
            let operands = [];
            for (let j = 0; j < kernelSizeProduct; ++j) {
                let offset = toPosition(kernelSize, j);
                let pos = [];
                for (let k = 0; k < this.shape.length; ++k) {
                    pos.push(basePos[k] + offset[k]);
                }
                operands.push(this.at(...pos));
            }
            contents.push(new Expr(op, operands));
        }

        return new ExprArray(resShape, contents);
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
    countTrue(): Expr {
        let operands = [];
        for (let i = 0; i < this.content.length; ++i) operands.push(this.content[i].countTrue());
        return new Expr(Op.Add, operands);
    }
};
