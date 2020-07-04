import {Op, OperandType, NodeType, doOperation} from './ops'

export class Expr {
    kind: Op;
    operands: Expr[];

    constructor(kind: Op, operands: Expr[]) {
        this.kind = kind;
        this.operands = operands;
    }

    neg(): Expr {
        return new Expr(Op.Neg, [this]);
    }
    add(other: OperandType): NodeType {
        return doOperation(Op.Add, [this, other]);
    }
    sub(other: OperandType): NodeType {
        return doOperation(Op.Sub, [this, other]);
    }
    eq(other: OperandType): NodeType {
        return doOperation(Op.Eq, [this, other]);
    }
    ne(other: OperandType): NodeType {
        return doOperation(Op.Ne, [this, other]);
    }
    le(other: OperandType): NodeType {
        return doOperation(Op.Le, [this, other]);
    }
    lt(other: OperandType): NodeType {
        return doOperation(Op.Lt, [this, other]);
    }
    ge(other: OperandType): NodeType {
        return doOperation(Op.Ge, [this, other]);
    }
    gt(other: OperandType): NodeType {
        return doOperation(Op.Gt, [this, other]);
    }
    not(): Expr {
        return new Expr(Op.Not, [this]);
    }
    and(other: OperandType): NodeType {
        return doOperation(Op.And, [this, other]);
    }
    or(other: OperandType): NodeType {
        return doOperation(Op.Or, [this, other]);
    }
    iff(other: OperandType): NodeType {
        return doOperation(Op.Iff, [this, other]);
    }
    xor(other: OperandType): NodeType {
        return doOperation(Op.Xor, [this, other]);
    }
    imp(other: OperandType): NodeType {
        return doOperation(Op.Imp, [this, other]);
    }
    ite(other: OperandType): NodeType {
        return doOperation(Op.Ite, [this, other]);
    }
}

export class BoolExpr extends Expr {
    constructor(kind: Op, operands: Expr[]) {
        super(kind, operands);
    }
}

export class IntExpr extends Expr {
    constructor(kind: Op, operands: Expr[]) {
        super(kind, operands);
    }
}

export class BoolConstant extends BoolExpr {
    value: boolean;
    constructor(value: boolean) {
        super(Op.ConstantBool, []);
        this.value = value;
    }
}

export class IntConstant extends IntExpr {
    value: number;
    constructor(value: number) {
        super(Op.ConstantInt, []);
        this.value = value;
    }
}

export class BoolVar extends BoolExpr {
    id: number;
    assignment: boolean | null;
    constructor(id: number) {
        super(Op.VarBool, []);
        this.id = id;
        this.assignment = null;
    }

    get name(): string {
        return 'b' + this.id;
    }
}

export class IntVar extends IntExpr {
    id: number;
    lo: number;
    hi: number;
    assignment: number | null;
    constructor(id: number, lo: number, hi: number) {
        super(Op.VarInt, []);
        this.id = id;
        this.lo = lo;
        this.hi = hi;
        this.assignment = null;
    }

    get name(): string {
        return 'b' + this.id;
    }
}

