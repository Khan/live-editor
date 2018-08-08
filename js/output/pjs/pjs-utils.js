/* eslint-disable no-var */
/* TODO: Fix the lint errors */
const PJSUtils = {
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
    }
};

export default PJSUtils;