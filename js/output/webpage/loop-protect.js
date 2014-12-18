window.LoopProtector = function(callback) {
	this.callback = callback || function() {};
	this.branchStartTime = 0;
	this.loopBreak = esprima.parse("KAInfiniteLoopProtect()").body[0];
    this.KAInfiniteLoopProtect = this._KAInfiniteLoopProtect.bind(this);
};

window.LoopProtector.prototype = {
	// Make sure to attach this function to the global scope
	_KAInfiniteLoopProtect: function() {
        var now = new Date().getTime();
        if (!this.branchStartTime) {
            this.branchStartTime = now;
            setTimeout(function() {
                this.branchStartTime = 0;
            }.bind(this), 0);
        } else if (now - this.branchStartTime > 200) {
        	this.callback();
            throw "KA_INFINITE_LOOP";
        }
    },

    riskyStatements: [
        "DoWhileStatement",
        "WhileStatement",
        "ForStatement",
        "FunctionExpression",
        "FunctionDeclaration"
    ],

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

	protect: function(ast, callback) {
		callback = callback || function() {};

		if (_.isString(ast)) {
        	var ast = esprima.parse(ast);
		}
        this.protectAst(ast);
        text = escodegen.generate(ast);
        return text;
	}
};