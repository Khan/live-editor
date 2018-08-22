/**
 * Creates a new LoopProtector object.
 *
 * @param callback: called whenever a loop takes more than <timeout>ms to complete.
 * @param timeouts: an object containing initialTimeout and frameTimeout used
 *                  to control how long before the loop protector is triggered
 *                  on initial run during draw functions (or when responding to
 *                  user events)
 * @param reportLocation: true if the location of the long running loop should be
 *                        passed to the callback. TODO(kevinb) use this for webpages
 * @constructor
 */
window.LoopProtector = function(callback, timeouts, reportLocation) {
    this.callback = callback || function () { };
    this.timeout = 200;
    this.branchStartTime = 0;
    this.loopCounts = {};
    this.reportLocation = reportLocation;

    this.loopBreak = esprima.parse("KAInfiniteLoopProtect()").body[0];

    if (timeouts) {
        this.mainTimeout = timeouts.initialTimeout;
        this.asyncTimeout = timeouts.frameTimeout;
    }

    this.KAInfiniteLoopProtect = this._KAInfiniteLoopProtect.bind(this);
    this.KAInfiniteLoopSetTimeout = this._KAInfiniteLoopSetTimeout.bind(this);

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            this.visible = true;
            this.branchStartTime = 0;
        } else {
            this.visible = false;
        }
    });

    this.visible = !document.hidden;
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
    _KAInfiniteLoopProtect: function (location) {
        if (location) {
            if (!this.loopCounts[location]) {
                this.loopCounts[location] = 0;
            }
            this.loopCounts[location] += 1;
        }
        let error;
        const now = new Date().getTime();
        if (!this.branchStartTime) {
            this.branchStartTime = now;
            setTimeout(function () {
                this.branchStartTime = 0;
            }.bind(this), 0);
        } else if (now - this.branchStartTime > this.timeout) {
            if (this.visible) {
                if (!this.reportLocation) {
                    error = new Error("KA_INFINITE_LOOP");
                    this.callback(error);
                    throw error;
                }

                // Determine which of KAInfiniteLoopProtect's callsites has
                // the most calls.
                let max = 0;            // current max count
                let hotLocation = null; // callsite with most calls
                Object.keys(this.loopCounts).forEach(location => {
                    if (this.loopCounts[location] > max) {
                        max = this.loopCounts[location];
                        hotLocation = location;
                    }
                });

                hotLocation = JSON.parse(hotLocation);

                error = {
                    infiniteLoopNodeType: hotLocation.type,
                    row: hotLocation.loc.start.line - 1 // ace uses 0-indexed rows
                };

                this.callback(error);

                // We throw here to interrupt communication but also to
                throw error;
            }
        }
    },

    _KAInfiniteLoopSetTimeout: function (timeout) {
        this.timeout = timeout;
        this.branchStartTime = 0;
    },

    riskyStatements: [
        "DoWhileStatement",
        "WhileStatement",
        "ForStatement",
        "FunctionExpression",
        "FunctionDeclaration"
    ],

    // Called by walkAST whenever it leaves a node so AST mutations are okay
    leave(node) {
        const b = window.ASTBuilder;

        if (this.riskyStatements.indexOf(node.type) !== -1) {
            if (this.reportLocation) {
                const location = {
                    type: node.type,
                    loc: node.loc
                };

                // Inserts the following code at the start of riskt statements:
                //
                // KAInfiniteLoopCount++;
                // if (KAInfiniteLoopCount > 1000) {
                //     KAInfiniteLoopProtect();
                //     KAInfiniteLoopCount = 0;
                // }
                node.body.body.unshift(
                    b.IfStatement(
                        b.BinaryExpression(
                            b.Identifier("KAInfiniteLoopCount"),
                            ">",
                            b.Literal(1000)
                        ),
                        b.BlockStatement([
                            b.ExpressionStatement(b.CallExpression(
                                b.Identifier("KAInfiniteLoopProtect"),
                                [b.Literal(JSON.stringify(location))]
                            )),
                            b.ExpressionStatement(b.AssignmentExpression(
                                b.Identifier("KAInfiniteLoopCount"),
                                "=",
                                b.Literal(0)
                            ))
                        ])
                    )
                );
                node.body.body.unshift(
                    b.ExpressionStatement(b.UpdateExpression(
                        b.Identifier("KAInfiniteLoopCount"), "++", false))
                );
            } else {
                node.body.body.unshift(this.loopBreak);
            }
        }

        if (node.type === "Program") {
            // Many pjs programs take a while to start up because they're generating
            // terrain or textures or whatever.  Instead of complaining about all of
            // those programs taking too long, we allow the main program body to take
            // a little longer to run.  We call KAInfiniteLoopSetTimeout and set
            // the timeout to mainTimeout just to reset the value when the program
            // is re-run.
            if (this.mainTimeout) {
                node.body.unshift(
                    b.ExpressionStatement(b.CallExpression(
                        b.Identifier("KAInfiniteLoopSetTimeout"),
                        [b.Literal(this.mainTimeout)]
                    ))
                );
            }

            // Any asynchronous calls such as mouseClicked() or calls to draw()
            // should take much less time so that the app (and the browser) remain
            // responsive as the app is running so we call KAInfiniteLoopSetTimeout
            // at the end of main and set timeout to be asyncTimeout
            if (this.asyncTimeout) {
                node.body.push(
                    b.ExpressionStatement(b.CallExpression(
                        b.Identifier("KAInfiniteLoopSetTimeout"),
                        [b.Literal(this.asyncTimeout)]
                    ))
                );
            }
        }
    },

    // Convenience method used by webpage-output.js
    protect: function (code) {
        const ast = esprima.parse(code, { loc: true });

        walkAST(ast, null, [this]);

        return escodegen.generate(ast);
    }
};
