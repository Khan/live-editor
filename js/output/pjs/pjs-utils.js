window.PJSUtils = {
    /**
     * Returns code contained within a function.
     *
     * @param {Function} func
     * @returns {string}
     */
    codeFromFunction(func) {
        var code = func.toString();
        code = code.substr(code.indexOf("{") + 1);
        return code.substr(0, code.length - 1);
    },

    /**
     * Removes excess indentation from code.
     *
     * @param {string} code
     * @returns {string}
     */
    cleanupCode(code) {
        var lines = code.split("\n").filter(function(line) {
            return line !== "";
        });

        var indent = lines[0].length - lines[0].trim().length;

        return lines.map(function(line) {
            return line.substring(indent);
        }).join("\n").trim();
    },

    /**
     * Extracts a function's source code from the learner's code
     *
     * @param {Array} codeLines: an array containing each line of user code as an element
     * @param {Object} nodeLocation: an esprima location object
     * @returns {string}
     */
    getFunctionSource(codeLines, { start, end }) {
        const lines = codeLines.slice(start.line - 1, end.line);
        if (lines.length > 1) {
            lines[0] = lines[0].slice(start.column);
            lines[lines.length - 1] = lines[lines.length - 1].slice(0, end.column);
        } else {
            lines[0] = lines[0].slice(start.column, end.column);
         }
        return lines.join("\n");
    }
};
