window.WebpageOutput = Backbone.View.extend({
    initialize: function(options) {
        this.config = options.config;
        this.output = options.output;
        this.externalsDir = options.externalsDir;

        this.tester = new WebpageTester(options);

        this.render();

        // Load Webpage config options
        this.config.runCurVersion("webpage", this);
    },

    render: function() {
        this.$el.empty();
        this.$frame = $("<iframe>")
            .css({width: "100%", height: "100%", border: "0"})
            .appendTo(this.el)
            .show();
    },

    getDocument: function() {
        return this.$frame[0].contentWindow.document;
    },

    getScreenshot: function(screenshotSize, callback) {
        html2canvas(this.getDocument().body, {
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

    lint: function(userCode, callback) {
        this.userDOM = null;
        userCode = userCode || "";

        // Lint the user's code, returning any errors in the callback
        var results = Slowparse.HTML(this.getDocument(), userCode, {
            disallowActiveAttributes: true,
            noScript: true,
            disableTags: ["audio", "video", "iframe", "embed", "object"]
        });

        if (results.error) {
            var pos = results.error.cursor;
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

        this.userDOM = document.createElement("div");
        this.userDOM.appendChild(results.document);

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
            CLOSE_TAG_FOR_VOID_ELEMENT: $._("A closing \"&lt;/%(closeTag_name)s&gt;\" tag is for a void element (that is, an element that doesn't need to be closed).", error),
            CSS_MIXED_ACTIVECONTENT: $._("A css property \"%(cssProperty_property)s\" has a \"url()\" value that currently points to an insecure resource.", error),
            EVENT_HANDLER_ATTR_NOT_ALLOWED: $._("Sorry, but security restrictions on this site prevent you from using the \"%(attribute_name_value)s\" JavaScript event handler attribute.", error),
            HTML_CODE_IN_CSS_BLOCK: $._("HTML code was detected in a CSS context.", error),
            HTTP_LINK_FROM_HTTPS_PAGE: $._("The \"&lt;%(openTag_name)s&gt;\" tag's \"%(attribute_name_value)s\" attribute currently points to an insecure resource.", error),
            INVALID_ATTR_NAME: $._("The attribute name \"%(attribute_name_value)s\" that is not permitted under HTML5 naming conventions.", error),
            UNSUPPORTED_ATTR_NAMESPACE: $._("The attribute \"%(attribute_name_value)s\" uses an attribute namespace that is not permitted under HTML5 conventions.", error),
            MULTIPLE_ATTR_NAMESPACES: $._("The attribute \"%(attribute_name_value)s\" has multiple namespaces. Check your text and make sure there's only a single namespace prefix for the attribute.", error),
            INVALID_CSS_PROPERTY_NAME: $._("CSS property \"%(cssProperty_property)s\" does not exist.", error),
            INVALID_TAG_NAME: $._("A \"&lt;\" character appears to be the beginning of a tag, but is not followed by a valid tag name. If you just want a \"&lt;\" to appear on your Web page, try using \"&amp;amp;lt;\" instead.", error),
            JAVASCRIPT_URL_NOT_ALLOWED: $._("Sorry, but security restrictions on this site prevent you from using the \"javascript:\" URL.", error),
            MISMATCHED_CLOSE_TAG: $._("A closing \"&lt;/%(closeTag_name)s&gt;\" tag doesn't pair with the opening \"&lt;%(openTag_name)s&gt;\" tag. This is likely due to a missing \"&lt;/%(openTag_name)s&gt;\" tag.", error),
            MISSING_CSS_BLOCK_CLOSER: $._("Missing block closer or next \"property:value;\" pair following \"%(cssValue_value)s\".", error),
            MISSING_CSS_BLOCK_OPENER: $._("Missing block opener after \"%(cssSelector_selector)s\".", error),
            MISSING_CSS_PROPERTY: $._("Missing property for \"%(cssSelector_selector)s\".", error),
            MISSING_CSS_SELECTOR: $._("Missing either a new CSS selector or the \"&lt;/style&gt;\" tag.", error),
            MISSING_CSS_VALUE: $._("Missing value for \"%(cssProperty_property)s\".", error),
            SCRIPT_ELEMENT_NOT_ALLOWED: $._("Sorry, but security restrictions on this site prevent you from using \"&lt;script&gt;\" tags.", error),
            ELEMENT_NOT_ALLOWED: $._("Sorry, but security restrictions on this site prevent you from using \"&lt;%(openTag_name)s&gt;\" tags.", error),
            SELF_CLOSING_NON_VOID_ELEMENT: $._("A \"&lt;%(name)s&gt;\" tag can't be self-closed, because \"&lt;%(name)s&gt;\" is not a void element; it must be closed with a separate \"&lt;/%(name)s&gt;\" tag.", error),
            UNCAUGHT_CSS_PARSE_ERROR: $._("A parse error occurred outside expected cases: \"%(error_msg)s\"", error),
            UNCLOSED_TAG: $._("A \"&lt;%(openTag_name)s&gt;\" tag never closes.", error),
            UNEXPECTED_CLOSE_TAG: $._("A closing \"&lt;/%(closeTag_name)s&gt;\" tag doesn't pair with anything, because there are no opening tags that need to be closed.", error),
            UNFINISHED_CSS_PROPERTY: $._("Property \"%(cssProperty_property)s\" still needs finalizing with \":\"", error),
            UNFINISHED_CSS_SELECTOR: $._("Selector \"%(cssSelector_selector)s\" still needs finalizing with \"{\"", error),
            UNFINISHED_CSS_VALUE: $._("Value \"%(cssValue_value)s\" still needs finalizing with \";\"", error),
            UNKOWN_CSS_KEYWORD: $._("A CSS @keyword \"%(cssKeyword_value)s\" does not match any known @keywords.", error),
            UNQUOTED_ATTR_VALUE: $._("An Attribute value should start with an opening double quote.", error),
            UNTERMINATED_ATTR_VALUE: $._("A \"&lt;%(openTag_name)s&gt;\" tag's \"%(attribute_name_value)s\" attribute has a value that doesn't end with a closing double quote.", error),
            UNTERMINATED_CLOSE_TAG: $._("A closing \"&lt;/%(closeTag_name)s&gt;\" tag doesn't end with a \"&gt;\".", error),
            UNTERMINATED_COMMENT: $._("A comment doesn't end with a \"--&gt;\".", error),
            UNTERMINATED_CSS_COMMENT: $._("A CSS comment doesn't end with a \"*/\".", error),
            UNTERMINATED_OPEN_TAG: $._("An opening \"&lt;%(openTag_name)s&gt;\" tag doesn't end with a \"&gt;\".", error)
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

        if (errorCount > 0) {
            return callback(errors, []);
        }

        this.tester.test(this.userDOM, tests, errors,
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
        var doc = this.getDocument();
        var self = this;
        $(doc).find("a").attr("rel", "nofollow").each(function() {
            var url = $(this).attr("href");
            if (url && url[0] === "#") {
                $(this).attr("href", "javascript:void(0)").click(function() {
                    var id = url;
                    $(doc).find("html, body").animate({
                        scrollTop: $(doc).find(id).offset().top
                    }, 1000);
                });
                return;
            }

            $(this).click(function() {
                self.output.postParent({
                    action: "link-click",
                    url: url
                });
                return false;
            });
        });

        var titleTag = $(doc).find("head > title");
        if (titleTag.length > 0 && oldPageTitle != titleTag.text()) {
            self.output.postParent({
                action: "page-info",
                title: titleTag.first().text()
            });
        }
    },

    runCode: function(userCode, callback) {
        var doc = this.getDocument();
        var oldPageTitle = $(doc).find("head > title").text();
        doc.open();
        doc.write(userCode);
        doc.close();
        this.postProcessing(oldPageTitle);
        callback([], userCode);
    },

    clear: function() {
        // Clear the output
    },

    kill: function() {
        // Completely stop and clear the output
    }
});

LiveEditorOutput.registerOutput("webpage", WebpageOutput);
