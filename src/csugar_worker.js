import Module from './csugar.js'

let csugarModule = null;

self.onmessage = function (e) {
    const action = function () {
        let solver = new csugarModule.CSugarSolver();

        const exprs = e.data.exprs;
        for (let i = 0; i < exprs.length; ++i) {
            solver.Add(exprs[i]);
        }
    
        if (e.data.answerKeys) {
            // solve
            const answer = solver.Solve(e.data.answerKeys);
            self.postMessage(answer);
        } else {
            // findAnswer
            const answer = solver.FindAnswer();
            self.postMessage(answer);
        }
    };

    if (csugarModule) {
        action();
    } else {
        Module().then(function (mod) {
            csugarModule = mod;
            action();
        });
    }
};
