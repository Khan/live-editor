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
