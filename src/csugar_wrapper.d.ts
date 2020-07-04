declare export class CSugarSolver {
    solver: any;
    constructor();
    add(expr: string);
    findAnswer(): {[key: string]: (int | boolean)};
    solve(answerKeys: string[]): {[key: string]: (int | boolean)};
};
