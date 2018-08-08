
const parens = {
    "(": ")",
    "{": "}",
    "[": "]"
};

// Returns true if we're after an `=` assignment
export function isAfterAssignment(text) {
    return /(?:^|[^!=])=\s*$/.test(text);
}

// Returns true if we're inside an open parenthesis
export function isInParenthesis(text) {
    const parenStack = [];
    for (let i = 0; i < text.length; i++) {
        if (text[i] in parens) {
            parenStack.unshift(text[i]);
        } else if (parenStack && text[i] === parens[parenStack[0]]) {
            parenStack.shift();
        }
    }
    return parenStack.length > 0;
}

// Returns true if we're inside a comment
// This isn't a perfect check, but it is close enough.
export function isWithinComment(text) {
    // Comments typically start with a / or a * (for multiline C style)
    return text.length && (text[0] === "/" || text[0] === "*");
};

// This relies on the global RegExp storing the lastMatch,
// but we could also use exec and pass it along.
// Technically exec is said to be slower, however.
export function getInfoFromFileMatch(event) {
    const functionStart = event.col - RegExp.lastMatch.length;
    const paramsStart = functionStart + RegExp.$1.length;
    const pieces = /^(\s*)(["']?[^)]*?["']?)\s*(\);?|$)/.exec(event.line.slice(paramsStart));
    const leading = pieces[1];
    const pathStart = paramsStart + leading.length;
    const path = pieces[2];
    const closing = pieces[3];

    const shouldFill = (leading.length === 0 &&
            path.length === 0 &&
            closing.length === 0 &&
            event.source &&
            event.source.action === "insert" &&
            event.source.lines[0].length === 1);
    return {pathStart, functionStart, path, closing, shouldFill};
}