/**
 * Traverses an AST and calls visitor methods on each of the visitors.
 * 
 * @param node: root of the AST to walk.
 * @param visitors: one or more objects containing 'enter' and/or 'leave' 
 *                  methods which accept a single AST node as an argument.
 */
window.walkAST = function(node, visitors) {
    visitors.forEach(visitor => {
        if (visitor.enter) {
            visitor.enter(node);
        }
    });
    for (let prop of Object.keys(node)) {
        if (node.hasOwnProperty(prop) && node[prop] instanceof Object) {
            if (Array.isArray(node[prop])) {
                node[prop].forEach(child => walkAST(child, visitors));
            } else if (node.type) { // don't walk metadata props like "loc"
                walkAST(node[prop], visitors);
            }
        }
    }
    visitors.forEach(visitor => {
        if (visitor.leave) {
            visitor.leave(node);
        }
    });
};
