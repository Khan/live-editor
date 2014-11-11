/* simple tree walker for Parser API style AST trees */

function Walker() {
    this.shouldWalk = function (node) {
        return true;
    };
    this.enter = function (node) { };
    this.exit = function (node) { };
}

Walker.prototype.walk = function (node, name) {
    if (!node) {
        return; // TODO: proper validation
        // for now we assume that the AST is properly formed
    }
    if (this.shouldWalk(node, name)) {
        this.enter(node, name);
        this[node.type](node);
        this.exit(node, name);
    }
};

Walker.prototype.walkEach = function (nodes, name) {
    for (var i = 0; i < nodes.length; i++) {
        this.walk(nodes[i], name + "[" + i + "]");
    }
};

Walker.prototype.AssignmentExpression = function (node) {
    this.walk(node.left, "left");
    this.walk(node.right, "right");
};

Walker.prototype.ArrayExpression = function (node) {
    this.walkEach(node.elements, "elements");
};

Walker.prototype.BlockStatement = function (node) {
    this.walkEach(node.body, "body");
};

Walker.prototype.BinaryExpression = function (node) {
    this.walk(node.left, "left");
    this.walk(node.right, "left");
};

Walker.prototype.BreakStatement = function (node) {
    this.walk(node.label, "label");
};

Walker.prototype.CallExpression = function (node) {
    this.walk(node.callee, "callee");
    this.walkEach(node.arguments, "arguments");
};

Walker.prototype.CatchClause = function (node) {
    this.walk(node.param, "param");
    this.walk(node.guard, "guard");
    this.walk(node.body, "body");
};

Walker.prototype.ConditionalExpression = function (node) {
    this.walk(node.test, "test");
    this.walk(node.alternate, "alternate");
    this.walk(node.consequent, "consequent");
};

Walker.prototype.ContinueStatement = function (node) {
    this.walk(node.label, "label");
};

Walker.prototype.DoWhileStatement = function (node) {
    this.walk(node.body, "body");
    this.walk(node.test, "test");
};

Walker.prototype.DebuggerStatement = function (node) {

};

Walker.prototype.EmptyStatement = function (node) {

};

Walker.prototype.ExpressionStatement = function (node) {
    this.walk(node.expression, "expression");
};

Walker.prototype.ForStatement = function (node) {
    this.walk(node.init, "init");
    this.walk(node.test, "init");
    this.walk(node.update, "update");
    this.walk(node.body, "body");
};

Walker.prototype.ForInStatement = function (node) {
    this.walk(node.left, "left");
    this.walk(node.right, "right");
    this.walk(node.body, "body");
};

Walker.prototype.ForOfStatement = function (node) {
    this.walk(node.left, "left");
    this.walk(node.right, "right");
    this.walk(node.body, "body");
};

Walker.prototype.FunctionDeclaration = function (node) {
    this.walk(node.id, "id");
    this.walkEach(node.params, "params");
    this.walk(node.rest, "rest");
    this.walk(node.body, "body");
};

Walker.prototype.FunctionExpression = function (node) {
    this.walk(node.id, "id");
    this.walkEach(node.params, "params");
    this.walk(node.rest, "rest");
    this.walk(node.body, "body");
};

Walker.prototype.Identifier = function (node) {

};

Walker.prototype.IfStatement = function (node) {
    this.walk(node.text, "test");
    this.walk(node.consequent, "consequent");
    this.walk(node.alternate, "alternate");
};

Walker.prototype.Literal = function (node) {

};

Walker.prototype.LabeledStatement = function (node) {
    this.walk(node.body, "body");
};

Walker.prototype.LogicalExpression = function (node) {
    this.walk(node.left, "left");
    this.walk(node.right, "right");
};

Walker.prototype.MemberExpression = function (node) {
    this.walk(node.object, "object");
    this.walk(node.property, "property");
};

Walker.prototype.NewExpression = function (node) {
    this.walk(node.callee, "callee");
    this.walk(node.arguments, "arguments");
};

Walker.prototype.ObjectExpression = function (node) {
    this.walkEach(node.properties, "properties");
};

Walker.prototype.Program = function (node) {
    this.walkEach(node.body, "body");
};

Walker.prototype.Property = function (node) {
    this.walk(node.key, "key");
    this.walk(node.value, "value");
};

Walker.prototype.ReturnStatement = function (node) {
    this.walk(node.argument, "argument");
};

Walker.prototype.SequenceExpression = function (node) {
    this.walkEach(node.expressions, "expressions");
};

Walker.prototype.SwitchStatement = function (node) {
    this.walk(node.discriminant, "discriminant");
    this.walkEach(node.cases, "cases");
};

Walker.prototype.SwitchCase = function (node) {
    this.walk(node.test, "test");
    this.walkEach(node.consequent, "consequent");
};

Walker.prototype.ThisExpression = function (node) {

};

Walker.prototype.ThrowStatement = function (node) {
    this.walk(node.argument, "argument");
};

Walker.prototype.TryStatement = function (node) {
    this.walk(node.block, "block");
    this.walk(node.handler, "handler");
    this.walkEach(node.guardedHandlers, "guardedHandlers");
    this.walk(node.finalizer, "finalizer");
};

Walker.prototype.UnaryExpression = function (node) {
    this.walk(node.argument, "argument");
};

Walker.prototype.UpdateExpression = function (node) {
    this.walk(node.argument, "argument");
};

Walker.prototype.VariableDeclaration = function (node) {
    this.walkEach(node.declarations, "declarations");
};

Walker.prototype.VariableDeclarator = function (node) {
    this.walk(node.id, "id");
    this.walk(node.init, "init");
};

Walker.prototype.WhileStatement = function (node) {
    this.walk(node.test, "test");
    this.walk(node.body, "body");
};

Walker.prototype.WithStatement = function (node) {
    this.walk(node.object, "object");
    this.walk(node.body, "body");
};
