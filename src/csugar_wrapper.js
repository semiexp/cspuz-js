import Module from './csugar.js'

let csugarModule = null;

Module().then(function(mod) {
    csugarModule = mod;
});

export class CSugarSolver {
    constructor() {
        this.solver = new csugarModule.CSugarSolver();
    }

    add(expr) {
        this.solver.Add(expr);
    }

    findAnswer() {
        return this.solver.FindAnswer();
    }

    solve(answerKeys) {
        return this.solver.Solve(answerKeys);
    }
};
