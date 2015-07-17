/**
 * Creates a new LoopProtector object.
 *
 * @param callback: called whenever a loop takes more than <timeout>ms to complete.
 * @param timeout: threshold time, default 200ms.
 * @param drawTimeout: treshold time to be used inside the draw loop, pjs only.
 * @constructor
 */
window.LoopProtector = function(callback, timeout, drawTimeout) {
    this.callback = callback || function () { };
    this.timeout = timeout || 200;
    this.drawTimeout = drawTimeout;
    this.branchStartTime = 0;
    this.loopBreak = esprima.parse("KAInfiniteLoopProtect()").body[0];
    this.drawLoopBreak = esprima.parse("KAInfiniteLoopProtect(true)").body[0];
    this.firstDrawLoop = true;
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
    _KAInfiniteLoopProtect: function (drawLoop) {
        var timeout = this.timeout;
        if (drawLoop) {
            // We append a synchronous call to draw() at the end of the program.
            // It would be better if we had separate loop protectors so that
            // the timer for the loop protector inside the draw loop could run
            // idenpendently with its own timeout.
            // TODO(kevinb) extract the protect method so it can use multiple instances of LoopProtector
            // TODO(kevinb) add parameter for location information from the AST
            // TODO(kevinb) count how many times each this is called for each location from the AST
            // TODO(kevinb) handle all async calls, e.g. mouseClicked, etc.
            if (this.firstDrawLoop) {
                this.firstDrawLoop = false;
            } else {
                timeout = this.drawTimeout;
            }
        }
        var now = new Date().getTime();
        if (!this.branchStartTime) {
            this.branchStartTime = now;
            setTimeout(function () {
                this.branchStartTime = 0;
            }.bind(this), 0);
        } else if (now - this.branchStartTime > timeout) {
            if (this.visible) {
                this.callback();
                throw new Error("KA_INFINITE_LOOP");   
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

    protect: function (code) {
        var ast = esprima.parse(code);
        estraverse.traverse(ast, {
            leave: (node, parent) => {
                if (this.riskyStatements.indexOf(node.type) !== -1) {
                    var loopBreak = this.loopBreak;
                    if (parent.type === "AssignmentExpression") {
                        if (parent.left.name === "draw") {
                            loopBreak = this.drawLoopBreak;
                        }
                    } else if (parent === "VariableDeclarator") {
                        if (parent.id.name === "draw") {
                            loopBreak = this.drawLoopBreak;
                        }
                    }
                    node.body.body.unshift(loopBreak);
                }
            }
        });
        return escodegen.generate(ast);
    }
};
