/**
 * WebpageOutput
 * It creates an iframe on the same domain, and uses
 * document.write() to update the HTML each time.
 * It also includes the StateScrubber that ensures
 * that the JS in a page always gets executed in a fresh
 * global context, and it retrofits the JS with parsing/injection
 * so that it will stop an infinite loop from running in the browser.
 * Because the host iframe is typically hosted an another domain
 * so that it can be sandboxed from the main domain,
 * it communicates via postMessage() with liveEditor.
 */
window.WebpageOutput = Backbone.View.extend({
    initialize: function(options) {
        this.config = options.config;
        this.output = options.output;
        this.externalsDir = options.externalsDir;

        this.tester = new WebpageTester(options);

        this.render();

        // Load Webpage config options
        this.config.runCurVersion("webpage", this);

        // Set up infinite loop protection
        this.loopProtector = new LoopProtector(this.infiniteLoopCallback.bind(this));
        this.$frame.contentWindow.KAInfiniteLoopProtect = 
            this.loopProtector.KAInfiniteLoopProtect;

        // Do this at the end so variables I add to the global scope stay
        // i.e.  KAInfiniteLoopProtect
        this.stateScrubber = new StateScrubber(this.$frame.contentWindow);
    },

    render: function() {
        this.$el.empty();
        this.$frame = $("<iframe>")
            .css({width: "100%", height: "100%", border: "0"})
            .appendTo(this.el)
            .show()[0];
        this.frameDoc = this.$frame.contentDocument;
    },

    getScreenshot: function(screenshotSize, callback) {
        html2canvas(this.frameDoc.body, {
            onrendered: function(canvas) {
                var width = screenshotSize;
                var height = (screenshotSize / canvas.width) * canvas.height;

                // We want to resize the image to a thumbnail,
                // which we can do by creating a temporary canvas
                var tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = screenshotSize;
                tmpCanvas.height = screenshotSize;
                tmpCanvas.getContext("2d").drawImage(
                    canvas, 0, 0, width, height);

                // Send back the screenshot data
                callback(tmpCanvas.toDataURL("image/png"));
            }
        });
    },

    infiniteLoopError: {
        text: $._("Your javascript is taking too long to run. " +
                    "Perhaps you have a mistake in your code?"),
        type: "error",
        source: "timeout",
    },

    infiniteLoopCallback:  function() {
        this.output.postParent({
            results: {
                code: this.output.currentCode,
                errors: [this.infiniteLoopError]
            }
        });
        this.KA_INFINITE_LOOP = true;
    },

    lint: function(userCode, callback) {
        this.userCode = userCode;
        userCode = userCode || "";

        // Lint the user's code, returning any errors in the callback
        var results = {};
        try {
            results = Slowparse.HTML(document, userCode, {
                scriptPreprocessor: this.loopProtector.protect.bind(this.loopProtector),
                disableTags: ["audio", "video", "iframe", "embed", "object"]
            });
        } catch (e) {
            if (window.console) {
                console.warn(e);
            }
            results.error = {
                type: "UNKNOWN_SLOWPARSE_ERROR"
            };
        }

        this.slowparseResults = results;

        if (results.error) {
            var pos = results.error.cursor || 0;
            var previous = userCode.slice(0, pos);
            var column = pos - previous.lastIndexOf("\n") - 1;
            var row = (previous.match(/\n/g) || []).length;

            return callback([{
                row: row,
                column: column,
                text: this.getLintMessage(results.error),
                type: "error",
                source: "slowparse",
                lint: results.error,
                priority: 2
            }]);
        }

        callback([]);
    },

    flattenError: function(plainError, error, base) {
        error = error || {};
        base = base || "";

        for (var prop in plainError) {
            if (plainError.hasOwnProperty(prop)) {
                var flatName = (base ? base + "_" + prop : prop);
                if (typeof plainError[prop] === "object") {
                    this.flattenError(plainError[prop], error, flatName);
                } else {
                    error[flatName] = plainError[prop];
                }
            }
        }

        return error;
    },

    getLintMessage: function(plainError) {
        var error = this.flattenError(plainError);

        // Mostly borrowed from:
        // https://github.com/mozilla/thimble.webmaker.org/blob/master/locale/en_US/thimble-dialog-messages.json
        return ({
            ATTRIBUTE_IN_CLOSING_TAG: $._("A closing \"&lt;/%(closeTag_name)s&gt;\" tag cannot contain any attributes.", error),
            CLOSE_TAG_FOR_VOID_ELEMENT: $._("You have a closing \"&lt;/%(closeTag_name)s&gt;\" tag for a void element (and void elements don't need to be closed).", error),
            CSS_MIXED_ACTIVECONTENT: $._("You have a css property \"%(cssProperty_property)s\" with a \"url()\" value that currently points to an insecure resource.", error),
            EVENT_HANDLER_ATTR_NOT_ALLOWED: $._("Sorry, but security restrictions on this site prevent you from using the \"%(attribute_name_value)s\" JavaScript event handler attribute.", error),
            HTML_CODE_IN_CSS_BLOCK: $._("Did you put HTML code inside a CSS area?", error),
            HTTP_LINK_FROM_HTTPS_PAGE: $._("The \"&lt;%(openTag_name)s&gt;\" tag's \"%(attribute_name_value)s\" attribute currently points to an insecure resource.", error),
            INVALID_ATTR_NAME: $._("The attribute name \"%(attribute_name_value)s\" is not permitted under HTML5 naming conventions.", error),
            UNSUPPORTED_ATTR_NAMESPACE: $._("The attribute \"%(attribute_name_value)s\" uses an attribute namespace that is not permitted under HTML5 conventions.", error),
            MULTIPLE_ATTR_NAMESPACES: $._("The attribute \"%(attribute_name_value)s\" has multiple namespaces. Check your text and make sure there's only a single namespace prefix for the attribute.", error),
            INVALID_CSS_PROPERTY_NAME: $._("The CSS property \"%(cssProperty_property)s\" does not exist.", error),
            INVALID_TAG_NAME: $._("A \"&lt;\" character appears to be the beginning of a tag, but is not followed by a valid tag name. If you want a \"&lt;\" to appear on your Web page, try using \"&amp;lt;\" instead. Otherwise, check your spelling.", error),
            JAVASCRIPT_URL_NOT_ALLOWED: $._("Sorry, but security restrictions on this site prevent you from using the \"javascript:\" URL.", error),
            MISMATCHED_CLOSE_TAG: $._("You have a closing \"&lt;/%(closeTag_name)s&gt;\" tag that doesn't pair with the opening \"&lt;%(openTag_name)s&gt;\" tag. This is likely due to a missing or misordered \"&lt;/%(openTag_name)s&gt;\" tag.", error),
            MISSING_CSS_BLOCK_CLOSER: $._("You're missing either a \"}\" or another \"property:value;\" pair following \"%(cssValue_value)s\".", error),
            MISSING_CSS_BLOCK_OPENER: $._("You're missing the \"{\" after \"%(cssSelector_selector)s\".", error),
            MISSING_CSS_PROPERTY: $._("You're missing property for \"%(cssSelector_selector)s\".", error),
            MISSING_CSS_SELECTOR: $._("You're missing either a new CSS selector or the \"&lt;/style&gt;\" tag.", error),
            MISSING_CSS_VALUE: $._("You're missing value for \"%(cssProperty_property)s\".", error),
            SCRIPT_ELEMENT_NOT_ALLOWED: $._("Sorry, but security restrictions on this site prevent you from using \"&lt;script&gt;\" tags.", error),
            ELEMENT_NOT_ALLOWED: $._("Sorry, but security restrictions on this site prevent you from using \"&lt;%(openTag_name)s&gt;\" tags.", error),
            SELF_CLOSING_NON_VOID_ELEMENT: $._("The \"&lt;%(name)s&gt;\" tag can't be self-closed, because \"&lt;%(name)s&gt;\" is not a void element; it must be closed with a separate \"&lt;/%(name)s&gt;\" tag.", error),
            UNCAUGHT_CSS_PARSE_ERROR: $._("A parse error occurred outside expected cases: \"%(error_msg)s\"", error),
            UNCLOSED_TAG: $._("It looks like your \"&lt;%(openTag_name)s&gt;\" tag never closes.", error),
            UNEXPECTED_CLOSE_TAG: $._("You have a closing \"&lt;/%(closeTag_name)s&gt;\" tag that doesn't pair with any matching opening tags.", error),
            UNFINISHED_CSS_PROPERTY: $._("The CSS property \"%(cssProperty_property)s\" is missing a \":\"", error),
            UNFINISHED_CSS_SELECTOR: $._("The CSS selector \"%(cssSelector_selector)s\" needs to be followed by \"{\"", error),
            UNFINISHED_CSS_VALUE: $._("The CSS value \"%(cssValue_value)s\" still needs to be finalized with \";\"", error),
            UNKOWN_CSS_KEYWORD: $._("The CSS @keyword \"%(cssKeyword_value)s\" does not match any known @keywords.", error),
            UNQUOTED_ATTR_VALUE: $._("Make sure your attribute value starts with an opening double quote.", error),
            UNTERMINATED_ATTR_VALUE: $._("It looks like your \"&lt;%(openTag_name)s&gt;\" tag's \"%(attribute_name_value)s\" attribute has a value that doesn't end with a closing double quote.", error),
            UNTERMINATED_CLOSE_TAG: $._("It looks like your closing \"&lt;/%(closeTag_name)s&gt;\" tag doesn't end with a \"&gt;\".", error),
            UNTERMINATED_COMMENT: $._("It looks like your comment doesn't end with a \"--&gt;\".", error),
            UNTERMINATED_CSS_COMMENT: $._("It looks like your CSS comment doesn't end with a \"*/\".", error),
            UNTERMINATED_OPEN_TAG: $._("It looks like your opening \"&lt;%(openTag_name)s&gt;\" tag doesn't end with a \"&gt;\".", error),
            UNKNOWN_SLOWPARSE_ERROR: $._("Something's wrong with the HTML, but we're not sure what."),
            JAVASCRIPT_ERROR: $._("Javascript Error:\n\"%(message)s\"", error)
        })[error.type];
    },

    initTests: function(validate) {
        if (!validate) {
            return;
        }

        try {
            var code = "with(arguments[0]){\n" + validate + "\n}";
            (new Function(code)).apply({}, this.tester.testContext);
        } catch (e) {
            return e;
        }
    },

    test: function(userCode, tests, errors, callback) {
        var errorCount = errors.length;

        _.extend(this.tester.testContext, {
            $doc: $(this.frameDoc),
            // Append to a div because jQuery doesn't work on a document fragment
            $docSP: $("<div>").append(this.slowparseResults.document),
            cssRules: this.slowparseResults.rules
        });

        this.tester.test(userCode, tests, errors,
            function(errors, testResults) {
                if (errorCount !== errors.length) {
                    // Note: Scratchpad challenge checks against the exact
                    // translated text "A critical problem occurred..." to
                    // figure out whether we hit this case.
                    var message = $._("Error: %(message)s",
                        {message: errors[errors.length - 1].message});
                    // TODO(jeresig): Find a better way to show this
                    this.output.$el.find(".test-errors").text(message).show();
                    this.tester.testContext.assert(false, message,
                        $._("A critical problem occurred in your program " +
                            "making it unable to run."));
                }

                callback(errors, testResults);
            }.bind(this));
    },

    postProcessing: function(oldPageTitle) {
        var self = this;
        $(this.frameDoc).on("mouseup", "a", function() {
            var url = $(this).attr("href");
            if (url[0] !== "#") {
                self.output.postParent({
                    action: "link-click",
                    url: url
                });
            }
            return false;
        });

        var titleTag = $(this.frameDoc).find("head > title");
        var title = titleTag.first().text();
        if (titleTag.length > 0 && this.oldPageTitle !== title) {
            this.oldPageTitle = title;
            self.output.postParent({
                action: "page-info",
                title: title
            });
        }
    },

    runCode: function(codeObj, callback) {
        this.stateScrubber.clearAll();
        this.KA_INFINITE_LOOP = false;
        this.frameDoc.open();
        this.frameDoc.write(this.slowparseResults.code);
        this.frameDoc.close();

        this.postProcessing();

        if (this.KA_INFINITE_LOOP) {
            callback([this.infiniteLoopError]);
        } else {
            callback([]);
        }
        
    },

    clear: function() {
        // Clear the output
    },

    kill: function() {
        // Completely stop and clear the output
    }
});

LiveEditorOutput.registerOutput("webpage", WebpageOutput);

