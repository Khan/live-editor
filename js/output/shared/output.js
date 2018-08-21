import _ from "lodash";
import React, {Component} from "react";

import ScratchpadConfig from "../../shared/config.js";
import * as utils from "../../shared/utils.js";

import "../../../css/output/style.css";

const outputs = {};

export default class LiveEditorOutput extends Component {
    // For most of these props, they are often sent from the parent editor,
    // so are stored in state once recieved
    props: {
        externalsDir: string,
        imagesDir: string,
        jshintFile: string,
        loopProtectTimeouts: Object,
        onAllDone: Function,
        onLintDone: Function,
        onRunDone: Function,
        outputType: string,
        redirectUrl: string,
        soundsDir: string,
        useDebugger: boolean,
        validate: string,
        workersDir: string,
    };

    static defaultProps = {
        loopProtectTimeouts: {
            initialTimeout: 2000,
            frameTimeout: 500,
        },
    };

    constructor(props) {
        super(props);

        this.state = {
            ...this.getPaths(props),
            outputType: props.outputType,
            tests: props.validate,
            loopProtectTimeouts: props.loopProtectTimeouts,
        };

        this.outputTypeRef = React.createRef();
        this.handleMessage = this.handleMessage.bind(this);
        this.notifyActiveOnce = _.once(this.notifyActive);
        this.testThrottled = _.throttle(this.test, 200);

        this.config = new ScratchpadConfig({
            useDebugger: this.props.useDebugger,
        });

        this.recording = false;
        this.loaded = false;
        this.lintErrors = [];
        this.runtimeErrors = [];
        this.lintWarnings = [];

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

    componentDidUpdate(prevProps) {
        // This pretty much only happens in tests,
        // since typically the tests are being posted from the parent frame
        if (this.props.validate && this.props.validate !== prevProps.validate) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({tests: this.props.validate});
        }
    }

    renderOutputType() {
        if (!this.state.outputType) {
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
            testCodeReq: this.state.testCodeReq,
            toggleReq: this.state.toggleReq,
            onCanvasEvent: (e) => {
                // Log the command if recording is occurring
                if (this.recording) {
                    // Track the x/y coordinates of the event
                    const offset = utils.getOffset(e.target);
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
                    this.state.tests,
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
            onCodeTest: (testResults) => {
                this.results.errors = testResults.errors;
                this.results.tests = testResults.results;
                this.testDone();
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

    getPaths(data) {
        const pathsState = {};
        if (data.workersDir) {
            pathsState.workersDir = utils.qualifyURL(data.workersDir);
        }
        if (data.externalsDir) {
            pathsState.externalsDir = utils.qualifyURL(data.externalsDir);
        }
        if (data.imagesDir) {
            pathsState.imagesDir = utils.qualifyURL(data.imagesDir);
        }
        if (data.soundsDir) {
            pathsState.soundsDir = utils.qualifyURL(data.soundsDir);
        }
        if (data.redirectUrl) {
            pathsState.redirectUrl = data.redirectUrl;
        }
        if (data.jshintFile) {
            pathsState.jshintFile = utils.qualifyURL(data.jshintFile);
        }
        return pathsState;
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

        // Make changes to the state based on incoming messages
        const stateChanges = {};

        if (data.outputType) {
            stateChanges.outputType = data.outputType;
        }

        if (data.enableLoopProtect != null) {
            stateChanges.enableLoopProtect = data.enableLoopProtect;
        }
        if (data.loopProtectTimeouts != null) {
            stateChanges.loopProtectTimeouts = data.loopProtectTimeouts;
        }

        // Settings to initialize
        if (data.settings != null) {
            stateChanges.settings = data.settings;
        }

        // Take a screenshot of the output
        if (data.screenshot != null) {
            stateChanges.screenshotReq = {
                time: Date.now(),
                size: data.screenshotSize || 200,
            };
        }
        if (data.prop === "mouseAction") {
            stateChanges.mouseActionReq = {time: Date.now(), data};
        }
        if (data.documentation != null) {
            stateChanges.docInitReq = {time: Date.now(), data};
        }
        // Validation tests to run
        if (data.validate != null) {
            stateChanges.tests = data.validate;
        }

        this.setState({
            ...this.getPaths(data),
            ...stateChanges,
        });

        // Now make non-state related changes
        if (data.onlyRunTests != null) {
            this.onlyRunTests = !!data.onlyRunTests;
        } else {
            this.onlyRunTests = false;
        }

        // Code to be executed
        if (data.code != null) {
            this.config.switchVersion(data.version);
            this.runCode(data.code, data.noLint);
        }

        // Restart the output
        if (data.restart) {
            this.restart();
        }

        // Keep track of recording state
        if (data.recording != null) {
            this.recording = data.recording;
        }
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
     * - merge lint and runtime errors
     * - run tests if they exists
     *
     * @param code: code to run
     * @param noLint: disables linting if true, first run still lints
     */
    runCode(code, noLint) {
        this.currentCode = code;
        const timestamp = Date.now();

        this.results = {
            timestamp: timestamp,
            code,
            errors: [],
            assertions: [],
            warnings: [],
            tests: null,
        };

        // Always lint the first time, so that PJS can populate its list of globals
        const skip = noLint && this.firstLint;

        this.setState({
            lintCodeReq: {code, skip, timestamp},
        });

        this.firstLint = true;
    }

    /**
     * Runs the code and records runtime errors.  Returns immediately if there
     * are any lint errors.
     *
     * @param code
     * @param timestamp
     */
    lintDone(code, timestamp) {
        this.props.onLintDone &&
            this.props.onLintDone(this.lintErrors, this.lintWarnings);
        if (this.lintErrors.length > 0 || this.onlyRunTests) {
            this.buildDone(code);
        } else {
            // Then run the user's code
            this.setState({runCodeReq: {code, timestamp}});
        }
    }

    /**
     * Posts results to the the parent frame and runs tests
     * if the .validate property is set.
     *
     * @param code
     */
    buildDone(code) {
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
        this.props.onRunDone && this.props.onRunDone(this.results);
        // This is debounced (async)
        if (this.state.tests) {
            this.testThrottled(code, errors);
        } else {
            this.props.onAllDone && this.props.onAllDone(this.results);
        }
    }

    testDone() {
        this.phoneHome();
        this.props.onAllDone && this.props.onAllDone(this.results);
    }

    /**
     * Send the most up to date errors/test results to the parent frame.
     */
    phoneHome() {
        this.postParent({
            results: this.results,
        });
    }

    test(code, errors) {
        this.setState({
            testCodeReq: {
                code,
                errors,
                tests: this.state.tests,
                timestamp: Date.now(),
            },
        });
    }

    lint(code) {
        this.setState({
            lintCodeReq: {code, timestamp: Date.now()},
        });
    }

    getUserCode() {
        return this.currentCode || "";
    }

    toggle(doToggle) {
        this.setState({toggleReq: {timestamp: Date.now(), doToggle: doToggle}});
    }

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
