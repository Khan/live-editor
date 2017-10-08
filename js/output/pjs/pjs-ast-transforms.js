window.ASTTransforms = {};

let b = window.ASTBuilder;

/**
 * Visitor object which adds line and column information as additional args,
 * e.g. Program.assertEqual(a, b) => Program.assertEqual(a, b, <line>, <column>)
 * where <line> and <column> are number literals.
 */
ASTTransforms.rewriteAssertEquals = {
    leave(node, path) {
        if (node.type === "Identifier" && node.name === "Program") {
            let parent = path[path.length - 2];
            if (parent.type === "MemberExpression" &&
                parent.object === node &&
                parent.property.type === "Identifier" &&
                parent.property.name === "assertEqual") {

                let grandparent = path[path.length - 3];
                if (grandparent.type === "CallExpression") {
                    grandparent.arguments.push(
                        b.Literal(grandparent.loc.start.line),
                        b.Literal(grandparent.loc.start.column)
                    );
                }
            }
        }
    }
};

var isReference = function(node, parent) {
    // we're a property key so we aren't referenced
    if (parent.type === "Property" && parent.key === node) {
        return false;
    }

    // we're a variable declarator id so we aren't referenced
    if (parent.type === "VariableDeclarator" && parent.id === node) {
        return false;
    }

    var isMemberExpression = parent.type === "MemberExpression";

    // we're in a member expression and we're the computed property so we're referenced
    var isComputedProperty = isMemberExpression && parent.property === node && parent.computed;

    // we're in a member expression and we're the object so we're referenced
    var isObject = isMemberExpression && parent.object === node;

    // we are referenced
    return !isMemberExpression || isComputedProperty || isObject;
};


let drawLoopMethods = ["draw", "mouseClicked", "mouseDragged", "mouseMoved",
    "mousePressed", "mouseReleased", "mouseScrolled", "mouseOver",
    "mouseOut", "touchStart", "touchEnd", "touchMove", "touchCancel",
    "keyPressed", "keyReleased", "keyTyped"];

let scopes = [{}];

/**
 * Returns a visitor object that will rewrite all global variable references to
 * be references to properties on an object identified by envName.
 *
 * e.g. fill(200,124,93) => __env__19283123.fill(200,124,93)
 *
 * @param {string} envName
 * @returns {Object}
 */
ASTTransforms.rewriteContextVariables = function(envName, context) {
    return {
        enter(node, path) {
            // Create a new scope whenever we encounter a function declaration/expression
            // and add all of its paramters to this new scope.
            if (/^Function/.test(node.type)) {
                let scope = {};
                node.params.forEach(param => {
                    scope[param.name] = true;
                });
                scopes.push(scope);
            }
            // Add any variables declared to the current scope.  This handles
            // variable declarations with multiple declarators, e.g. var x = 5, y = 10;
            // because we are handling all of the declarators directly (as opposed
            // to iterating over node.declarators when node.type === "VariableDeclaration").
            if (node.type === "VariableDeclarator") {
                let scope = scopes[scopes.length - 1];
                scope[node.id.name] = true;
            }
        },
        leave(node, path) {
            var parent = path[path.length - 2];

            if (node.type === "Identifier") {
                if (isReference(node, parent)) {
                    let scopeIndex = -1;
                    for (let i = scopes.length - 1; i > -1; i--) {
                        if (scopes[i][node.name]) {
                            scopeIndex = i;
                            break;
                        }
                    }

                    // Don't rewrite function parameters.
                    let isParam = /^Function/.test(parent.type) && parent.params.includes(node);
                    if (isParam) {
                        return;
                    }

                    // Don't catch clause parameters.
                    if (parent.type === "CatchClause") {
                        return;
                    }

                    // These values show up a Identifiers in the AST.  We don't
                    // want to prefix them so return.
                    if (["undefined", "Infinity", "NaN", "arguments"].includes(node.name)) {
                        return;
                    }

                    // Prefix identifiers that exist in the context object and
                    // have not been defined in any scope.
                    // Also, prefix any other identifers that
                    // exist at the global scope.
                    if ((node.name in context && scopeIndex === -1) ||
                            scopeIndex === 0) {
                        return b.MemberExpression(
                            b.Identifier(envName), b.Identifier(node.name));
                    }
                }
            } else if (node.type === "VariableDeclaration") {
                if (node.declarations.length === 1) {
                    // Single VariableDeclarators

                    let decl = node.declarations[0];

                    // If the current variable declaration has an "init" value of null
                    //  (IE. no init value given to parser), and the current node type
                    //  doesn't match "ForInStatement" (a for-in loop), exit the
                    //  function.
                    if (decl.init === null && parent.type !== "ForInStatement") {
                        return;
                    }

                    // Rewrite all function declarations, e.g.
                    // var foo = function () {} => __env__.foo = function () {}
                    // that appear in the global scope. Draw loop methods aren't
                    // special, they should be treated in the exact same way.
                    if (scopes.length === 1) {
                        if (["Program", "BlockStatement", "SwitchCase"].includes(parent.type)) {
                            return b.ExpressionStatement(
                                b.AssignmentExpression(
                                    b.MemberExpression(
                                        b.Identifier(envName),
                                        b.Identifier(decl.id.name)),
                                    "=",
                                    decl.init
                                )
                            );
                        } else {
                            if (["ForStatement"].includes(parent.type)) {
                                // Handle variables declared inside a 'for' statement
                                // occurring in the global scope.
                                //
                                // e.g. for (var i = 0; i < 10; i++) { ... } =>
                                //      for (__env__.i = 0; __env__.i < 10; __env__.i++)
                                return b.AssignmentExpression(
                                    b.MemberExpression(b.Identifier(envName),b.Identifier(decl.id.name)),
                                    "=",
                                    decl.init
                                );
                            } else if (["ForInStatement"].includes(parent.type)) {
                                // Handle variables declared inside a 'for in' statement,
                                //  occuring in the global scope.
                                // Example:
                                //  for (var i in obj) { ... }
                                //  for (__env__.i in __env__.obj) { ... }
                                return b.MemberExpression(b.Identifier(envName), b.Identifier(decl.id.name));
                            }
                        }
                    }
                } else {
                    // Multiple VariableDeclarators

                    if (scopes.length === 1) {

                        if (["Program", "BlockStatement"].includes(parent.type)) {
                            // Before: var x = 5, y = 10, z;
                            // After: __env__.x = 5; __env__.y = 10;
                            return node.declarations
                                .filter(decl => decl.init !== null)
                                .map(decl => b.ExpressionStatement(
                                    b.AssignmentExpression(
                                        b.MemberExpression(b.Identifier(envName),b.Identifier(decl.id.name)),
                                        "=",
                                        decl.init
                                    )
                                ));
                        } else {
                            // Before: for (var i = 0, j = 0; i * j < 100; i++, j++) { ... }
                            // After: for (__env__.i = 0, __env__.j = 0; __env__.i * __env__.j < 100; ...) { ... }
                            return {
                                type: "SequenceExpression",
                                expressions: node.declarations
                                    .filter(decl => decl.init !== null)
                                    .map(decl => {
                                        return b.AssignmentExpression(
                                            b.MemberExpression(b.Identifier(envName),b.Identifier(decl.id.name)),
                                            "=",
                                            decl.init
                                        );
                                    })
                            };
                        }

                    } else if (node.declarations.some(decl => drawLoopMethods.includes(decl.id.name))) {
                        // this is super edge case, it handles things that look like
                        // var draw = function() {
                        //     var x = 5, mouseClicked = function () { ... }, y = 10;
                        // };
                        // It should convert them to something like this:
                        // __env__.draw = function() {
                        //     var x = 5;
                        //     var mouseClicked = function () { ... };
                        //     var y = 10;
                        // };

                        return node.declarations
                            .filter(decl => decl.init !== null)
                            .map(decl => {
                                return b.VariableDeclaration([decl], node.kind);
                            });
                    }
                }

            } else if (/^Function/.test(node.type)) {
                // Remove all local variables from the scopes stack as we exit
                // the function expression/declaration.
                scopes.pop();
            }
        }
    };
};

ASTTransforms.checkForBannedProps = function(bannedProps) {
    return {
        leave(node, path) {
            if (node.type === "Identifier" && bannedProps.includes(node.name)) {
                throw {
                    row: node.loc.start.line - 1,
                    html: `Use of <code>${node.name}</code> as an identifier is prohibited.`
                };
            }
        }
    };
};

/**
 * Searches for strings containing the name of any image or sound we provide for
 * users and adds them to `resources` as a key.
 *
 * @param {Object} resources An empty Object.
 * @returns {Object} An AST Visitor.
 */
ASTTransforms.findResources = function(resources) {
    return {
        leave(node, path) {
            if (node.type === "Literal" && typeof(node.value) === "string") {

                AllImages.forEach(group => {
                    group.images.forEach(image => {
                        if (node.value.indexOf(image) !== -1) {
                            resources[`${group.groupName}/${image}.png`] = true;
                        }
                    });
                });

                OutputSounds.forEach(cls => {
                    cls.groups.forEach(group => {
                        group.sounds.forEach(sound => {
                            if (node.value.indexOf(sound) !== -1) {
                                resources[`${group.groupName}/${sound}.mp3`] = true;
                            }
                        });
                    });
                });
            }
        }
    };
};

ASTTransforms.rewriteNewExpressions = function(envName) {
    return {
        leave(node, path) {
            if (node.type === "NewExpression") {
                const name = escodegen.generate(node.callee);

                return b.CallExpression(
                    b.CallExpression(
                        b.MemberExpression(
                            b.MemberExpression(
                                b.Identifier(envName),
                                b.Identifier("PJSOutput")
                            ),
                            b.Identifier("applyInstance")
                        ),
                        [
                            node.callee,
                            b.Literal(name)
                        ]
                    ),
                    node.arguments
                );
            }
        }
    }
};
