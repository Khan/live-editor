this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["tipbar"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  var buffer = "", stack1, helper, options, self=this, functionType="function", blockHelperMissing=helpers.blockHelperMissing;

function program1(depth0,data) {
  
  
  return "Oh noes!";
  }

function program3(depth0,data) {
  
  
  return "Show me where";
  }

  buffer += "<div class=\"tipbar\">\n    <div class=\"speech-arrow\"></div>\n    <div class=\"error-buddy\"></div>\n    <div class=\"tipnav\">\n        <a href=\"\" class=\"prev\"><span class=\"ui-icon ui-icon-circle-triangle-w\"></span></a>\n        <span class=\"current-pos\"></span>\n        <a href=\"\" class=\"next\"><span class=\"ui-icon ui-icon-circle-triangle-e\"></span></a>\n    </div>\n    <div class=\"text-wrap\">\n        <div class=\"oh-no\">";
  options={hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(1, program1, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</div>\n        <div class=\"message\"></div>\n        <div class=\"show-me\"><a href>";
  options={hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data}
  if (helper = helpers._) { stack1 = helper.call(depth0, options); }
  else { helper = (depth0 && depth0._); stack1 = typeof helper === functionType ? helper.call(depth0, options) : helper; }
  if (!helpers._) { stack1 = blockHelperMissing.call(depth0, stack1, {hash:{},inverse:self.noop,fn:self.program(3, program3, data),data:data}); }
  if(stack1 || stack1 === 0) { buffer += stack1; }
  buffer += "</a></div>\n    </div>\n</div>";
  return buffer;
  });;
/**
 * This is called tipbar for historical reasons.
 * Originally, it appeared as a red bar sliding up from the bottom of the
 * canvas. Now it just powers the error reporting mechanism, which no longer
 * looks like a bar
 */

window.TipBar = Backbone.View.extend({
    initialize: function() {
        this.pos = 0;
        this.texts = [];
        this.render();
        this.bind();
    },

    render: function() {
        this.$el.html(Handlebars.templates["tipbar"]());
    },

    bind: function() {
        var self = this;

        this.$el.on("click", ".tipbar .tipnav a", function() {
            if (!$(this).hasClass("ui-state-disabled")) {
                self.pos += $(this).hasClass("next") ? 1 : -1;
                self.show();
            }

            Output.postParent({ focus: true });

            return false;
        });

        this.$el.on("click", ".tipbar .text-wrap a", function() {
            var error = self.texts[self.pos];

            Output.postParent({ cursor: error });

            return false;
        });
    },

    show: function(type, texts, callback) {
        if (texts) {
            this.pos = 0;
            this.texts = texts;
        } else {
            texts = this.texts;
        }

        var pos = this.pos;
        var bar = this.$el.find(".tipbar");

            // Inject current text
        bar
            .find(".current-pos").text(texts.length > 1 ? (pos + 1) + "/" + texts.length : "").end()
            .find(".message").html(texts[pos].text || texts[pos] || "").end()
            .find("a.prev").toggleClass("ui-state-disabled", pos === 0).end()
            .find("a.next").toggleClass("ui-state-disabled", pos + 1 === texts.length).end();

        this.$el.find(".show-me").toggle(texts[pos].row !== -1);

        bar.find(".tipnav").toggle(texts.length > 1);

        // Only animate the bar in if it's not visible
        if (!bar.is(":visible")) {
            bar
                .css({ top: 400, opacity: 0.1 })
                .show()
                .animate({ top: this.$el.find(".toolbar").is(":visible") ? 33 : 100, opacity: 1.0 }, 300);
        }

        if (callback) {
            callback(texts[pos]);
        }
    },

    hide: function() {
        this.$el.find(".tipbar").animate({ top: 400, opacity: 0.1 }, 300, function() {
            $(this).hide();
        });
    }
});
this["Handlebars"] = this["Handlebars"] || {};
this["Handlebars"]["templates"] = this["Handlebars"]["templates"] || {};
this["Handlebars"]["templates"]["output"] = Handlebars.template(function (Handlebars,depth0,helpers,partials,data) {
  this.compilerInfo = [4,'>= 1.0.0'];
helpers = this.merge(helpers, Handlebars.helpers); data = data || {};
  


  return "<div id=\"output\">\n    <canvas id=\"output-canvas\" width=\"400\" height=\"400\"></canvas>\n    <div class=\"overlay error-overlay hidden\"></div>\n</div>\n<div id=\"test-errors\" style=\"display: none;\"></div>";
  });;
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

    // We'll get function names from Output.context
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
    /* Omit those included in Output.context */
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
    // We'll get most of these from Output.context,
    // so these are just the overrides.
    functionParamCount: {
        "acos": 1,
        "asin": 1,
        "atan": 1,
        "atan2": 2,
        "background": [1, 3],
        "beginShape": [0, 1],
        "bezier": 8,
        "bezierVertex": [6],
        "box": [1, 2, 3],
        "color": [3, 4],
        "colorMode": [1, 2, 4, 5],
        "createFont": [1, 2],
        "cos": 1,
        "curve": 8,
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

    init: function() {
        // grab globals from Processing object
        for (var f in Output.context) {
            if (typeof Output.context[f] === "function") {
                BabyHint.keywords.push(f);
                if (!(f in BabyHint.functionParamCount) &&
                    !_.include(BabyHint.functionParamBlacklist, f)) {
                    BabyHint.functionParamCount[f] = Output.context[f].length;
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

window.OutputTester = {
    tests: [],
    test: function(userCode, validate, errors) {
        OutputTester.userCode = userCode;
        OutputTester.validate = validate;
        OutputTester.tests = [];

        // This will also fill in tests, as it will end up
        //  referencing functions like staticTest and that
        //  function will fill in OutputTester.tests
        OutputTester.exec(OutputTester.validate, OutputTester.testContext);

        OutputTester.testResults = [];
        OutputTester.errors = errors || [];

        OutputTester.curTask = null;
        OutputTester.curTest = null;

        for (var i = 0; i < OutputTester.tests.length; i++) {
            OutputTester.testResults.push(
                OutputTester.runTest(userCode || "", OutputTester.tests[i], i));
        }
    },

    runTest: function(userCode, test, i) {
        var result = {
            name: test.name,
            state: "pass",
            results: []
        };

        OutputTester.curTest = result;
        if (OutputTester.validate && test.type === "static") {
            test.fn();
        }

        OutputTester.curTest = null;

        return result;
    },

    exec: function(code) {
        if (!code) {
            return true;
        }

        var contexts = Array.prototype.slice.call(arguments, 1);

        function exec_() {
            for (var i = 0; i < contexts.length; i++) {
                if (contexts[i]) {
                    code = "with(arguments[" + i + "]){\n" + code + "\n}";
                }
            }
            (new Function(code)).apply({}, contexts);
            return true;
        }

        return exec_();
    },

    testContext: {
        test: function(name, fn, type) {
            if (!fn) {
                fn = name;
                name = $._("Test Case");
            }

            OutputTester.tests.push({
                name: name,

                type: type || "default",

                fn: function() {
                    try {
                        return fn.apply(this, arguments);

                    } catch (e) {
                        console.warn(e);
                    }
                }
            });
        },

        staticTest: function(name, fn) {
            OutputTester.testContext.test(name, fn, "static");
        },

        log: function(msg, state, expected, type, meta) {
            type = type || "info";

            var item = {
                type: type,
                msg: msg,
                state: state,
                expected: expected,
                meta: meta || {}
            };

            if (OutputTester.curTest) {
                if (state !== "pass") {
                    OutputTester.curTest.state = state;
                }

                OutputTester.curTest.results.push(item);
            }

            if (OutputTester.curTask) {
                if (state !== "pass") {
                    OutputTester.curTask.state = state;
                }

                OutputTester.curTask.results.push(item);
            }

            return item;
        },

        task: function(msg, tip) {
            OutputTester.curTask = OutputTester.testContext.log(msg, "pass", tip, "task");
            OutputTester.curTask.results = [];
        },

        endTask: function() {
            OutputTester.curTask = null;
        },

        assert: function(pass, msg, expected, meta) {
            pass = !!pass;
            OutputTester.testContext.log(msg, pass ? "pass" : "fail", expected, "assertion", meta);
            return pass;
        },

        isEqual: function(a, b, msg) {
            return OutputTester.testContext.assert(a === b, msg, [a, b]);
        },

        hasFnCall: function(name, check) {
            for (var i = 0, l = OutputTester.fnCalls.length; i < l; i++) {
                var retVal = OutputTester.testContext.checkFn(OutputTester.fnCalls[i],
                    name, check);

                if (retVal === true) {
                    return;
                }
            }

            OutputTester.testContext.assert(false, $._("Expected function call to %(name)s was not made.", {name: name}));
        },

        orderedFnCalls: function(calls) {
            var callPos = 0;

            for (var i = 0, l = OutputTester.fnCalls.length; i < l; i++) {
                var retVal = OutputTester.testContext.checkFn(OutputTester.fnCalls[i],
                    calls[callPos][0], calls[callPos][1]);

                if (retVal === true) {
                    callPos += 1;

                    if (callPos === calls.length) {
                        return;
                    }
                }
            }

            OutputTester.testContext.assert(false, $._("Expected function call to %(name)s was not made.", {name: calls[callPos][0]}));
        },

        checkFn: function(fnCall, name, check) {
            if (fnCall.name !== name) {
                return;
            }

            var pass = true;

            if (typeof check === "object") {
                if (check.length !== fnCall.args.length) {
                    pass = false;

                } else {
                    for (var c = 0; c < check.length; c++) {
                        if (check[c] !== null &&
                            check[c] !== fnCall.args[c]) {
                            pass = false;
                        }
                    }
                }

            } else if (typeof check === "function") {
                pass = check(fnCall);
            }

            if (pass) {
                OutputTester.testContext.assert(true,
                    $._("Correct function call made to %(name)s.", {name: name}));
            }

            return pass;
        },

        /*
         * Returns a pass result with an optional message
         */
        pass: function(message) {
            return {
                success: true,
                message: message
            };
        },

        /*
         * Returns a fail result with an optional message
         */
        fail: function(message) {
            return {
                success: false,
                message: message
            };
        },

        /*
         * If any of results passes, returns the first pass. Otherwise, returns the first fail.
         */
        anyPass: function() {
            return _.find(arguments, this.passes) || arguments[0] || this.fail();
        },

        /*
         * If any of results fails, returns the first fail. Otherwise, returns the first pass.
         */
        allPass: function() {
            return _.find(arguments, this.fails) || arguments[0] || this.pass();
        },

        /*
         * See if any of the patterns match the code
         */
        firstMatchingPattern: function(patterns) {
            return _.find(patterns, _.bind(function(pattern) {
                    return this.matches(this.structure(pattern));
                }, this));
        },

        /*
         * Returns true if the result represents a pass.
         */
        passes: function(result) {
            return result.success;
        },

        /*
         * Returns true if the result represents a fail.
         */
        fails: function(result) {
            return !result.success;
        },

        /*
         * Returns the result of matching a structure against the user's code
         */
        match: function(structure) {
            // If there were syntax errors, don't even try to match it
            if (OutputTester.errors.length) {
                return {
                    success: false,
                    message: $._("Syntax error!")
                };
            }
            // At the top, we take care of some "alternative" uses of this function
            // For ease of challenge developing, we return a failure() instead of
            // disallowing these uses altogether

            // If we don't see a pattern property, they probably passed in
            // a pattern itself, so we'll turn it into a structure
            if (structure && _.isUndefined(structure.pattern)) {
                structure = {pattern: structure};
            }

            // If nothing is passed in or the pattern is non-existent, return failure
            if (!structure || ! structure.pattern) {
                return {
                    success: false,
                    message: ""
                };
            }

            try {
                var constraint = structure.constraint;
                var callbacks;
                if (constraint) {
                    callbacks = {};
                    callbacks[constraint.variables.join(", ")] = constraint.fn;
                }
                var success = Structured.match(OutputTester.userCode, structure.pattern, {
                    varCallbacks: callbacks
                });

                return {
                    success: success,
                    message: callbacks && callbacks.failure
                };
            } catch (e) {
                console.warn(e);
                return {
                    success: true,
                    message: $._("Hm, we're having some trouble " +
                        "verifying your answer for this step, so we'll give you " +
                        "the benefit of the doubt as we work to fix it. " +
                        "Please click 'Report a problem' to notify us.")
                };
            }
        },

        /*
         * Returns true if the structure matches the user's code
         */
        matches: function(structure) {
            return this.match(structure).success;
        },

        /*
         * Creates a new test result (i.e. new challenge tab)
         */
        assertMatch: function(result, description, hint, image, syntaxChecks) {
            if (syntaxChecks) {
                // If we found any syntax errors or warnings, we'll send it
                // through the special syntax checks
                var foundErrors = _.any(OutputTester.errors, function(error) {
                    return error.lint;
                });

                if (foundErrors) {

                    _.each(syntaxChecks, function(syntaxCheck) {
                        // Check if we find the regex anywhere in the code
                        var foundCheck = OutputTester.userCode.search(syntaxCheck.re);
                        var rowNum = -1, colNum = -1, errorMsg;
                        if (foundCheck > -1) {
                            errorMsg = syntaxCheck.msg;

                            // Find line number and character
                            var lines = OutputTester.userCode.split("\n");
                            var totalChars = 0;
                            _.each(lines, function(line, num) {
                                if (rowNum === -1 && foundCheck < totalChars + line.length) {
                                    rowNum = num;
                                    colNum = foundCheck - totalChars;
                                }
                                totalChars += line.length;
                            });

                            OutputTester.errors.splice(0, 1, {
                                text: errorMsg,
                                row: rowNum,
                                col: colNum,
                                type: "error"
                            });
                        }
                    });
                }
            }

            var alternateMessage;
            var alsoMessage;

            if (result.success) {
                alternateMessage = result.message;
            } else {
                alsoMessage = result.message;
            }

            OutputTester.testContext.assert(result.success, description, "", {
                // We can accept string hints here because
                //  we never match against them anyway
                structure: _.isString(hint) ? "function() {" + hint + "}" : hint.toString(),
                alternateMessage: alternateMessage,
                alsoMessage: alsoMessage,
                image: image
            });
        },

        /*
         * Returns a new structure from the combination of a pattern and a constraint
         */
        structure: function(pattern, constraint) {
            return {
                pattern: pattern,
                constraint: constraint
            };
        },

        /*
         * Creates a new variable constraint
         */
        constraint: function(variables, fn) {
            return {
                variables: variables,
                fn: fn
            };
        },

        _isVarName: function(str) {
            return _.isString(str) && str.length > 0 && str[0] === "$";
        },

        _assertVarName: function(str) {
            if (!this._isVarName(str)) {
                throw new Error("Expected " + str + " to be a valid variable name.");
            }
        },

        /*
         * Satisfied when predicate(var) is true.
         */
        unaryOp: function(varName, predicate) {
            this._assertVarName(varName);
            return this.constraint([varName], function(ast) {
                return !!(ast && !_.isUndefined(ast.value) && predicate(ast.value));
            });
        },

        /*
         * Satisfied when var is any literal.
         */
        isLiteral: function(varName) {
            function returnsTrue() {
                return true;
            }

            return this.unaryOp(varName, returnsTrue);
        },

        /*
         * Satisfied when var is a number.
         */
        isNumber: function(varName) {
            return this.unaryOp(varName, _.isNumber);
        },

        /*
         * Satisfied when var is an identifier
         */
        isIdentifier: function(varName) {
            return this.constraint([varName], function(ast) {
                return !!(ast && ast.type && ast.type === "Identifier");
            });
        },

        /*
         * Satisfied when var is a boolean.
         */
        isBoolean: function(varName) {
            return this.unaryOp(varName, _.isBoolean);
        },

        /*
         * Satisfied when var is a string.
         */
        isString: function(varName) {
            return this.unaryOp(varName, _.isString);
        },

        /*
         * Satisfied when pred(first, second) is true.
         */
        binaryOp: function(first, second, predicate) {
            var variables = [];
            var fn;
            if (this._isVarName(first)) {
                variables.push(first);
                if (this._isVarName(second)) {
                    variables.push(second);
                    fn = function(a, b) {
                        return !!(a && b && !_.isUndefined(a.value) &&
                            !_.isUndefined(b.value) && predicate(a.value, b.value));
                    };
                } else {
                    fn = function(a) {
                        return !!(a && !_.isUndefined(a.value) && predicate(a.value, second));
                    };
                }
            } else if (this._isVarName(second)) {
                variables.push(second);
                fn = function(b) {
                    return !!(b && !_.isUndefined(b.value) && predicate(first, b.value));
                };
            } else {
                throw new Error("Expected either " + first + " or " + second + " to be a valid variable name.");
            }

            return this.constraint(variables, fn);
        },

        /*
         * Satisfied when a < b
         */
        lessThan: function(a, b) {
            return this.binaryOp(a, b, function(a, b) { return a < b; });
        },

        /*
         * Satisfied when a <= b
         */
        lessThanOrEqual: function(a, b) {
            return this.binaryOp(a, b, function(a, b) { return a <= b; });
        },

        /*
         * Satisfied when a > b
         */
        greaterThan: function(a, b) {
            return this.binaryOp(a, b, function(a, b) { return a > b; });
        },

        /*
         * Satisfied when a > 0
         */
        positive: function(a) {
            return this.unaryOp(a, function(a) { return a > 0; });
        },

        /*
         * Satisfied when a > 0
         */
        negative: function(a) {
            return this.unaryOp(a, function(a) { return a < 0; });
        },

        /*
         * Satisfied when a >= b
         */
        greaterThanOrEqual: function(a, b) {
            return this.binaryOp(a, b, function(a, b) { return a >= b; });
        },

        /*
         * Satisfied when min <= val <= max
         */
        inRange: function(val, min, max) {
            return this.and(
                this.greaterThanOrEqual(val, min),
                this.lessThanOrEqual(val, max));
        },

        /*
         * Satisfied when a === b
         */
        equal: function(a, b) {
            return this.binaryOp(a, b, function(a, b) { return a === b; });
        },

        /*
         * Satisfied when a !== b
         */
        notEqual: function(a, b) {
            return this.binaryOp(a, b, function(a, b) { return a !== b; });
        },

        /*
         * Satisfied when constraint is not satisfied
         */
        not: function(constraint) {
            return this.constraint(constraint.variables, function() {
                return !constraint.fn.apply({}, arguments);
            });
        },

        _naryShortCircuitingOp: function(allOrAny, args) {
            var variables = _.union.apply({}, _.pluck(args, "variables"));

            var argNameToIndex = _.object(_.map(variables, function(item, index) {
                return [item, index];
            }));

            return this.constraint(variables, function() {
                var constraintArgs = arguments;
                return allOrAny(args, function(constraint) {
                    var fnArgs = _.map(constraint.variables, function(varName) {
                        return constraintArgs[argNameToIndex[varName]];
                    });

                    return constraint.fn.apply({}, fnArgs);
                });
            });
        },

        /*
         * Satisfied when all of the input constraints are satisfied
         */
        and: function() {
            return this._naryShortCircuitingOp(_.all, arguments);
        },

        /*
         * Satisfied when any of the input constraints are satisfied
         */
        or: function() {
            return this._naryShortCircuitingOp(_.any, arguments);
        }
    }
};
(function() {

// Keep track of the frame source and origin for later
var frameSource;
var frameOrigin;

var Output = {
    recording: false,

    init: function(options) {
        this.$elem = $(options.el);
        this.render();

        // These are the tests (like challenge tests)
        this.validate = null;
        // These are the outputted errors
        this.errors = [];

        this.context = {};
        this.loaded = false;

        this.config = new ScratchpadConfig({});

        // Load JSHint config options
        this.config.runCurVersion("jshint");

        this.config.on("versionSwitched", function(e, version) {
            this.config.runVersion(version, "processing", CanvasOutput.canvas);
        }.bind(this));

        this.tipbar = new TipBar({
            el: this.$elem[0]
        });

        Output.bind();

        Output.setOutput(CanvasOutput);

        BabyHint.init();
    },

    render: function() {
        this.$elem.html(Handlebars.templates["output"]());
    },

    bind: function() {      
        if (window !== window.top) {
            window.alert = $.noop;
            window.open = $.noop;
            window.showModalDialog = $.noop;
            window.confirm = $.noop;
            window.prompt = $.noop;
            window.eval = $.noop;
        }

        // Handle messages coming in from the parent frame
        window.addEventListener("message",
            this.handleMessage.bind(this), false);
    },

    handleMessage: function(event) {
        var data;

        frameSource = event.source;
        frameOrigin = event.origin;

        // let the parent know we're up and running
        this.notifyActive();

        try {
            data = JSON.parse(event.data);

        } catch (err) {
            return;
        }

        Output.execDir = data.execDir;
        Output.externalsDir = data.externalsDir;
        Output.imagesDir = data.imagesDir;

        // Validation code to run
        if (data.validate != null) {
            Output.initTests(data.validate);
        }

        // Settings to initialize
        if (data.settings != null) {
            Output.settings = data.settings;
        }

        // Code to be executed
        if (data.code != null) {
            this.config.switchVersion(data.version);
            Output.runCode(data.code);
        }

        if (data.onlyRunTests != null) {
            Output.onlyRunTests = !!(data.onlyRunTests);
        } else {
            Output.onlyRunTests = false;
        }

        // Restart the output
        if (data.restart) {
            Output.restart();
        }

        // Take a screenshot of the output
        if (data.screenshot) {
            // We want to resize the image to a 200x200 thumbnail,
            // which we can do by creating a temporary canvas
            var tmpCanvas = document.createElement("canvas");

            var screenshotSize = data.screenshotSize || 200;
            tmpCanvas.width = screenshotSize;
            tmpCanvas.height = screenshotSize;
            tmpCanvas.getContext("2d").drawImage(
                $("#output-canvas")[0], 0, 0, screenshotSize, screenshotSize);

            // Send back the screenshot data
            frameSource.postMessage(tmpCanvas.toDataURL("image/png"),
                frameOrigin);
        }

        // Keep track of recording state
        if (data.recording != null) {
            Output.recording = data.recording;
        }

        // Play back recording
        if (data.action) {
            if (CanvasOutput.handlers[data.name]) {
                CanvasOutput.handlers[data.name](data.action);
            }
        }

        if (data.documentation) {
            BabyHint.initDocumentation(data.documentation);
        }
    },

    // Send a message back to the parent frame
    postParent: function(data) {
        // If there is no frameSource (e.g. we're not embedded in another page)
        // Then we don't need to care about sending the messages anywhere!
        if (frameSource) {
            frameSource.postMessage(JSON.stringify(data), frameOrigin);
        }
    },

    notifyActive: _.once(function() {
        this.postParent({ active: true });
    }),

    // This function stores the new tests on the validate property
    //  and it executes the test code to see if its valid
    initTests: function(validate) {
        // Only update the tests if they have changed
        if (Output.validate === validate) {
            return;
        }

        // Prime the test queue
        Output.validate = validate;

        // We evaluate the test code to see if it itself has any syntax errors
        // This also ends up pushing the tests onto Output.tests
        var result = Output.exec(validate, OutputTester.testContext);

        // Display errors encountered while evaluating the test code
        if (result && result.message) {
            $("#test-errors").text(result.message).show();
        } else {
            $("#test-errors").hide();
        }
    },

    setOutput: function(output) {
        if (Output.output) {
            Output.output.kill();
        }

        Output.output = output.init({
            config: this.config
        });
    },

    registerOutput: function(output) {
        if (!Output.outputs) {
            Output.outputs = [];
        }

        Output.outputs.push(output);

        $.extend(Output.testContext, output.testContext);
    },

    getUserCode: function() {
        return Output.currentCode || "";
    },

    // Returns an object that holds all the exposed properties
    // from the current execution environment. The properties will
    // correspond to boolean values: true if it cannot be overriden
    // by the user, false if it can be. See: JSHintGlobalString
    exposedProps: function() {
        return Output.output ? Output.output.props : {};
    },

    // Banned properties
    bannedProps: function() {
        return Output.output ? Output.output.bannedProps : {};
    },

    // Generate a string list of properties
    propListString: function(props) {
        var bannedProps = Output.bannedProps();
        var propList = [];

        for (var prop in props) {
            if (!bannedProps[prop]) {
                propList.push(prop + ":" + props[prop]);
            }
        }

        return propList.join(",");
    },

    runCode: function(userCode, callback) {
        Output.currentCode = userCode;

        // Build a string of options to feed into JSHint
        // All properties are defined in the config
        var hintCode = "/*jshint " +
            Output.propListString(Output.JSHint) + " */" +

            // Build a string of variables names to feed into JSHint
            // This lets JSHint know which variables are globally exposed
            // and which can be overridden, more details:
            // http://www.jshint.com/about/
            // propName: true (is a global property, but can be overridden)
            // propName: false (is a global property, cannot be overridden)
            "/*global " + Output.propListString(Output.exposedProps()) +

            // The user's code to execute
            "*/\n" + userCode;

        var done = function(hintData, hintErrors) {
            Output.hintDone(userCode, hintData, hintErrors, callback);
        };

        // Don't run JSHint if there is no code to run
        if (!userCode) {
            done(null, []);
        } else {
            Output.hintWorker.exec(hintCode, done);
        }
    },

    hintDone: function(userCode, hintData, hintErrors, callback) {
        var externalProps = Output.exposedProps();

        Output.globals = {};
        if (hintData && hintData.globals) {
            for (var i = 0, l = hintData.globals.length; i < l; i++) {
                var global = hintData.globals[i];

                // Do this so that declared variables are gobbled up
                // into the global context object
                if (!externalProps[global] && !(global in Output.context)) {
                    Output.context[global] = undefined;
                }

                Output.globals[global] = true;
            }
        }

        Output.babyErrors = BabyHint.babyErrors(userCode, hintErrors);

        Output.errors = [];
        Output.mergeErrors(hintErrors, Output.babyErrors);

        var runDone = function() {
            if (!Output.loaded) {
                this.postParent({ loaded: true });
                Output.loaded = true;
            }

            // A callback for working with a test suite
            if (callback) {
                callback(Output.errors);
                return;
            }

            this.postParent({
                results: {
                    code: userCode,
                    errors: Output.errors,
                    tests: Output.testResults || []
                }
            });

            Output.toggleErrors();
        }.bind(this);

        // We only need to extract globals when the code has passed
        // the JSHint check
        Output.globals = {};

        if (hintData && hintData.globals) {
            for (var i = 0, l = hintData.globals.length; i < l; i++) {
                var global = hintData.globals[i];

                // Do this so that declared variables are gobbled up
                // into the global context object
                if (!externalProps[global] && !(global in Output.context)) {
                    Output.context[global] = undefined;
                }

                Output.globals[global] = true;
            }
        }

        // Run the tests

        var doneWithTests = function() {
            if (Output.errors.length === 0 && !Output.onlyRunTests) {
                // Then run the user's code
                if (Output.output && Output.output.runCode) {
                    try {
                        Output.output.runCode(userCode, Output.context, runDone);

                    } catch (e) {
                        Output.handleError(e);
                        runDone();
                    }

                    return;

                } else {
                    Output.exec(userCode, Output.context);
                }
            }
            runDone();
        };

        Output.testWorker.exec(userCode, Output.validate, Output.errors,
            doneWithTests);
    },

    mergeErrors: function(jshintErrors, babyErrors) {
        var brokenLines = [];
        var hintErrors = [];

        // Find which lines JSHINT broke on
        _.each(jshintErrors, function(error) {
            if (error && error.line && error.character &&
                    error.reason &&
                    !/unable to continue/i.test(error.reason)) {
                brokenLines.push(error.line - 2);
                hintErrors.push({
                    row: error.line - 2,
                    column: error.character - 1,
                    text: _.compose(Output.prettify, Output.clean)(error.reason),
                    type: "error",
                    lint: error,
                    source: "jshint"
                });
            }
        });

        // Add baby errors if JSHINT also broke on those lines, OR we don't want
        // to allow that error
        _.each(babyErrors, function(error) {
            if (_.include(brokenLines, error.row) || error.breaksCode) {
                Output.errors.push({
                    row: error.row,
                    column: error.column,
                    text: _.compose(Output.prettify, Output.clean)(error.text),
                    type: "error",
                    source: error.source
                });
            }
        });

        // Add JSHINT errors at the end
        Output.errors = Output.errors.concat(hintErrors);
    },

    toggleErrors: function() {
        var self = this;
        var hasErrors = !!Output.errors.length;

        $("#show-errors").toggleClass("ui-state-disabled", !hasErrors);
        $("#output .error-overlay").toggle(hasErrors);

        Output.toggle(!hasErrors);

        if (hasErrors) {
            Output.errors = Output.errors.sort(function(a, b) {
                return a.row - b.row;
            });

            if (Output.errorDelay) {
                clearTimeout(Output.errorDelay);
            }

            Output.errorDelay = setTimeout(function() {
                if (Output.errors.length > 0) {
                    self.tipbar.show("Error", Output.errors);
                }
            }, 1500);

        } else {
            self.tipbar.hide("Error");
        }
    },

    trackFunctions: function() {
        Output.tracking = {};
        Output.fnCalls = [];

        _.each(Output.context, function(fn, prop) {
            if (typeof fn === "function") {
                Output.tracking[prop] = fn;
                Output.context[prop] = function() {
                    var retVal = Output.tracking[prop].apply(
                        Output.context, arguments);

                    // Track the function call
                    Output.fnCalls.push({
                        name: prop,
                        args: Array.prototype.slice.call(arguments),
                        retVal: retVal
                    });

                    return retVal;
                };
            }
        });
    },

    endTrackFunctions: function() {
        _.each(Output.tracking, function(fn, prop) {
            Output.context[prop] = fn;
        });

        Output.tracking = {};
    },

    toggle: function(toggle) {
        if (Output.output && Output.output.toggle) {
            Output.output.toggle(toggle);
        }
    },

    start: function() {
        if (Output.output && Output.output.start) {
            Output.output.start();
        }
    },

    stop: function() {
        if (Output.output && Output.output.stop) {
            Output.output.stop();
        }
    },

    restart: function() {
        if (Output.output && Output.output.restart) {
            Output.output.restart();
        }
    },

    clear: function() {
        if (Output.output && Output.output.clear) {
            Output.output.clear();
        }
    },

    handleError: function(e) {
        if (Output.testing) {
            // Note: Scratchpad challenge checks against the exact translated
            // text "A critical problem occurred..." to figure out whether
            // we hit this case.
            var message = $._("Error: %(message)s", { message: e.message });
            $("#test-errors").text(message).show();
            OutputTester.testContext.assert(false, message,
                $._("A critical problem occurred in your program " +
                    "making it unable to run."));
            return;
        }

        var row = e.lineno ? e.lineno - 2 : -1;

        // Show babyHint errors first
        _.each(Output.babyErrors, function(error) {
            if (error.row + 1 === row) {
                Output.errors.push({
                    row: error.row,
                    column: error.column,
                    text: _.compose(Output.prettify, Output.clean)(error.text),
                    type: "error"
                });
            }
        });

        Output.errors.push({
            row: row,
            column: 0,
            text: Output.clean(e.message),
            type: "error"
        });

        Output.toggleErrors();
    },

    exec: function(code) {
        if (!code) {
            return true;
        }

        var contexts = Array.prototype.slice.call(arguments, 1);

        function exec_() {
            // this is kind of sort of supposed to fake a gensym that the user can't access
            // but since we're limited to string manipulation, we can't guarantee this fo sho'
            // so we just change the name to something long and random every time the code runs
            // and hope for the best!
            var randomEnvName = function() {
                return "__env__" + Math.floor(Math.random() * 1000000000);
            };

            if (Output.output && Output.output.compile) {
                code = Output.output.compile(code);
            }

            var envName = randomEnvName();

            for (var i = 0; i < contexts.length; i++) {
                if (contexts[i]) {
                    code = "with(" + envName + "[" + i + "]){\n" + code + "\n}";
                }
            }

            // the top-level 'this' is empty except for this.externals, which throws this message
            // this is how users were getting at everything from playing sounds to displaying pop-ups
            var badProgram = $._("This program uses capabilities we've turned off for security reasons. Khan Academy prohibits showing external images, playing sounds, or displaying pop-ups.");
            var topLevelThis = "{ get externals() { throw { message: " + JSON.stringify(badProgram) + " } } }";

            // if we pass in the env as a parameter, the user will be able to get at it
            // through the 'arguments' binding, so we close over it instead
            code = "var " + envName + " = arguments;\n(function(){\n" + code + "\n}).apply(" + topLevelThis + ");";

            (new Function(code)).apply(Output.context, contexts);

            return true;
        }

        try {
            return exec_();

        } catch (e) {
            Output.handleError(e);
            return e;
        }
    },

    // Turn a JavaScript object into a form that can be executed
    // (Note: The form will not necessarily be able to pass a JSON linter)
    // (Note: JSON.stringify might throw an exception. We don't capture it
    //        here as we'll want to deal with it later.)
    stringify: function(obj) {
        // Use toString on functions
        if (typeof obj === "function") {
            return obj.toString();

        // If we're dealing with an instantiated object just
        // use its generated ID
        } else if (obj && obj.__id) {
            return obj.__id();

        // Check if we're dealing with an array
        } else if (obj && Object.prototype.toString.call(obj) === "[object Array]") {
            return Output.stringifyArray(obj);

        // JSON.stringify returns undefined, not as a string, so we specially handle that
        } else if (typeof obj === "undefined") {
                return "undefined";

        // If all else fails, attempt to JSON-ify the string
        // TODO(jeresig): We should probably do recursion to better handle
        // complex objects that might hold instances.
        } else {
            return JSON.stringify(obj, function(k, v) {
                // Don't jsonify the canvas or its context because it can lead
                // to circular jsonification errors on chrome.
                if (v && (v.id !== undefined && v.id === "output-canvas" ||
                        typeof CanvasRenderingContext2D !== "undefined" &&
                        v instanceof CanvasRenderingContext2D)) {
                    return undefined;
                }
                return v;
            });
        }
    },

    // Turn an array into a string list
    // (Especially useful for serializing a list of arguments)
    stringifyArray: function(array) {
        var results = [];

        for (var i = 0, l = array.length; i < l; i++) {
            results.push(Output.stringify(array[i]));
        }

        return results.join(", ");
    },

    // Defer a 'new' on a function for later
    // Makes it possible to generate a unique signature for the
    // instance (see: .__id())
    // Meant to translate:
    // new Foo(a, b, c) into: applyInstance(Foo)(a, b, c)
    applyInstance: function(classFn, className) {
        // Don't wrap it if we're dealing with a built-in object (like RegExp)

        try {
            var funcName = (/^function\s*(\w+)/.exec(classFn) || [])[1];
            if (funcName && window[funcName] === classFn) {
                return classFn;
            }
        } catch(e) {}

        // Make sure a name is set for the class if one has not been set already
        if (!classFn.__name && className) {
            classFn.__name = className;
        }

        // Return a function for later execution.
        return function() {
            var args = arguments;

            // Create a temporary constructor function
            function Class() {
                classFn.apply(this, args);
            }

            // Copy the prototype
            Class.prototype = classFn.prototype;

            // Instantiate the dummy function
            var obj = new Class();

            // Point back to the original function
            obj.constructor = classFn;

            // Generate a semi-unique ID for the instance
            obj.__id = function() {
                return "new " + classFn.__name + "(" +
                    Output.stringifyArray(args) + ")";
            };

            // Keep track of the instances that have been instantiated
            if (Output.instances) {
                Output.instances.push(obj);
            }

            // Return the new instance
            return obj;
        };
    }
};

// TODO(jlfwong): Stop globalizing Output
window.Output = Output;


window.CanvasOutput = {
    // Canvas mouse events to track
    // Tracking: mousemove, mouseover, mouseout, mousedown, and mouseup
    trackedMouseEvents: ["move", "over", "out", "down", "up"],

    // Banned Properties
    // Prevent certain properties from being exposed
    bannedProps: {
        externals: true
    },

    // Methods that trigger the draw loop
    drawLoopMethods: ["draw", "mouseClicked", "mouseDragged", "mouseMoved",
        "mousePressed", "mouseReleased", "mouseScrolled", "mouseOver",
        "mouseOut", "touchStart", "touchEnd", "touchMove", "touchCancel",
        "keyPressed", "keyReleased", "keyTyped"],

    // During live coding all of the following state must be reset
    // when it's no longer used.
    liveReset: {
        background: [255, 255, 255],
        colorMode: [1],
        ellipseMode: [3],
        fill: [255, 255, 255],
        frameRate: [60],
        imageMode: [0],
        rectMode: [0],
        stroke: [0, 0, 0],
        strokeCap: ["round"],
        strokeWeight: [1],
        textAlign: [37, 0],
        textAscent: [9],
        textDescent: [12],
        textFont: ["Arial", 12],
        textLeading: [14],
        textSize: [12]
    },

    init: function(options) {
        this.config = options.config;

        this.$elem = $("#output-canvas");

        // If no canvas element is found we make a dummy one and render to it
        if (this.$elem.length === 0) {
            this.$elem = $("<canvas>")
                .attr("id", "output-canvas")
                .appendTo("body");
        }

        this.$elem.show();

        CanvasOutput.bind();

        CanvasOutput.reseedRandom();
        CanvasOutput.lastGrab = null;

        CanvasOutput.build(this.$elem[0]);

        // If a list of exposed properties hasn't been generated before
        if (!CanvasOutput.props) {
            // CanvasOutput.props holds the names of the properties which
            // are to be exposed by Processing.js to the user.
            var externalProps = CanvasOutput.props = {},

                // CanvasOutput.safeCalls holds the names of the properties
                // which are functions which appear to not have any
                // side effects when called.
                safeCalls = CanvasOutput.safeCalls = {};

            // Make sure that only certain properties can be manipulated
            for (var processingProp in Output.context) {
                // Processing.js has some "private" methods (beginning with __)
                // these shouldn't be exposed to the user.
                if (processingProp.indexOf("__") < 0) {
                    var value = Output.context[processingProp],
                        isFunction = (typeof value === "function");

                    // If the property is a function or begins with an uppercase
                    // character (as is the case for constants in Processing.js)
                    // or is height/width (overriding them breaks stuff)
                    // or is a key-related function (as in keyPressed)
                    // then the user should not be allowed to override the
                    // property (restricted by JSHINT).
                    externalProps[processingProp] =
                        !(/^[A-Z]/.test(processingProp) ||
                            processingProp === "height" ||
                            processingProp === "width" ||
                            processingProp === "key" ||
                            isFunction && processingProp.indexOf("key") < 0);

                    // Find the functions which could be safe to call
                    // (in that they have no side effects when called)
                    if (isFunction) {
                        try {
                            // Serialize the function into a string
                            var strValue = String(value);

                            // Determine if a function has any side effects
                            // (a "side effect" being something that changes
                            //  state in the Processing.js environment)
                            //  - If it's a native method then it doesn't have
                            //    any Processing side effects.
                            //  - Otherwise it's a Processing method so we need
                            //    to make sure it:
                            //      (1) returns a value,
                            //      (2) that it doesn't call any other
                            //          Processing functions, and
                            //      (3) doesn't instantiate any Processing
                            //          objects.
                            //    If all three of these are the case assume then
                            //    assume that there are no side effects.
                            if (/native code/.test(strValue) ||
                                /return /.test(strValue) &&
                                !/p\./.test(strValue) &&
                                !/new P/.test(strValue)) {
                                    safeCalls[processingProp] = true;
                            }
                        } catch (e) {}
                    }
                }
            }

            // PVector is actually safe, there are no obvious side effects
            safeCalls.PVector = true;

            // The one exception to the rule above is the draw function
            // (which is defined on init but CAN be overridden).
            externalProps.draw = true;
        }

        return this;
    },

    bind: function() {
        var offset = this.$elem.offset();

        // Go through all of the mouse events to track
        jQuery.each(CanvasOutput.trackedMouseEvents, function(i, name) {
            var eventType = "mouse" + name;

            // Track that event on the Canvas element
            CanvasOutput.$elem.bind(eventType, function(e) {
                // Only log if recording is occurring
                if (Output.recording) {
                    var action = {};

                    // Track the x/y coordinates of the event
                    // Set to a property with the mouse event name
                    action[name] = {
                        x: e.pageX - offset.left,
                        y: e.pageY - offset.top
                    };

                    // Log the command
                    Output.postParent({ log: action });
                }
            });

            // Handle the command during playback
            CanvasOutput.handlers[name] = function(e) {
                // Get the command data
                var action = e[name];

                // Build the clientX and clientY values
                var pageX = action.x + offset.left;
                var pageY = action.y + offset.top;
                var clientX = pageX - $(window).scrollLeft();
                var clientY = pageY - $(window).scrollTop();

                // Construct the simulated mouse event
                var evt = document.createEvent("MouseEvents");

                // See: https://developer.mozilla.org/en/DOM/
                //          event.initMouseEvent
                evt.initMouseEvent(eventType, true, true, window, 0,
                    0, 0, clientX, clientY,
                    false, false, false, false,
                    0, document.documentElement);

                // And execute it upon the canvas element
                CanvasOutput.$elem[0].dispatchEvent(evt);
            };
        });

        // Dynamically set the width and height based upon the size of the
        // window, which could be changed in the parent page
        $(window).on("resize", function() {
            var $window = $(window);
            var width = $window.width();
            var height = $window.height();

            if (width !== CanvasOutput.canvas.width ||
                height !== CanvasOutput.canvas.height) {
                // Set the canvas element to be the right size
                $("#output-canvas").width(width).height(height);

                // Set the Processing.js canvas to be the right size
                CanvasOutput.canvas.size(width, height);

                // Restart execution
                Output.restart();
            }
        });
    },

    // Handle recording playback
    handlers: {},

    build: function(canvas) {
        CanvasOutput.canvas = Output.context =
            new Processing(canvas, function(instance) {
                instance.draw = CanvasOutput.DUMMY;
            });

        $.extend(CanvasOutput.canvas, CanvasOutput.processing);

        this.config.runCurVersion("processing", CanvasOutput.canvas);

        CanvasOutput.clear();

        // Trigger the setting of the canvas size immediately
        $(window).resize();
    },

    imageCache: {},
    imagesCached: false,
    imageCacheStarted: false,
    imageHolder: null,

    // Load and cache all images that could be used in the environment
    // Right now all images are loaded as we don't have more details on
    // exactly which images will be required.
    // Execution is delayed once a getImage appears in the source code
    // and none of the images are cached. Execution begins once all the
    // images have loaded.
    cacheImages: function(userCode, callback) {
        // Grab all the image calls from the source code
        var images = userCode.match(/getImage\s*\(.*?\)/g);

        // Keep track of how many images have loaded
        var numLoaded = 0;

        // Insert the images into a hidden div to cause them to load
        // but not be visible to the user
        if (!CanvasOutput.imageHolder) {
            CanvasOutput.imageHolder = $("<div>")
                .css({
                    height: 0,
                    width: 0,
                    overflow: "hidden",
                    position: "absolute"
                })
                .appendTo("body");
        }

        // Keep track of when image files are loaded
        var loaded = function() {
            numLoaded += 1;

            // All the images have loaded so now execution can begin
            if (numLoaded === images.length) {
                callback();
            }
        };

        // Go through all the images and begin loading them
        _.each(images, function(file) {
            // Get the actual file name
            var fileMatch = /"([A-Za-z0-9_\/-]*?)"/.exec(file);

            // Skip if the image has already been cached
            // Or if the getImage call is malformed somehow
            if (CanvasOutput.imageCache[file] || !fileMatch) {
                return loaded();
            }

            file = fileMatch[1];

            // We only allow images from within a certain path
            var path = Output.imagesDir + file + ".png";

            // Load the image in the background
            var img = document.createElement("img");
            img.onload = loaded;
            img.src = path;
            CanvasOutput.imageHolder.append(img);

            // Cache the img element
            // TODO(jeresig): It might be good to cache the PImage here
            // but PImage may be mutable, so that might not work.
            CanvasOutput.imageCache[file] = img;
        });
    },

    // New methods and properties to add to the Processing instance
    processing: {
        // Global objects that we want to expose, by default
        Object: window.Object,
        RegExp: window.RegExp,
        Math: window.Math,
        Array: window.Array,
        String: window.String,

        // getImage: Retrieve a file and return a PImage holding it
        // Only allow access to certain approved files and display
        // an error message if a file wasn't found.
        // NOTE: Need to make sure that this will be a 'safeCall'
        getImage: function(file) {
            var cachedFile = CanvasOutput.imageCache[file];

            // Display an error message as the file wasn't located.
            if (!cachedFile) {
                return Output.handleError({ message:
                      $._("Image '%(file)s' was not found.", {file: file}) });
            }

            // Give the image a representative ID
            var img = new CanvasOutput.canvas.PImage(cachedFile);
            img.__id = function() {
                return "getImage('" + file + "')";
            };
            return img;
        },

        // Make sure that loadImage is disabled in favor of getImage
        loadImage: function(file) {
            Output.handleError({ message:
                "Use getImage instead of loadImage." });
        },

        // Make sure that requestImage is disabled in favor of getImage
        requestImage: function(file) {
            Output.handleError({ message:
                "Use getImage instead of requestImage." });
        },

        // Disable link method
        link: function() {
            Output.handleError({ message:
                $._("link() method is disabled.") });
        },

        // Basic console logging
        debug: function() {
            console.log.apply(console, arguments);
        },

        // Allow programs to have some control over the program running
        // Including being able to dynamically force execute of the tests
        // Or even run their own tests.
        Program: {
            settings: function() {
                return Output.settings || {};
            },

            // Force the program to restart (run again)
            restart: function() {
                Output.restart();
            },

            // Force the tests to run again
            runTests: function() {
                Output.test();
                return Output.testResults;
            },

            // Run a single test (specified by a function)
            // and send the results back to the parent frame
            runTest: function(name, fn) {
                if (arguments.length === 1) {
                    fn = name;
                    name = "";
                }

                var result = !!fn();

                Output.postParent({
                    results: {
                        code: Output.currentCode,
                        errors: [],
                        tests: [{
                            name: name,
                            state: result ? "pass" : "fail",
                            results: []
                        }]
                    },

                    pass: result
                });
            }
        }
    },

    DUMMY: function() {},

    preTest: function() {
        CanvasOutput.oldContext = Output.context;

        if (CanvasOutput.testingContext) {
            CanvasOutput.canvas = Output.context = CanvasOutput.testingContext;

        } else {
            CanvasOutput.testCanvas = document.createElement("canvas");
            CanvasOutput.build(CanvasOutput.testCanvas);
            CanvasOutput.testingContext = Output.context;
        }
    },

    postTest: function() {
        CanvasOutput.canvas = Output.context = CanvasOutput.oldContext;

        return CanvasOutput.testCanvas;
    },

    runTest: function(userCode, test, i) {
        // TODO(jeresig): Add in Canvas testing
        // Create a temporary canvas and a new processing instance
        // temporarily overwrite Output.context
        // Save the canvas for later and return that as the output
        // CanvasOutput.runCode(userCode);
    },

    runCode: function(userCode, globalContext, callback) {
        if (Output.globals.getImage) {
            CanvasOutput.cacheImages(userCode, runCode);

        } else {
            runCode();
        }

        function runCode() {
            if (window.Worker) {
                var context = {};

                _.each(Output.globals, function(val, global) {
                    var value = Output.context[global];
                    context[global] = (
                        typeof value === "function" || global === "Math" ?
                        "__STUBBED_FUNCTION__" :
                        (typeof value !== "object" || $.isPlainObject(value) ?
                             value :
                             {}));
                });

                Output.worker.exec(userCode, context, function(userCode) {
                    try {
                        CanvasOutput.injectCode(userCode, callback);

                    } catch (e) {
                        Output.handleError(e);
                        callback();
                    }
                });

            } else {
                CanvasOutput.injectCode(userCode, callback);
            }
        }
    },

    /*
     * Checks to see if a draw loop-introducing method currently
     * exists, or did exist, in the user's program.
     */
    hasOrHadDrawLoop: function() {
        for (var i = 0, l = this.drawLoopMethods.length; i < l; i++) {
            var name = this.drawLoopMethods[i];
            if (Output.globals[name] ||
                CanvasOutput.lastGrab && CanvasOutput.lastGrab[name]) {
                    return true;
            }
        }

        return false;
    },

    /*
     * Checks to see if a draw loop method is currently defined in the
     * user's program (defined is equivalent to !undefined or if it's
     * just a stub program.)
     */
    drawLoopMethodDefined: function() {
        for (var i = 0, l = this.drawLoopMethods.length; i < l; i++) {
            var name = this.drawLoopMethods[i];
            if (Output.context[name] !== CanvasOutput.DUMMY &&
                Output.context[name] !== undefined) {
                    return true;
            }
        }

        return false;
    },

    /*
     * Injects code into the live Processing.js execution.
     *
     * The first time the code is injected, or if no draw loop exists, all of
     * the code is just executed normally using Output.exec().
     *
     * For all subsequent injections the following workflow takes place:
     *   - The code is executed but with all functions that have side effects
     *     replaced with empty function placeholders.
     *     - During this execution a context is set (wrapping the code with a
     *       with(){...}) that intentionally gobbles up all globally-exposed
     *       variables that the user has defined. For example, this code:
     *       var x = 10, y = 20; will result in a grabAll object of:
     *       {"x":10,"y":20}. Only user defined variables are captured.
     *     - Additionally all calls to side effect-inducing functions are logged
     *       for later to the fnCalls array (this includes a log of the function
     *       name and its arguments).
     *   - When the injection occurs a number of pieces need to be inserted into
     *     the live code.
     *     - First, all side effect-inducing function calls are re-run. For
     *       example a call to background(0, 0, 0); will result in the code
     *       background(0, 0, 0); being run again.
     *     - Second any new, or changed, variables will be re-inserted. Given
     *       the x/y example from above, let's say the user changes y to 30,
     *       thus the following code will be executed: var y = 30;
     *     - Third, any variables that existed on the last run of the code but
     *       no longer exist will be deleted. For example, if the ", y = 20" was
     *       removed from the above example the following would be executed:
     *       "delete y;" If the draw function was deleted then the output will
     *       need to be cleared/reset as well.
     *     - Finally, if any draw state was reset to the default from the last
     *       inject to now (for example there use to be a 'background(0, 0, 0);'
     *       but now there is none) then we'll need to reset that draw state to
     *       the default.
     *   - All of these pieces of injected code are collected together and are
     *     executed in the context of the live Processing.js environment.
     */
    injectCode: function(userCode, callback) {
        // Holds all the global variables extracted from the user's code
        var grabAll = {},

            // Holds all the function calls that came from function calls that
            // have side effects
            fnCalls = [],

            // Is true if the code needs to be completely re-run
            // This is true when instantiated objects that need
            // to be reinitialized.
            rerun = false,

            // Keep track of which function properties need to be
            // reinitialized after the constructor has been changed
            reinit = {},

            // A map of all global constructors (used for later
            // reinitialization of instances upon a constructor change)
            constructors = {},

            // The properties exposed by the Processing.js object
            externalProps = CanvasOutput.props,

            // The code string to inject into the live execution
            inject = "";

        // Grab all object properties and prototype properties from
        // all objects and function prototypes
        CanvasOutput.grabObj = {};

        // Extract a list of instances that were created using applyInstance
        Output.instances = [];

        // Replace all calls to 'new Something' with
        // CanvasOutput.newInstance(Something)()
        // Used for keeping track of unique instances
        userCode = userCode && userCode.replace(/\bnew[\s\n]+([A-Z]{1,2}[a-z0-9_]+)([\s\n]*\()/g,
            "Output.applyInstance($1,'$1')$2");

        // If we have a draw function then we need to do injection
        // If we had a draw function then we still need to do injection
        // to clean up any live variables.
        var hasOrHadDrawLoop = CanvasOutput.hasOrHadDrawLoop();

        // Only do the injection if we have or had a draw loop
        if (hasOrHadDrawLoop) {
            // Go through all the globally-defined variables (this is determined by
            // a prior run-through using JSHINT) and ensure that they're all defined
            // on a single context. Also make sure that any function calls that have
            // side effects are instead replaced with placeholders that collect a
            // list of all functions called and their arguments.
            // TODO(jeresig): See if we can move this off into the worker thread to
            //                save an execution.
            _.each(Output.globals, function(val, global) {
                var value = Output.context[global];
                // Expose all the global values, if they already exist although even
                // if they are undefined, the result will still get sucked into
                // grabAll) Replace functions that have side effects with
                // placeholders (for later execution)
                grabAll[global] = ((typeof value === "function" &&
                        !CanvasOutput.safeCalls[global]) ?
                    function() { fnCalls.push([global, arguments]); return 0; } :
                    value);
            });

            // Run the code with the grabAll context. The code is run with no side
            // effects and instead all function calls and globally-defined variable
            // values are extracted. Abort injection on a runtime error.
            if (!Output.exec(userCode, grabAll)) {
                return;
            }

            // Attach names to all functions
            _.each(grabAll, function(val, prop) {
                if (typeof val === "function") {
                    val.__name = prop;
                }
            });

            // Keep track of all the constructor functions that may
            // have to be reinitialized
            for (var i = 0, l = Output.instances.length; i < l; i++) {
                constructors[Output.instances[i].constructor.__name] = true;
            }

            // The instantiated instances have changed, which means that
            // we need to re-run everything.
            if (Output.oldInstances &&
                    Output.stringifyArray(Output.oldInstances) !==
                    Output.stringifyArray(Output.instances)) {
                rerun = true;
            }

            // Reset the instances list
            Output.oldInstances = Output.instances;
            Output.instances = null;

            // Look for new top-level function calls to inject
            for (var i = 0; i < fnCalls.length; i++) {
                // Reconstruction the function call
                var args = Array.prototype.slice.call(fnCalls[i][1]);
                inject += fnCalls[i][0] + "(" +
                    Output.stringifyArray(args) + ");\n";
            }

            // We also look for newly-changed global variables to inject
            _.each(grabAll, function(val, prop) {
                // Turn the result of the extracted value into
                // a nicely-formatted string
                try {
                    grabAll[prop] = Output.stringify(grabAll[prop]);

                    // Check to see that we've done an inject before and that
                    // the property wasn't one that shouldn't have been
                    // overridden, and that either the property wasn't in the
                    // last extraction or that the value of the property has
                    // changed.
                    if (CanvasOutput.lastGrab &&
                            externalProps[prop] !== false &&
                            (!(prop in CanvasOutput.lastGrab) ||
                            grabAll[prop] !== CanvasOutput.lastGrab[prop])) {

                        // If we hit a function we need to re-execute the code
                        // by injecting it. Preserves the closure.
                        if (typeof val === "function") {
                            // If the constructor function was changed and an
                            // instance of the function exists, then we need to
                            // re-run all the code from start
                            if (constructors[prop]) {
                                rerun = true;
                            }

                            // Remember that this function has been
                            // reinitialized for later (in case it has
                            // properties that need to be re-injected)
                            reinit[prop] = true;

                            inject += "var " + prop + " = " +
                                grabAll[prop] + ";\n";

                            // Give the function a name as well
                            inject += prop + ".__name = '" + prop + "';\n";

                        // Otherwise it's ok to inject it directly into the
                        // new environment
                        } else {
                            Output.context[prop] = val;
                        }
                    }

                    // For each function we also need to make sure that we
                    // extract all of the object and prototype properties
                    // (Since they won't be detected normally)
                    if (typeof val === "function" &&
                            externalProps[prop] !== false) {
                        CanvasOutput.objectExtract(prop, val);
                        CanvasOutput.objectExtract(prop, val, "prototype");
                    }

                // The variable contains something that can't be serialized
                // (such as instantiated objects) and so we need to extract it
                } catch (e) {
                    CanvasOutput.objectExtract(prop, val);
                }
            });

            // Insertion of new object properties
            _.each(CanvasOutput.grabObj, function(val, objProp) {
                var baseName = /^[^.[]*/.exec(objProp)[0];

                // If we haven't done an extraction before or if the value
                // has changed, or if the function was reinitialized,
                // insert the new value.
                if (!CanvasOutput.lastGrabObj ||
                        CanvasOutput.lastGrabObj[objProp] !== val ||
                        reinit[baseName]) {
                    inject += objProp + " = " + val + ";\n";
                }
            });

            // Deletion of old object properties
            for (var objProp in CanvasOutput.lastGrabObj) {
                if (!(objProp in CanvasOutput.grabObj)) {
                    inject += "delete " + objProp + ";\n";
                }
            }

            // Make sure that deleted variables are removed.
            // Go through all the previously-defined properties and check to see
            // if they've been removed.
            for (var oldProp in CanvasOutput.lastGrab) {
                // If the property doesn't exist in this grab extraction and
                // the property isn't a Processing.js-defined property
                // (e.g. don't delete 'background') but allow the 'draw'
                // function to be deleted (as it's user-defined)
                if (!(oldProp in grabAll) &&
                        (!(oldProp in CanvasOutput.props) ||
                            oldProp === "draw")) {
                    // Create the code to delete the variable
                    inject += "delete Output.context." + oldProp + ";\n";

                    // If the draw function was deleted we also
                    // need to clear the display
                    if (oldProp === "draw") {
                        CanvasOutput.clear();
                    }
                }
            }
        }

        // Make sure the matrix is always reset
        Output.context.resetMatrix();

        // Seed the random number generator with the same seed
        CanvasOutput.restoreRandomSeed();

        // Make sure the various draw styles are also reset
        // if they were just removed
        if (CanvasOutput.lastGrab) {
            for (var prop in CanvasOutput.liveReset) {
                if (!Output.globals[prop] && CanvasOutput.lastGrab[prop]) {
                    CanvasOutput.canvas[prop].apply(CanvasOutput.canvas,
                        CanvasOutput.liveReset[prop]);
                }
            }
        }

        // Re-run the entire program if we don't need to inject the changes
        // (Injection only needs to occur if a draw loop exists and if a prior
        // run took place)
        if (!hasOrHadDrawLoop || !CanvasOutput.drawLoopMethodDefined() ||
                !CanvasOutput.lastGrab || rerun) {
            // Clear the output if no injection is occurring
            CanvasOutput.clear();

            // Force a call to the draw function to force checks for instances
            // and to make sure that errors in the draw loop are caught.
            if (Output.globals.draw) {
                userCode += "\ndraw();";
            }

            // Run the code as normal
            Output.exec(userCode, Output.context);

            // Attach names to all functions
            _.each(Output.globals, function(val, prop) {
                if (typeof val === "function") {
                    val.__name = prop;
                }
            });

        // Otherwise if there is code to inject
        } else if (inject) {
            // Force a call to the draw function to force checks for instances
            // and to make sure that errors in the draw loop are caught.
            if (Output.globals.draw) {
                inject += "\ndraw();";
            }

            // Execute the injected code
            Output.exec(inject, Output.context);
        }

        // Need to make sure that the draw function is never deleted
        // (Otherwise Processing.js starts to freak out)
        if (!Output.context.draw) {
            Output.context.draw = CanvasOutput.DUMMY;
        }

        // Save the extracted variables for later comparison
        if (hasOrHadDrawLoop) {
            CanvasOutput.lastGrab = grabAll;
            CanvasOutput.lastGrabObj = CanvasOutput.grabObj;
        }

        if (callback) {
            try {
                callback();
            } catch(e) {
                // Ignore any errors that were generated in the callback
                // NOTE(jeresig): This is needed because Mocha throws errors
                // when it encounters an assertion error, which causes this
                // to go haywire, generating an in-code error.
            }
        }
    },

    // Extract an object's properties for dynamic insertion
    objectExtract: function(name, obj, proto) {
        // Make sure the object actually exists before we try
        // to inject stuff into it
        if (!Output.context[name]) {
            Output.context[name] = $.isArray(obj) ? [] : {};
        }

        // A specific property to inspect of the object
        // (which will probably be the .prototype)
        if (proto) {
            obj = obj[proto];
        }

        // Go through each property of the object
        for (var objProp in obj) {
            // Make sure the property is actually on the object and that
            // it isn't a "private" property (e.g. __name or __id)
            if (obj.hasOwnProperty(objProp) && objProp.indexOf("__") < 0) {
                // Turn the result of the extracted function into
                // a nicely-formatted string (maintains the closure)
                if (typeof obj[objProp] === "function") {
                    CanvasOutput.grabObj[name + (proto ? "." + proto : "") +
                            "['" + objProp + "']"] =
                        Output.stringify(obj[objProp]);

                // Otherwise we should probably just inject the value directly
                } else {
                    // Get the object that we'll be injecting into
                    var outputObj = Output.context[name];

                    if (proto) {
                        outputObj = outputObj[proto];
                    }

                    // Inject the object
                    outputObj[objProp] = obj[objProp];
                }
            }
        }
    },

    restart: function() {
        CanvasOutput.lastGrab = null;
        CanvasOutput.lastGrabObj = null;

        // Grab a new random seed
        CanvasOutput.reseedRandom();

        // Reset frameCount variable on restart
        CanvasOutput.canvas.frameCount = 0;

        Output.runCode(Output.getUserCode());
    },

    testContext: {
        testCanvas: function(name, fn) {
            Output.testContext.test(name, fn, CanvasOutput);
        }
    },

    toggle: function(doToggle) {
        if (doToggle) {
            CanvasOutput.start();

        } else {
            CanvasOutput.stop();
        }
    },

    stop: function() {
        CanvasOutput.canvas.noLoop();
    },

    start: function() {
        CanvasOutput.canvas.loop();
    },

    clear: function() {
        for (var prop in CanvasOutput.liveReset) {
            if (CanvasOutput.liveReset.hasOwnProperty(prop)) {
                CanvasOutput.canvas[prop].apply(CanvasOutput.canvas,
                    CanvasOutput.liveReset[prop]);
            }
        }
    },

    seed: null,

    reseedRandom: function() {
        CanvasOutput.seed = Math.floor(Math.random() * 4294967296);
    },

    restoreRandomSeed: function() {
        CanvasOutput.canvas.randomSeed(CanvasOutput.seed);
    },

    kill: function() {
        CanvasOutput.canvas.exit();
        CanvasOutput.$elem.hide();
    }
};

Output.registerOutput(CanvasOutput);

// This adds html tags around quoted lines so they can be formatted
Output.prettify = function(str) {
    str = str.split("\"");
    var htmlString = "";
    for (var i = 0; i < str.length; i++) {
        if (i % 2 === 0) {
            //regular text
            htmlString += "<span class=\"text\">" + str[i] + "</span>";
        } else {
            // text in quotes
            htmlString += "<span class=\"quote\">" + str[i] + "</span>";
        }
    }
    return htmlString;
};

Output.clean = function(str) {
    return String(str).replace(/</g, "&lt;");
};

var PooledWorker = function(filename, onExec) {
    this.pool = [];
    this.curID = 0;
    this.filename = filename;
    this.onExec = onExec || function() {};
};

PooledWorker.prototype.getURL = function() {
    return Output.execDir + this.filename +
        "?cachebust=B" + (new Date()).toDateString();
};

PooledWorker.prototype.getWorkerFromPool = function() {
    // NOTE(jeresig): This pool of workers is used to cut down on the
    // number of new web workers that we need to create. If the user
    // is typing really fast, or scrubbing numbers, it has the
    // potential to use a lot of workers. We want to re-use as many of
    // them as possible as their creation can be expensive. (Chrome
    // seems to freak out, use lots of memory, and sometimes crash.)
    var worker = this.pool.shift();
    if (!worker) {
        worker = new window.Worker(this.getURL());
    }
    // Keep track of what number worker we're running so that we know
    // if any new hint workers have been started after this one
    this.curID += 1;
    worker.id = this.curID;
    return worker;
};

/* Returns true if the passed in worker is the most recently created */
PooledWorker.prototype.isCurrentWorker = function(worker) {
    return this.curID === worker.id;
};

PooledWorker.prototype.addWorkerToPool = function(worker) {
    // Return the worker back to the pool
    this.pool.push(worker);
};

PooledWorker.prototype.exec = function() {
    this.onExec.apply(this, arguments);
};

/*
 * The worker that matches with StructuredJS.
 */
Output.testWorker = new PooledWorker(
    "test-worker.js",
    function(code, validate, errors, callback) {
        var self = this;

        Output.testing = true;

        // Generic function to handle results of testing
        var processTesterResults = function(tester) {
            Output.testResults = tester.testResults;
            Output.errors.concat(tester.errors);
            Output.testing = false;
        };

        // If there's no Worker or support *or* there
        //  are syntax errors, we do the testing in
        //  the browser instead.
        // We do it in-browser in the latter case as
        //  the code is often in a syntax-error state,
        //  and the browser doesn't like creating that many workers,
        //  and the syntax error tests that we have are fast.
        if (!window.Worker || errors.length > 0) {
            OutputTester.test(code, validate, errors);
            processTesterResults(OutputTester);
            callback();
            return;
        }

        var worker = this.getWorkerFromPool();

        worker.onmessage = function(event) {
            if (event.data.type === "test") {
                if (self.isCurrentWorker(worker)) {
                    var data = event.data.message;
                    processTesterResults(data);
                    callback();
                }
                self.addWorkerToPool(worker);
            }
        };

        worker.postMessage({
            code: code,
            validate: validate,
            errors: errors,
            externalsDir: Output.externalsDir
        });
    }
);

/*
 * The worker that analyzes the user's code.
 */
Output.hintWorker = new PooledWorker(
    "jshint-worker.js",
    function(hintCode, callback) {
        // Fallback in case of no worker support
        if (!window.Worker) {
            JSHINT(hintCode);
            callback(JSHINT.data(), JSHINT.errors);
            return;
        }

        var self = this;

        var worker = this.getWorkerFromPool();

        worker.onmessage = function(event) {
            if (event.data.type === "jshint") {
                // If a new request has come in since the worker started
                // then we just ignore the results and don't fire the callback
                if (self.isCurrentWorker(worker)) {
                    var data = event.data.message;
                    callback(data.hintData, data.hintErrors);
                }
                self.addWorkerToPool(worker);
            }
        };

        worker.postMessage({
            code: hintCode,
            externalsDir: Output.externalsDir
        });
    }
);


Output.worker = {
    timeout: null,
    running: false,

    init: function() {
        var worker = Output.worker.worker =
            new window.Worker(Output.execDir +
                "worker.js?cachebust=" + (new Date()).toDateString());

        worker.onmessage = function(event) {
            // Execution of the worker has begun so we wait for it...
            if (event.data.execStarted) {
                // If the thread doesn't finish executing quickly, kill it and
                // don't execute the code
                Output.worker.timeout = window.setTimeout(function() {
                    Output.worker.stop();
                    Output.worker.done({message:
                        $._("The program is taking too long to run. Perhaps " +
                            "you have a mistake in your code?")});
                }, 500);

            } else if (event.data.type === "end") {
                Output.worker.done();

            } else if (event.data.type === "error") {
                Output.worker.done({message: event.data.message});
            }
        };

        worker.onerror = function(event) {
            event.preventDefault();
            Output.worker.done(event);
        };
    },

    exec: function(userCode, context, callback) {
        // Stop old worker from finishing
        if (Output.worker.running) {
            Output.worker.stop();
        }

        if (!Output.worker.worker) {
            Output.worker.init();
        }

        Output.worker.done = function(e) {
            Output.worker.running = false;

            Output.worker.clearTimeout();

            if (e) {
                Output.handleError(e);

                // Make sure that the caller knows that we're done
                callback();
            } else {
                callback(userCode);
            }
        };

        try {
            Output.worker.worker.postMessage({
                code: userCode,
                context: context
            });

            Output.worker.running = true;
        } catch (e) {
            // TODO: Object is too complex to serialize, try to find
            // an alternative workaround
            Output.worker.done();
        }
    },

    /*
     * Stop long-running execution detection, if still going.
     */
    clearTimeout: function() {
        if (Output.worker.timeout !== null) {
            window.clearTimeout(Output.worker.timeout);
            Output.worker.timeout = null;
        }
    },

    /*
     * Calling this will stop execution of any currently running worker
     * Will return true if a worker was running, false if one was not.
     */
    stop: function() {
        Output.worker.clearTimeout();

        if (Output.worker.worker) {
            Output.worker.worker.terminate();
            Output.worker.worker = null;
            return true;
        }

        return false;
    }
};

if (window !== window.top && Object.freeze &&
        Object.getOwnPropertyDescriptor) {
    // Freezing the whole window, and more specifically window.location, causes
    // a redirect on Safari 6 and 7.
    // Test case: http://ejohn.org/files/freeze-test.html

    // Note that freezing the window object in any way in our test environment
    // will have no side effect, and will remain mutable in every way.

    // Manually freeze everything except for location for the object's own
    // properties. The Object prototype chain will be frozen just after.
    for (var prop in window) {
        // Could be combined into check below, but lint requires it here :(
        if (window.hasOwnProperty(prop)) {
            // The property descriptor check is needed to avoid some nasty
            // console messages when trying to freeze non configurable
            // properties.
            try {
                var propDescriptor = Object.getOwnPropertyDescriptor(window, prop);
                if (!propDescriptor || propDescriptor.configurable) {
                    Object.defineProperty(window, prop, {
                        value: window[prop],
                        writable: false,
                        configurable: false
                    });
                }
            } catch(e) {
                // Couldn't access property for permissions reasons,
                //  like window.frame
                // Only happens on prod where it's cross-origin
            }
        }
    }

    // Prevent further changes to property descriptors and prevent
    // extensibility on window.
    var userAgent = navigator.userAgent.toLowerCase();
    if (/chrome/.test(userAgent)) {
        Object.freeze(window.location);
        Object.freeze(window);
    } else if (/safari/.test(userAgent)) {
        Object.seal(window);
    } else {
        // On other browsers only freeze if we can, on Firefox it causes an
        // error because window is not configurable.
        var propDescriptor = Object.getOwnPropertyDescriptor(window);
        if (!propDescriptor || propDescriptor.configurable) {
            Object.freeze(window);
        }
    }

    // Completely lock down window's prototype chain
    Object.freeze(Object.getPrototypeOf(window));
}

})();
