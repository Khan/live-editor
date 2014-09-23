/*
 * BabyHint does a line-by-line check for common beginner programming mistakes,
 * such as misspelling, missing spaces, missing commas, etc.  It is used in
 * conjunction with JSHINT to report errors to the user.
 *
 * Each error returned contains the members:
 * {
 *      row         :   the row at which the error was found
 *      column      :   the column at which the error was found
 *      text        :   the error messaage
 *      breaksCode  :   true if we actually want to prevent them from
 *                      doing this
 *                      (if false, will only display if JSHINT broke on
 *                      the same line)
 * }
 */

var BabyHint = {

    EDIT_DISTANCE_THRESHOLD: 2,

    // We'll get function names from the global context
    // non-function keywords go here
    keywords: [
    /* RESERVED WORDS */
        "break",
        "case",
        "catch",
        "continue",
        "default",
        "do",
        "else",
        "finally",
        "for",
        "function",
        "if",
        "in",
        "instanceof",
        "new",
        "return",
        "switch",
        "this",
        "throw",
        "try",
        "typeof",
        "var",
        "while",
    /* JAVASCRIPT OBJECT PROPERTIES AND FUNCTIONS */
    /* Omit those included in the global context */
        "charAt",
        "charCodeAt",
        "fromCharCode",
        "indexOf",
        "lastIndexOf",
        "length",
        "pop",
        "prototype",
        "push",
        "replace",
        "search",
        "shift",
        "slice",
        "substring",
        "toLowerCase",
        "toUpperCase",
        "unshift"
    ],

    // Expected number of parameters for known functions.
    // (Some functions can take multiple signatures)
    // We'll get most of these from the global context,
    // so these are just the overrides.
    functionParamCount: {
        "acos": 1,
        "asin": 1,
        "atan": 1,
        "atan2": 2,
        "background": [1, 3, 4],
        "beginShape": [0, 1],
        "bezier": 8,
        "bezierVertex": [6],
        "box": [1, 2, 3],
        "color": [1, 2, 3, 4],
        "colorMode": [1, 2, 4, 5],
        "createFont": [1, 2],
        "cos": 1,
        "curve": 8,
        "cursor": [0, 1, 2, 3],
        "endShape": [0, 1],
        "dist": 4,
        "fill": [1, 3, 4],
        "filter": [1, 2],
        "get": [2, 3, 4, 5],
        "image": [3, 5],
        "line": 4,
        "loadImage": [1, 3],
        "mag": [2, 3],
        "max": 2,
        "min": 2,
        "noise": [1, 2, 3],
        "PVector": [0, 2, 3],
        "random": [0, 1, 2],
        "RegExp": [1, 2],
        "rect": [4, 5],
        "scale": [1, 2],
        "set": [3, 4],
        "sin": 1,
        "stroke": [1, 3, 4],
        "tan": 1,
        "text": [3, 5],
        "textAlign": [1, 2],
        "textFont": [1, 2],
        "translate": [2, 3],
        "vertex": [2, 4]
    },

    // A mapping from function name to an example usage of the function
    // the titles of documentation programs
    functionFormSuggestion: {
        // forms that don't have documentation scratchpads
        // or weird formatting
        "function" : "var drawWinston = function() { ... };",
        "while" : "while (x < 20) { ... };"
    },

    // functions in the global context that we want
    // blacklisted because it's complicated...
    functionParamBlacklist: [
        "debug",
        "max",
        "min"
    ],

    // These properties can be used for malicious purposes
    // It's just a stop-gap measure, making it much harder
    bannedProperties: {
        location: true,
        document: true,
        ownerDocument: true,
        createElement: true
    },

    variables: [],
    errors: [],
    inComment: false,
    spellChecked: false,

    init: function(options) {
        // grab globals from Processing object
        for (var f in options.context) {
            if (typeof options.context[f] === "function") {
                BabyHint.keywords.push(f);
                if (!(f in BabyHint.functionParamCount) &&
                    !_.include(BabyHint.functionParamBlacklist, f)) {
                    BabyHint.functionParamCount[f] = options.context[f].length;
                }
            }
        }
    },

    initDocumentation: function(docTitles) {
        for (var i = 0; i < docTitles.length; i++) {
            var usage = docTitles[i];

            // kind of hacky, but many documentation titles don't take the form name(...) ...
            // so we grab which ones we can. and rely on the intial value of
            // the functionFormSuggestion map for any others we want to
            // support rest of them
            var firstParen = usage.indexOf("(");

            var name = usage;
            if (firstParen >= 0) {
                name = name.substring(0, firstParen).trim();
                BabyHint.functionFormSuggestion[name] = usage;
            }
        }
    },

    babyErrors: function(source, hintErrors) {
        var errorLines = {};
        var lines = source.split("\n");
        BabyHint.errors = [];
        BabyHint.variables = [];
        BabyHint.inComment = false;
        BabyHint.spellChecked = false;

        // Build a map of the lines on which JSHint produced an error
        _.each(hintErrors, function(error) {
            // Get correct index number from the reported line number
            if (error) {
                errorLines[error.line - 2] = true;
            }
        });

        _.each(lines, function(line, index) {
            // Check the line for errors
            BabyHint.errors = BabyHint.errors.concat(
                BabyHint.parseLine(line, index, errorLines[index]));
        });

        return BabyHint.errors;
    },

    // Checks a single line for errors
    parseLine: function(line, lineNumber, hasError) {
        var errors = [];

        if (BabyHint.inComment) {
            // We are in a multi-line comment.
            // Look for the end of the comments.
            line = BabyHint.removeEndOfMultilineComment(line);
        }
        if (!BabyHint.inComment) {
            line = BabyHint.removeComments(line);
            line = BabyHint.removeStrings(line);

            // Checks could detect new errors, thus must run on every line
            errors = errors
                // check for incorrect function declarations
                .concat(BabyHint.checkFunctionDecl(line, lineNumber))
                // we don't allow ending lines with "="
                .concat(BabyHint.checkTrailingEquals(line, lineNumber))
                // check for correct number of parameters
                .concat(BabyHint.checkFunctionParams(line, lineNumber))
                // check for banned property names
                .concat(BabyHint.checkBannedProperties(line, lineNumber));

            // Checks only run on lines with existing errors
            if (hasError) {
                errors = errors
                    // check for missing space after var
                    .concat(BabyHint.checkSpaceAfterVar(line, lineNumber));

                    // only check spelling for the first error shown
                    if (!BabyHint.spellChecked) {
                        errors = errors.concat(BabyHint.checkSpelling(line, lineNumber));
                        BabyHint.spellChecked = true;
                    }
            }

            // add new variables for future spellchecking
            BabyHint.variables = BabyHint.variables.concat(
                BabyHint.getVariables(line));
        }

        return errors;
    },

    removeComments: function(line) {
        // replace commented out code with whitespaces
        // first check for "//"
        var index = line.indexOf("//");
        if (index !== -1) {
            line = line.slice(0, index);
        }

        // now check for "/*"
        while (line.indexOf("/*") !== -1) {
            index = line.indexOf("/*");
            var closeIndex = line.indexOf("*/");
            while (closeIndex !== -1 && closeIndex <= index + 1) {
                // unopened comments - let JSHINT catch these
                // we'll just remove the extra */ for now
                line = line.slice(0, closeIndex) +
                        "  " + line.slice(closeIndex + 2);
                closeIndex = line.indexOf("*/");
            }
            if (closeIndex > index + 1) {
                // found /* */ on the same line
                var comment = line.slice(index, closeIndex + 2);
                line = line.slice(0, index) +
                        comment.replace(/./g, " ") +
                        line.slice(closeIndex + 2);
            } else if (closeIndex === -1) {
                // beginning of a multi-line comment
                // inComment won't take effect until the next line
                BabyHint.inComment = true;
                line = line.slice(0, index);
            }
        }
        return line;
    },

    removeEndOfMultilineComment: function(line) {
        var index = line.indexOf("*/");
        if (index !== -1) {
            BabyHint.inComment = false;
            line = line.slice(0, index + 2).replace(/./g, " ") +
                    line.slice(index + 2);
        }
        return line;
    },

    removeStrings: function(line) {
        // currently JSHINT doesn't allow multi-line strings, so
        // all string quotes should be closed on the same line
        var openIndex = -1;
        var quoteType = null;
        for (var i = 0; i < line.length; i++) {
            var letter = line[i];
            if (openIndex === -1) {
                // look for any type of quotes
                if (letter === "\"") {
                    openIndex = i;
                    quoteType = "\"";
                } else if (letter === "\'") {
                    openIndex = i;
                    quoteType = "\'";
                }
            } else if (letter === quoteType) {
                // replace string contents with whitespace
                var string = line.slice(openIndex + 1, i);
                line = line.slice(0, openIndex + 1) +
                        string.replace(/./g, " ") +
                        line.slice(i);
                openIndex = -1;
            }
        }
        return line;
    },

    checkFunctionDecl: function(line, lineNumber) {
        var errors = [];
        var functions = line.match(/function\s+\w+/g);
        _.each(functions, function(fun) {
            var name = fun.split(/\s+/g)[1];
            // I18N: Don't translate the '\" var %(name)s = function() {}; \"' part
            var error = {
                row: lineNumber,
                column: line.indexOf(fun),
                text: $._("If you want to define a function, you should use \"var %(name)s = function() {}; \" instead!", {name: name}),
                breaksCode: true,
                source: "funcdeclaration"
            };
            errors.push(error);
        });
        return errors;
    },

    checkBannedProperties: function(line, lineNumber) {
        var errors = [];
        var words = line.split(/[^~`@#\$\^\w]/g);
        _.each(words, function(word) {
            if (BabyHint.bannedProperties.hasOwnProperty(word)) {
                var error = {
                    row: lineNumber,
                    column: line.indexOf(word),
                    text: $._("%(word)s is a reserved word.", {word: word}),
                    breaksCode: true,
                    source: "bannedwords"
                };

                errors.push(error);
            }
        });
        return errors;
    },

    checkSpelling: function(line, lineNumber) {
        var errors = [];
        var words = line.split(/[^~`@#\$\^\w]/g);
        var skipNext = false;
        _.each(words, function(word) {
            if (word.length > 0 && !skipNext) { 
                var editDist = BabyHint.editDistance(word);
                var dist = editDist.editDistance;
                var keyword = editDist.keyword;
                if (dist > 0 &&
                    dist <= BabyHint.EDIT_DISTANCE_THRESHOLD &&
                    dist < keyword.length - 1 && 
                    BabyHint.keywords.indexOf(word) === -1) {
                    var error = {
                        row: lineNumber,
                        column: line.indexOf(word),
                        text: $._("Did you mean to type \"%(keyword)s\" instead of \"%(word)s\"?", {keyword: keyword, word: word}),
                        breaksCode: false,
                        source: "spellcheck"
                    };

                    // if we have usage forms, display them as well.
                    if (BabyHint.functionFormSuggestion[keyword]) {
                        error.text += " " + $._("In case you forgot, you can use it like \"%(usage)s\"", {usage: BabyHint.functionFormSuggestion[keyword]});
                    }

                    errors.push(error);
                }
            }
            // Don't spell check variable declarations or function arguments
            skipNext = (word === "var") || (word === "function");
        });
        return errors;
    },

    editDistance: function(word) {
        var wordOrig = word;
        word = word.toLowerCase();

        // Dynamic programming implementation of Levenshtein Distance.
        // The rows are the letters of the keyword.
        // The cols are the letters of the word.
        var make2DArray = function(rows, cols, initialVal) {
            initialVal = (typeof initialVal === "undefined") ? 0 : initialVal;
            var array2D = [];
            for (var i = 0; i < rows; i++) {
                array2D[i] = [];
                for (var j = 0; j < cols; j++) {
                    array2D[i][j] = initialVal;
                }
            }
            return array2D;
        };

        var minDist = Infinity;
        var minWord = "";
        _.each(BabyHint.keywords.concat(BabyHint.variables), function(keyword) {

            // Take care of words being precisely the same
            if (keyword === wordOrig) {
                minDist = 0;
                minWord = keyword;
                return;
            }

            // Take care of simple case of capitalization as only difference
            if (keyword.toLowerCase() === word && keyword !== wordOrig) {
                minDist = 1;
                minWord = keyword;
                return;
            }

            // skip words with lengths that are too different
            if (Math.abs(keyword.length - word.length) > BabyHint.EDIT_DISTANCE_THRESHOLD) {
                return;
            }
            var rows = keyword.length;
            var cols = word.length;
            var table = make2DArray(rows, cols, 1);
            // initialize first cell
            if (keyword[0] === word[0]) {
                table[0][0] = 0;
            }
            // initialize first row
            for (var c = 1; c < cols; c++) {
                var diff = keyword[0] === word[c] ? 0 : 1;
                table[0][c] = table[0][c - 1] + diff;
            }
            // initialize first col
            for (var r = 1; r < rows; r++) {
                var diff = keyword[r] === word[0] ? 0 : 1;
                table[r][0] = table[r - 1][0] + diff;
            }
            // compute table
            for (var i = 1; i < rows; i++) {
                var minInRow = Number.MAX_VALUE;
                for (var j = 1; j < cols; j++) {
                    var diff = keyword[i] === word[j] ? 0 : 1;
                    var dist = _.min([table[i - 1][j] + 1,
                                        table[i][j - 1] + 1,
                                        table[i - 1][j - 1] + diff]);
                    minInRow = Math.min(minInRow, dist);
                    table[i][j] = dist;
                }
                // break out if entire row exceeds threshold
                if (minInRow > BabyHint.EDIT_DISTANCE_THRESHOLD) {
                    return;
                }
            }
            if (table[rows - 1][cols - 1] < minDist) {
                minDist = table[rows - 1][cols - 1];
                minWord = keyword;
            }
        });
        return {editDistance: minDist, keyword: minWord};
    },

    checkSpaceAfterVar: function(line, lineNumber) {
        // Sometimes students forget the space between "var" and the
        // variable name. This only finds the first occurence of this
        // missing space
        var errors = [];
        var regex = /var\w+/g;
        var matches = line.match(regex);
        if (matches) {
            var variableName = matches[0].slice(3);
            var error = {
                row: lineNumber,
                column: line.search(regex) + 3,
                text: $._("Did you forget a space between \"var\" and \"%(variable)s\"?", {variable: variableName}),
                breaksCode: false
            };
            errors.push(error);
        }
        return errors;
    },

    checkTrailingEquals: function(line, lineNumber) {
        var errors = [];
        var i = line.length - 1;
        // find the last character in the line
        while (line[i] === " ") {
            i--;
        }
        if (line[i] === "=") {
            var error = {
                row: lineNumber,
                column: i,
                text: $._("You can't end a line with \"=\""),
                breaksCode: true
            };
            errors.push(error);
        }
        return errors;
    },

    getVariables: function(line) {
        // Add any new variables for future spellchecking.
        // This misses variables that are not the first variable to be
        // declared on a line (e.g. var draw = function() {var x = 3;};)
        var variables = [];
        var regex = /\s*var\s*([A-z]\w*)\s*(;|=)/;
        if (regex.exec(line)) {
            var variable = regex.exec(line)[1];
            variables.push(variable);
        }

        // Add any variables declared as function parameters
        // Also only checks first function declaration on the line
        var functionRegex = /function\s*\(([\w\s,]*)\)/;
        if (functionRegex.exec(line)) {
            var fun = RegExp.$1;
            var params = fun.split(/\s*,\s*/);
            _.each(params, function(param) {
                if (param) {
                    variables.push(param);
                }
            });
        }
        return variables;
    },

    checkFunctionParams: function(line, lineNumber) {
        // Many Processing functions don't break if passed the wrong
        // number of parameters, but they also don't work.
        // We want to display errors for these specific cases.

        var errors = [];
        // first match up pairs of parentheses
        var parenPairs = {};
        var stack = [];
        for (var i = 0; i < line.length; i++) {
            if (line[i] === "(") {
                stack.push(i);
            } else if (line[i] === ")") {
                if (stack.length === 0) {
                    var error = {
                        row: lineNumber,
                        column: i,
                        text: $._("It looks like you have an extra \")\""),
                        breaksCode: false,
                        source: "paramschecker"
                    };
                    errors.push(error);
                    // if we messed up the parens matching,
                    // parameter counts will be off
                    return errors;
                } else {
                    parenPairs[stack.pop()] = i;
                }
            }
        }
        if (stack.length > 0) {
            // check if there's anything left in the stack
            var error = {
                row: lineNumber,
                column: stack.pop(),
                text: $._("It looks like you are missing a \")\" - does every \"(\" have a corresponding closing \")\"?"),
                breaksCode: false,
                source: "paramschecker"
            };
            errors.push(error);
            // if we messed up the parens matching,
            // parameter counts will be off
            return errors;
        }

        // find all function calls
        var functions = line.match(/\w+\s*\(/g) || [];
        // find all functions calls on an object
        var objectFunctions = line.match(/\.\s*\w+\s*\(/g) || [];
        objectFunctions = _.map(objectFunctions, function(fun) {
            // remove the leading '.'
            var functionStart = fun.indexOf(fun.match(/\w/g)[0]);
            return fun.slice(functionStart);
        });

        // go through functions from right to left
        for (var i = functions.length - 1; i >= 0; i--) {
            var index = line.lastIndexOf(functions[i]);

            var functionName = functions[i].split(/\(\s*/g)[0];

            // extract the stuff inside the parens
            index += functionName.length;
            var params = line.slice(index, parenPairs[index] + 1);

            // check for missing commas
            var spacesBetween = params.match(/[A-z0-9]+\s+[A-z0-9]+/g);
            if (spacesBetween) {
                var col = line.indexOf(spacesBetween[0]);
                while (line[col] !== " ") {
                    col++;
                }
                var error = {
                    row: lineNumber,
                    column: col,
                    text: $._("Did you forget to add a comma between two parameters?"),
                    breaksCode: false, // JSHINT should break on these lines,
                    source: "paramschecker"
                };
                errors.push(error);
                // this might confuse the parameter count, so move on for now
                break;
            }

            // count the parameters passed
            var numParams;
            var numCommas = params.match(/,/g);
            if (numCommas) {
                numParams = numCommas.length + 1;
            } else {
                numParams = params.match(/[^\s()]/g) ? 1 : 0;
            }

            // ignore functions of objects
            if (!_.include(objectFunctions, functions[i])) {
                // check if parameters passed matches the expected number
                functionName = functionName.replace(/\s/g, "");

                var expectedParams = BabyHint.functionParamCount[functionName];
                var text;
                var functionCall;

                if (typeof expectedParams !== "undefined") {
                    functionCall = "\"" + functionName + "()\"";

                    if (typeof expectedParams === "number" &&
                        numParams !== expectedParams) {

                        text = $.ngettext("%(name)s takes 1 parameter, not %(given)s!", "%(name)s takes %(num)s parameters, not %(given)s!", expectedParams, {name: functionCall, given: numParams});

                    } else if (typeof expectedParams !== "number" &&
                                !_.include(expectedParams, numParams)) {

                        var listOfParams = "" + expectedParams[0];

                        for (var j = 1; j < expectedParams.length - 1; j++) {
                            listOfParams += ", " + expectedParams[j];
                        }

                        listOfParams += " " + $._("or") + " " +
                                        expectedParams[expectedParams.length - 1];

                        text = $._("%(name)s takes %(list)s parameters, not %(given)s!", {name: functionCall, list: listOfParams, given: numParams});
                    }
                }

                if (text) {
                    var functionForm = BabyHint.functionFormSuggestion[functionName];
                    if (functionForm) {
                        text = $._("It looks like you're trying to use %(name)s. In case you forgot, you can use it like: %(usage)s", {name: functionCall, usage: "\"" + functionForm + "\""});
                    }
                }

                if (text) {
                    var error = {
                        row: lineNumber,
                        column: index,
                        text: text,
                        breaksCode: true,
                        source: "paramschecker"
                    };
                    errors.push(error);
                }
            }
            // remove this function call so we don't mess up future comma counts
            line = line.slice(0, index) + params.replace(/./g, "0") +
                    line.slice(parenPairs[index] + 1);
        }
        return errors;
    }
};
// TODO(jlfwong): Stop globalizing BabyHint
window.BabyHint = BabyHint;
