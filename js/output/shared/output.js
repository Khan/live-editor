window.LiveEditorOutput = Backbone.View.extend({
    recording: false,
    loaded: false,
    outputs: {},

    initialize: function(options) {
        this.render();

        this.setPaths(options);

        this.assertions = [];

        this.config = new ScratchpadConfig({});
        
        if (options.outputType) {
            this.setOutput(options.outputType);
        }

        this.bind();
    },

    render: function() {
        this.$el.html("<div class=\"output\"></div>");
    },

    bind: function() {
        // Handle messages coming in from the parent frame
        window.addEventListener("message",
            this.handleMessage.bind(this), false);
            //function(){console.log("msg")});
    },

    setOutput: function(outputType) {
        var OutputClass = this.outputs[outputType];
        this.output = new OutputClass({
            el: this.$el.find(".output"),
            config: this.config,
            output: this,
            type: outputType
        });
    },

    setPaths: function(data) {
        if (data.workersDir) {
            this.workersDir = this._qualifyURL(data.workersDir);
            PooledWorker.prototype.workersDir = this.workersDir;
        }
        if (data.externalsDir) {
            this.externalsDir = this._qualifyURL(data.externalsDir);
            PooledWorker.prototype.externalsDir = this.externalsDir;
        }
        if (data.imagesDir) {
            this.imagesDir = this._qualifyURL(data.imagesDir);
        }
        if (data.jshintFile) {
            this.jshintFile = this._qualifyURL(data.jshintFile);
            PooledWorker.prototype.jshintFile = this.jshintFile;
        }
    },

    _qualifyURL: function(url){
        var a = document.createElement("a");
        a.href = url;
        return a.href;
    },

    handleMessage: function(event) {
        var data;

        this.frameSource = event.source;
        this.frameOrigin = event.origin;

        // let the parent know we're up and running
        this.notifyActive();

        try {
            data = JSON.parse(event.data);

        } catch (err) {
            return;
        }
        if (!this.output) {
            var outputType = data.outputType || _.keys(this.outputs)[0];
            this.setOutput(outputType);
        }

        // Set the paths from the incoming data, if they exist
        this.setPaths(data);

        // Validation code to run
        if (data.validate != null) {
            this.initTests(data.validate);
        }

        // Settings to initialize
        if (data.settings != null) {
            this.settings = data.settings;
        }

        // Code to be executed
        if (data.code != null) {
            this.config.switchVersion(data.version);
            this.runCode(data.code, undefined, data.cursor, data.noLint);
        }

        if (data.onlyRunTests != null) {
            this.onlyRunTests = !!(data.onlyRunTests);
        } else {
            this.onlyRunTests = false;
        }

        // Restart the output
        if (data.restart) {
            this.restart();
        }

        // Keep track of recording state
        if (data.recording != null) {
            this.recording = data.recording;
        }

        // Take a screenshot of the output
        if (data.screenshot != null) {
            var screenshotSize = data.screenshotSize || 200;
            this.output.getScreenshot(screenshotSize, function(data) {
                // Send back the screenshot data
                this.postParent(data);
            }.bind(this));
        }

        if (this.output.messageHandlers) {
            for (var prop in data) {
                if (prop in this.output.messageHandlers) {
                    this.output.messageHandlers[prop].call(this.output, data);
                }
            }
        }
    },

    // Send a message back to the parent frame
    postParent: function(data) {
        // If there is no frameSource (e.g. we're not embedded in another page)
        // Then we don't need to care about sending the messages anywhere!
        if (this.frameSource) {
            this.frameSource.postMessage(
                typeof data === "string" ? data : JSON.stringify(data),
                this.frameOrigin);
        }
    },

    notifyActive: _.once(function() {
        this.postParent({ active: true });
    }),

    // This function stores the new tests on the validate property
    //  and it executes the test code to see if its valid
    initTests: function(validate) {
        // Only update the tests if they have changed
        if (this.validate === validate) {
            return;
        }

        // Prime the test queue
        this.validate = validate;
    },

    runCode: function(userCode, callback, cursor, noLint) {
        this.currentCode = userCode;

        var buildDone = function(errors) {
            errors = this.cleanErrors(errors || []);

            if (!this.loaded) {
                this.postParent({ loaded: true });
                this.loaded = true;
            }
            this.postParent({
                results: {
                    code: userCode,
                    errors: errors,
                    assertions: this.assertions
                }
            });

            this.toggle(!errors.length);

            // A callback for working with a test suite
            if (callback) {
                //This is synchrynous
                this._test(userCode, this.validate, errors, function(errors, testResults) {
                    callback(errors, testResults);
                    return;
                });
            // Normal case
            } else {
                // This is debounced (async)
                var oldErrorsLength = errors.length;
                this.test(userCode, this.validate, errors, function(errors, testResults) {
                    var results = {
                        code: userCode,
                        tests: testResults
                    };
                    if (oldErrorsLength === 0 && errors.length > oldErrorsLength) {
                        results.errors = errors;
                    }
                    this.postParent({ results: results });
                }.bind(this));
            }
        }.bind(this);

        var lintDone = function(errors) {
            if (errors.length > 0 || this.onlyRunTests) {
                return buildDone(errors);
            }

            // Then run the user's code
            try {
                this.output.runCode(userCode, function(errors) {
                    buildDone(errors);
                }, cursor);

            } catch (e) {
                buildDone([e]);
            }
        }.bind(this);

        // Always lint the first time, so that PJS can populate its list of globals
        if (noLint && this.firstLint) {
            lintDone([]);
        } else {
            this.lint(userCode, lintDone);
            this.firstLint = true;
        }
    },


    test: _.throttle(function() {
        this._test.apply(this, arguments);
    }, 200),
    _test: function(userCode, validate, errors, callback) {
        this.output.test(userCode, validate, errors, callback);
    },

    lint: function(userCode, callback) {
        this.output.lint(userCode, callback);
    },

    getUserCode: function() {
        return this.currentCode || "";
    },

    toggle: function(toggle) {
        if (this.output.toggle) {
            this.output.toggle(toggle);
        }
    },

    restart: function() {
        // This is called on load and it's possible that the output
        // hasn't been set yet.
        if (!this.output) {
            return;
        }

        if (this.output.restart) {
            this.output.restart();
        }

        this.runCode(this.getUserCode());
    },

    cleanErrors: function(errors) {
        errors = errors.map(function(error) {
            if (!$.isPlainObject(error)) {
                return {
                    row: error.lineno ? error.lineno - 2 : -1,
                    column: 0,
                    text: this.clean(error.message),
                    type: "error",
                    source: "native",
                    priority: 3
                };
            }

            return {
                row: error.row,
                column: error.column,
                text: _.compose(this.prettify, this.clean)(
                    error.text || error.message || ""),
                type: error.type,
                lint: error.lint,
                source: error.source
            };
        }.bind(this));

        errors = errors.sort(function(a, b) {
            var diff = a.row - b.row;
            return diff === 0 ? (a.priority || 99) - (b.priority || 99) : diff;
        });

        return errors;
    },

    // This adds html tags around quoted lines so they can be formatted
    prettify: function(str) {
        str = str.split("\"");
        var htmlString = "";
        for (var i = 0; i < str.length; i++) {
            if (str[i].length === 0) {
                continue;
            }

            if (i % 2 === 0) {
                //regular text
                htmlString += "<span class=\"text\">" + str[i] + "</span>";
            } else {
                // text in quotes
                htmlString += "<span class=\"quote\">" + str[i] + "</span>";
            }
        }
        return htmlString;
    },

    clean: function(str) {
        return String(str).replace(/</g, "&lt;");
    }
});

LiveEditorOutput.registerOutput = function(name, output) {
    LiveEditorOutput.prototype.outputs[name] = output;
};