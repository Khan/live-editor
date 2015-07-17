/**
 * Creates a new LoopProtector object.
 *
 * @param callback: called whenever a loop takes more than <timeout>ms to complete.
 * @param timeout: threshold time, default 200ms.
 * @constructor
 */
window.LoopProtector = function(callback, timeout) {
    this.callback = callback || function () { };
    this.timeout = timeout || 200;
    this.branchStartTime = 0;
    this.loopBreak = esprima.parse("KAInfiniteLoopProtect()").body[0];
    this.KAInfiniteLoopProtect = this._KAInfiniteLoopProtect.bind(this);
    
    visibly.onVisible(function () {
        this.visible = true;
        this.branchStartTime = 0;
    }.bind(this));

    visibly.onHidden(function () {
        this.visible = false;
    }.bind(this));

    this.visible = !visibly.hidden();
};

window.LoopProtector.prototype = {
    /**
     * Throws 'KA_INFINITE_LOOP' if the difference between the current time
     * and this.brancStartTime is greater than this.timeout.
     * 
     * The difference grows as long as this method is called synchronously.  As
     * soon as the current execution stack completes and the browser grabs the
     * next task off the event queue this.branchStartTime will be reset by the
     * timeout.
     * 
     * In order to use this correctly, you must add a reference to this function
     * to the global scope where the user code is being run.  See the exec()
     * method in pjs-output.js for an example of how to do this.
     * 
     * @private
     */
    _KAInfiniteLoopProtect: function () {
        var now = new Date().getTime();
        if (!this.branchStartTime) {
            this.branchStartTime = now;
            setTimeout(function () {
                this.branchStartTime = 0;
            }.bind(this), 0);
        } else if (now - this.branchStartTime > this.timeout) {
            if (this.visible) {
                this.callback();
                // TODO(kevinb) throw an Error instance
                throw "KA_INFINITE_LOOP";   
            }
        }
    },

    riskyStatements: [
        "DoWhileStatement",
        "WhileStatement",
        "ForStatement",
        "FunctionExpression",
        "FunctionDeclaration"
    ],

    // TODO(kevinb) use estraverse to walk the tree
    protectAst: function(ast) {
        if (this.riskyStatements.indexOf(ast.type) !== -1) {
            ast.body.body.unshift(this.loopBreak);
        }
        for (var prop in ast) {
            if (ast.hasOwnProperty(prop) && _.isObject(ast[prop])) {
                if (_.isArray(ast[prop])) {
                    _.each(ast[prop], this.protectAst.bind(this));
                } else {
                    this.protectAst(ast[prop]);
                }
            }
        }
    },

    protect: function (code) {
        var ast = esprima.parse(code);
        this.protectAst(ast);
        return escodegen.generate(ast);
    }
};
