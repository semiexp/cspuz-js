import {Expr, BoolExpr, IntExpr, BoolConstant, IntConstant} from './expr'
import {ExprArray, sameShape, arraySize} from './expr_array'

export enum Op {
    VarBool,
    VarInt,
    ConstantBool,
    ConstantInt,
    Neg,
    Add,
    Sub,
    Eq,
    Ne,
    Le,
    Lt,
    Ge,
    Gt,
    Not,
    And,
    Or,
    Iff,
    Xor,
    Imp,
    Ite,
    Alldiff,
    GraphActiveVerticesConnected
}

export type OperandType = Expr | ExprArray | number | boolean;
export type NodeType = Expr | ExprArray;

export function doOperation(op: Op, operands: OperandType[]): (Expr | ExprArray) {
    let operable_operands: (Expr | ExprArray)[] = [];
    for (let i = 0; i < operands.length; ++i) {
        let operand = operands[i];
        if (operand instanceof Expr || operand instanceof ExprArray) {
            operable_operands.push(operand);
        } else if (typeof operand === "number") {
            operable_operands.push(new IntConstant(operand));
        } else {
            operable_operands.push(new BoolConstant(operand));
        }
    }
    // TODO: type checking


    // shape checking
    let shape: null | number[] = null;

    for (let i = 0; i < operable_operands.length; ++i) {
        let operand = operable_operands[i];
        if (operand instanceof ExprArray) {
            if (shape === null) {
                shape = operand.shape;
            } else if (!sameShape(shape, operand.shape)) {
                throw Error("operands have non-uniform shapes");
            }
        }
    }

    if (shape === null) {
        if (op == Op.Neg || op == Op.Add || op == Op.Sub || op == Op.Ite) {
            return new IntExpr(op, operable_operands as Expr[]);
        } else {
            return new BoolExpr(op, operable_operands as Expr[]);
        }
    } else {
        const size = arraySize(shape);
        let res = [];

        for (let i = 0; i < size; ++i) {
            let operands = [];
            for (let j = 0; j < operable_operands.length; ++j) {
                let operand = operable_operands[j];
                if (operand instanceof ExprArray) {
                    operands.push(operand.content[i]);
                } else {
                    operands.push(operand);
                }
            }
            if (op == Op.Neg || op == Op.Add || op == Op.Sub || op == Op.Ite) {
                res.push(new IntExpr(op, operands));
            } else {
                res.push(new BoolExpr(op, operands));
            }
        }
        return new ExprArray(shape, res);
    }
}

export function countTrue(operands: Expr | ExprArray | Expr[]): Expr {
    if (operands instanceof Expr || operands instanceof ExprArray) {
        return operands.countTrue();
    } else {
        return new ExprArray([operands.length], operands).countTrue();
    }
}
