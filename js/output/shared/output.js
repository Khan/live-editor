import _ from "lodash";
import React, {Component} from "react";

import ScratchpadConfig from "../../shared/config.js";
import * as utils from "../../shared/utils.js";

import "../../../css/output/style.css";

const outputs = {};

export default class LiveEditorOutput extends Component {
    props: {
        useDebugger: boolean,
        imagesDir: string,
        redirectUrl: string,
    };

    constructor(props) {
        super(props);
        this.state = {};

        this.outputTypeRef = React.createRef();
        this.handleMessage = this.handleMessage.bind(this);
        this.notifyActiveOnce = _.once(this.notifyActive);
        this.testThrottled = _.throttle(this.test, 200);

        this.config = new ScratchpadConfig({
            useDebugger: this.props.useDebugger,
        });

        // TODO: Move these into state
        this.recording = false;
        this.loaded = false;
        this.lintErrors = [];
        this.runtimeErrors = [];
        this.lintWarnings = [];
        this.setPaths(props);

        // Add a timestamp property to the lintErrors and runtimeErrors arrays
        // to keep track of which version of the code the errors are for.  A
        // new timestamp is created when runCode is called and is assigned to
        // lintErrors and runtimeErrors (if there is no lint) when linting and
        // running of the code complete.  The timestamps are used later to
        // ensure we're not report stale errors that have already been fixed
        // to the parent.  Adding properties to an array works because Array is
        // essentially a special subclass of Object.
        this.lintErrors.timestamp = 0;
        this.runtimeErrors.timestamp = 0;
        this.lintWarnings.timestamp = 0;
    }

    componentDidMount() {
        // Handle messages coming in from the parent frame
        window.addEventListener("message", this.handleMessage, false);
    }

    renderOutputType() {
        if (!this.state.readyToInitOutput) {
            return null;
        }
        const props = {
            ref: this.outputTypeRef,
            config: this.config,
            type: this.state.outputType,
            settings: this.state.settings,
            soundsDir: this.state.soundsDir,
            imagesDir: this.state.imagesDir,
            workersDir: this.state.workersDir,
            externalsDir: this.state.externalsDir,
            jshintFile: this.state.jshintFile,
            redirectUrl: this.props.redirectUrl,
            mouseActionReq: this.state.mouseActionReq,
            docInitReq: this.state.docInitReq,
            screenshotReq: this.state.screenshotReq,
            enableLoopProtect: this.state.enableLoopProtect !== false,
            loopProtectTimeouts: this.state.loopProtectTimeouts,
            lintCodeReq: this.state.lintCodeReq,
            runCodeReq: this.state.runCodeReq,
            toggleReq: this.state.toggleReq,
            onCanvasEvent: (e) => {
                const offset = utils.getOffset(e.target);
                // Only log if recording is occurring
                if (this.recording) {
                    // Log the command
                    // Track the x/y coordinates of the event
                    const x = e.pageX - offset.left;
                    const y = e.pageY - offset.top;
                    this.postParent({
                        log: [name, x, y],
                    });
                }
            },
            onRestartRequest: () => {
                this.restart();
            },
            onRunTestsRequest: (callback) => {
                return this.testThrottled(
                    this.getUserCode(),
                    this.validate,
                    [],
                    callback,
                );
            },
            onPhoneHomeRequest: () => {
                this.phoneHome();
            },
            onAssertionFail: (row, column, text) => {
                this.results.assertions.push({row, column, text});
            },
            onTestsResults: (name, result) => {
                this.postParent({
                    results: {
                        code: this.getUserCode(),
                        errors: [],
                        tests: [
                            {
                                name: name,
                                state: result ? "pass" : "fail",
                                results: [],
                            },
                        ],
                    },
                    pass: result,
                });
            },
            onInfiniteLoopError: (error) => {
                this.postParent({
                    results: {
                        code: this.getUserCode(),
                        errors: [error],
                    },
                });
            },
            onScreenshotCreate: (data) => {
                this.postParent(data);
            },
            onCodeLint: (lintResults) => {
                this.lintErrors = lintResults.errors;
                this.lintErrors.timestamp = lintResults.timestamp;
                this.lintWarnings = lintResults.warnings;
                this.lintWarnings.timestamp = lintResults.timestamp;
                this.lintDone(lintResults.code, lintResults.timestamp);
            },
            onCodeRun: (runResults) => {
                this.runtimeErrors = runResults.errors;
                this.runtimeErrors.timestamp = runResults.timestamp;
                this.buildDone(runResults.code);
            },
            onTitleChange: (title) => {
                this.postParent({
                    action: "page-info",
                    title: title,
                });
            },
        };
        return React.createElement(outputs[this.state.outputType], props);
    }

    setPaths(data) {
        if (data.workersDir) {
            this.setState({workersDir: utils.qualifyURL(data.workersDir)});
        }
        if (data.externalsDir) {
            this.setState({externalsDir: utils.qualifyURL(data.externalsDir)});
        }
        if (data.imagesDir) {
            this.setState({imagesDir: utils.qualifyURL(data.imagesDir)});
        }
        if (data.soundsDir) {
            this.setState({soundsDir: utils.qualifyURL(data.soundsDir)});
        }
        if (data.redirectUrl) {
            this.setState({redirectUrl: data.redirectUrl});
        }
        if (data.jshintFile) {
            this.setState({jshintFile: utils.qualifyURL(data.jshintFile)});
        }
    }

    handleMessage(event) {
        let data;

        this.frameSource = event.source;
        this.frameOrigin = event.origin;

        // let the parent know we're up and running
        this.notifyActiveOnce();

        // filter out events that are objects
        // currently the only messages that contain objects are messages
        // being sent by Poster instances being used by the iframeOverlay
        // in pjs-output.js and ui/debugger.js
        if (typeof event.data === "object") {
            return;
        }

        try {
            data = JSON.parse(event.data);
        } catch (err) {
            return;
        }

        const outputType = data.outputType || Object.keys(outputs)[0];
        let enableLoopProtect = true;
        if (data.enableLoopProtect != null) {
            enableLoopProtect = data.enableLoopProtect;
        }
        let loopProtectTimeouts = {
            initialTimeout: 2000,
            frameTimeout: 500,
        };
        if (data.loopProtectTimeouts != null) {
            loopProtectTimeouts = data.loopProtectTimeouts;
        }
        this.setState({
            outputType,
            enableLoopProtect,
            loopProtectTimeouts,
        });

        // filter out debugger events
        // handled by pjs-debugger.js::handleMessage
        if (data.type === "debugger") {
            return;
        }

        // Set the paths from the incoming data, if they exist
        this.setPaths(data);

        // Validation code to run
        if (data.validate != null) {
            this.initTests(data.validate);
        }

        // Settings to initialize
        if (data.settings != null) {
            this.setState({settings: data.settings});
        }

        // Code to be executed
        if (data.code != null) {
            this.config.switchVersion(data.version);
            this.runCode(data.code, undefined, data.noLint);
        }

        if (data.onlyRunTests != null) {
            this.onlyRunTests = !!data.onlyRunTests;
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
            this.setState({
                screenshotReq: {
                    time: Date.now(),
                    size: data.screenshotSize || 200,
                },
            });
        }
        if (data.prop === "mouseAction") {
            this.setState({mouseActionReq: {time: Date.now(), data}});
        }
        if (data.documentation != null) {
            this.setState({docInitReq: {time: Date.now(), data}});
        }
        this.setState({readyToInitOutput: true});
    }

    // Send a message back to the parent frame
    postParent(data) {
        // If there is no frameSource (e.g. we're not embedded in another page)
        // Then we don't need to care about sending the messages anywhere!
        if (this.frameSource) {
            let parentWindow = this.frameSource;
            // In Chrome on dev when postFrame is called from webapp's
            // scratchpad package it is somehow executed from the iframe
            // instead, so frameSource is not really the parent frame.  We
            // detect that here and fix it.
            // TODO(james): Figure out why this is and if there is a better
            // place to put a fix.
            if (this.frameSource === window) {
                parentWindow = this.frameSource.parent;
            }

            parentWindow.postMessage(
                typeof data === "string" ? data : JSON.stringify(data),
                this.frameOrigin,
            );
        }
    }

    notifyActive() {
        this.postParent({active: true});
    }

    // This function stores the new tests on the validate property
    //  and it executes the test code to see if its valid
    initTests(validate) {
        // Only update the tests if they have changed
        if (this.validate === validate) {
            return;
        }

        // Prime the test queue
        this.validate = validate;
    }

    /**
     * Converts an error to something that will JSONify usefully
     *
     * JS error objects JSONify to an empty object, so we need to convert them
     * to a plain object ourselves first.  Since we'll end up doing some
     * conversion of the format to better match jshint errors anyway, we'll
     * just do that here too.  But sanitization will happen outside the iframe,
     * since any code here can be bypassed by the user.
     *
     * @param {*} error: the error to JSONify
     * @returns {*}
     */
    jsonifyError(error) {
        if (typeof error !== "object" || utils.isPlainObject(error)) {
            // If we're not an object, or we're a plain object, we don't need
            // to do anything.
            return error;
        } else {
            return {
                row: error.lineno ? error.lineno - 2 : -1,
                column: 0,
                text: error.message,
                type: "error",
                source: "native",
                priority: 3,
            };
        }
    }

    /**
     * Performs all steps necessary to run code.
     * - lint
     * - actually run the code
     * - manage lint and runtime errors
     * - call the callback (via buildDone) to run tests
     *
     * @param userCode: code to run
     * @param callback: used by the tests
     * @param noLint: disables linting if true, first run still lints
     *
     * TODO(kevinb) return a Deferred and move test related code to test_utils
     */
    runCode(userCode, callback, noLint) {
        this.currentCode = userCode;
        const timestamp = Date.now();

        this.results = {
            timestamp: timestamp,
            code: userCode,
            errors: [],
            assertions: [],
            warnings: [],
        };

        // Always lint the first time, so that PJS can populate its list of globals
        const skip = noLint && this.firstLint;

        this.setState({
            lintCodeReq: {code: userCode, skip, timestamp},
            testsCallback: callback,
        });
        this.firstLint = true;
    }

    /**
     * Runs the code and records runtime errors.  Returns immediately if there
     * are any lint errors.
     *
     * @param userCode
     * @param timestamp
     */
    lintDone(userCode, timestamp) {
        if (this.lintErrors.length > 0 || this.onlyRunTests) {
            this.buildDone(userCode);
            return;
        }
        // Then run the user's code
        this.setState({runCodeReq: {code: userCode, timestamp}});
    }

    /**
     * Posts results to the the parent frame and runs tests if a callback has
     * been set in state or if the .validate property is set.
     *
     * @param userCode
     */
    buildDone(userCode) {
        let errors = [];
        let warnings = [];

        // only use lint errors if the timestamp isn't stale
        if (this.results.timestamp === this.lintErrors.timestamp) {
            errors = errors.concat(this.lintErrors);
        }
        // only use runtime errors if the timestamp isn't stale
        if (this.results.timestamp === this.runtimeErrors.timestamp) {
            errors = errors.concat(this.runtimeErrors);
        }
        // only use lint warnings if the timestamp isn't stale
        if (this.results.timestamp === this.lintWarnings.timestamp) {
            warnings = warnings.concat(this.lintWarnings);
        }

        errors = errors || [];
        errors = errors.map(this.jsonifyError);

        if (!this.loaded) {
            this.postParent({loaded: true});
            this.loaded = true;
        }

        // Update results
        this.results.errors = errors;
        this.results.warnings = warnings;
        this.phoneHome();

        this.toggle(!errors.length);

        // A callback for working with a test suite
        if (this.state.testsCallback) {
            //This is synchronous
            this.test(
                userCode,
                this.validate,
                errors,
                (errors, testResults) => {
                    this.state.testsCallback(errors, testResults);
                },
            );
            // Normal case
        } else {
            // This is debounced (async)
            if (this.validate !== "") {
                this.testThrottled(
                    userCode,
                    this.validate,
                    errors,
                    (errors, testResults) => {
                        this.results.errors = errors;
                        this.results.tests = testResults;
                        this.phoneHome();
                    },
                );
            }
        }
    }

    /**
     * Send the most up to date errors/test results to the parent frame.
     */
    phoneHome() {
        this.postParent({
            results: this.results,
        });
    }

    test(userCode, validate, errors, callback) {
        // TODO: Change to setting testReq in state
        this.outputTypeRef.current.test(userCode, validate, errors, callback);
    }

    lint(userCode, callback) {
        this.setState({
            lintCodeReq: {code: userCode, timestamp: Date.now()},
            testsCallback: callback,
        });
    }

    getUserCode() {
        return this.currentCode || "";
    }

    toggle(doToggle) {
        this.setState({toggleReq: {timestamp: Date.now(), doToggle: doToggle}});
    }

    // TODO: Stop referencing the child ref.
    restart() {
        // This is called on load and it's possible that the output
        // hasn't been set yet.
        if (!this.outputTypeRef.current) {
            return;
        }

        if (this.outputTypeRef.current.restart) {
            this.outputTypeRef.current.restart();
        }

        this.runCode(this.getUserCode());
    }

    render() {
        return <div className="output">{this.renderOutputType()}</div>;
    }
}

LiveEditorOutput.registerOutput = function(name, output) {
    outputs[name] = output;
};
