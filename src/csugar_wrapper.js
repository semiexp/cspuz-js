import Module from './csugar.js'
import Worker from './csugar_worker.js'

let csugarModule = null;
let csugarWorker = null;

Module().then(function(mod) {
    csugarModule = mod;
});

function initializeWorker() {
    if (csugarWorker) return;
    csugarWorker = new Worker();
}

initializeWorker();

export class CSugarSolver {
    constructor() {
        this.exprs = [];
    }

    add(expr) {
        this.exprs.push(expr);
    }

    findAnswer() {
        let solver = new csugarModule.CSugarSolver();
        for (let i = 0; i < this.exprs.length; ++i) {
            solver.Add(this.exprs[i]);
        }
        return solver.FindAnswer();
    }

    solve(answerKeys) {
        let solver = new csugarModule.CSugarSolver();
        for (let i = 0; i < this.exprs.length; ++i) {
            solver.Add(this.exprs[i]);
        }
        return solver.Solve(answerKeys);
    }

    solveAsync(answerKeys, handler) {
        initializeWorker();
        csugarWorker.onmessage = event => handler(event);
        csugarWorker.postMessage({
            exprs: this.exprs,
            answerKeys: answerKeys
        });
    }
};
