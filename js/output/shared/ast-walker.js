/**
 * Traverses an AST and calls visitor methods on each of the visitors.
 *
 * @param node: The root of the AST to walk.
 * @param path: An array containing all of the ancestors and the current node.
 *              Callers should pass in null.
 * @param visitors: One or more objects containing 'enter' and/or 'leave'
 *                  methods which accept a single AST node as an argument.
 */
window.walkAST = function(node, path, visitors) {
    if (path === null) {
        path = [node];
    } else {
        path.push(node);
    }
    visitors.forEach(visitor => {
        if (visitor.enter) {
            visitor.enter(node, path);
        }
    });
    for (let prop of Object.keys(node)) {
        if (node.hasOwnProperty(prop) && node[prop] instanceof Object) {
            if (Array.isArray(node[prop])) {
                node[prop].forEach(child => walkAST(child, path, visitors));
            } else if (node[prop].type) { // don't walk metadata props like "loc"
                walkAST(node[prop], path, visitors);
            }
        }
    }
    visitors.forEach(visitor => {
        if (visitor.leave) {
            visitor.leave(node, path);
        }
    });
    path.pop();
};
