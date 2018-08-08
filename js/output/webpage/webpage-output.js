/* eslint-disable no-empty, no-console, prefer-const, no-new-func */
/* TODO: Fix the lint errors */
import i18n from "i18n";
import React, {Component} from "react";

import LoopProtector from "../shared/loop-protect.js";
import Slowparse from "../../../external/slowparse/slowparse.js";

import StateScrubber from "./state-scrubber.js";
import WebpageTester from "./webpage-tester.js";

const infiniteLoopError = {
    text: i18n._(
        "Your javascript is taking too long to run. " +
            "Perhaps you have a mistake in your code?",
    ),
    type: "error",
    source: "timeout",
};

const runtimeError = {
    text: i18n._(
        "Your javascript encountered a runtime error. " +
            "Check your console for more information.",
    ),
    type: "error",
    source: "timeout",
};

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
export default class WebpageOutput extends Component {
    props: {
        config: Object,
        imagesDir: string,
        redirectUrl: string,
        onInfiniteLoopError: Function,
        onCodeLint: Function,
        onCodeRun: Function,
        onTitleChange: Function,
    };

    constructor(props) {
        super(props);

        this.config = props.config;

        this.frameRef = React.createRef();

        this.tester = new WebpageTester(props);
    }

    componentDidMount() {
        // Load Webpage config options
        this.config.runCurVersion("webpage", this);

        const frameEl = this.frameRef.current;

        // Set up infinite loop protection
        this.loopProtector = new LoopProtector(
            this.infiniteLoopCallback.bind(this),
        );
        frameEl.contentWindow.KAInfiniteLoopProtect = this.loopProtector.KAInfiniteLoopProtect;

        // In case frame didn't load (like in IE10), this adds it
        //  once the frame has loaded
        frameEl.addEventListener("load", () => {
            try {
                // If it was successfully assigned, this will error because
                // strict mode warns about assignming to non-writable props
                frameEl.contentWindow.KAInfiniteLoopProtect = this.loopProtector.KAInfiniteLoopProtect;
            } catch (e) {}
        });
        // Do this at the end so variables I add to the global scope stay
        // i.e.  KAInfiniteLoopProtect
        this.stateScrubber = new StateScrubber(frameEl.contentWindow);

        this.frameDoc = frameEl.contentDocument;

        this.handleParentRequests(this.props, {});
    }

    componentDidUpdate(prevProps, prevState) {
        this.handleParentRequests(this.props, prevProps);
    }

    handleParentRequests(props, prevProps) {
        const foundNewRequest = (reqName) => {
            return (
                props[reqName] &&
                (!prevProps[reqName] ||
                    props[reqName].timestamp !== prevProps[reqName].timestamp)
            );
        };

        // Generate a screenshot of current output and send it back
        if (foundNewRequest("screenshotReq")) {
            this.getScreenshot(props.screenshotReq.size, (data) => {
                props.onScreenshotCreate(data);
            });
        }
        if (foundNewRequest("lintCodeReq")) {
            const req = props.lintCodeReq;
            this.lint(req.code, req.skip, req.timestamp);
        }
        if (foundNewRequest("runCodeReq")) {
            const req = props.runCodeReq;
            this.runCode(req.code, req.timestamp);
        }
    }

    getScreenshot(screenshotSize, callback) {
        html2canvas(this.frameDoc.body, {
            imagesDir: this.props.imagesDir,
            onrendered: function(canvas) {
                const width = screenshotSize;
                const height = (screenshotSize / canvas.width) * canvas.height;

                // We want to resize the image to a thumbnail,
                // which we can do by creating a temporary canvas
                const tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = screenshotSize;
                tmpCanvas.height = screenshotSize;
                tmpCanvas
                    .getContext("2d")
                    .drawImage(canvas, 0, 0, width, height);

                // Send back the screenshot data
                callback(tmpCanvas.toDataURL("image/png"));
            },
        });
    }

    infiniteLoopCallback() {
        this.props.onInfiniteLoopError(infiniteLoopError);
        this.KA_INFINITE_LOOP = true;
    }

    lint(userCode, skip, timestamp) {
        if (skip) {
            return this.props.onCodeLint({
                code: userCode,
                timestamp: timestamp,
                errors: [],
                warnings: [],
            });
        }

        this.userCode = userCode;
        userCode = userCode || "";

        // Lint the user's code, returning any errors in the callback
        let results = {};
        try {
            results = Slowparse.HTML(document, userCode, {
                scriptPreprocessor: (code) => this.loopProtector.protect(code),
                disableTags: ["iframe", "embed", "object", "frameset", "frame"],
            });
        } catch (e) {
            if (window.console) {
                console.warn(e);
            }
            results.error = {
                type: "UNKNOWN_SLOWPARSE_ERROR",
            };
        }

        this.slowparseResults = results;

        const errors = [];
        if (results.error) {
            let pos = results.error.cursor || 0;
            let previous = userCode.slice(0, pos);
            let column = pos - previous.lastIndexOf("\n") - 1;
            let row = (previous.match(/\n/g) || []).length;
            errors.push({
                row: row,
                column: column,
                text: this.getLintMessage(results.error),
                type: "error",
                source: "slowparse",
                lint: results.error,
                priority: 2,
            });
        }

        const warnings = [];
        if (results.warnings && results.warnings.length > 0) {
            for (let i = 0; i < results.warnings.length; i++) {
                let pos = results.warnings[i].parseInfo.cursor || 0;
                let previous = userCode.slice(0, pos);
                let column = pos - previous.lastIndexOf("\n") - 1;
                let row = (previous.match(/\n/g) || []).length;
                warnings.push({
                    row: row,
                    column: column,
                    text: this.getLintMessage(results.warnings[i].parseInfo),
                    type: "warning",
                    source: "slowparse",
                });
            }
        }

        this.props.onCodeLint({
            code: userCode,
            timestamp: timestamp,
            errors: errors,
            warnings: warnings,
        });
    }

    flattenError(plainError, error, base) {
        error = error || {};
        base = base || "";

        for (let prop in plainError) {
            if (plainError.hasOwnProperty(prop)) {
                const flatName = base ? base + "_" + prop : prop;
                if (typeof plainError[prop] === "object") {
                    this.flattenError(plainError[prop], error, flatName);
                } else {
                    error[flatName] = plainError[prop];
                }
            }
        }

        return error;
    }

    getLintMessage(plainError) {
        const error = this.flattenError(plainError);

        // Mostly borrowed from:
        // https://github.com/mozilla/thimble.webmaker.org/blob/master/locale/en_US/thimble-dialog-messages.json
        return {
            NO_DOCTYPE_FOUND: i18n._(
                "A DOCTYPE declaration should be the first item on the page.",
                error,
            ),
            HTML_NOT_ROOT_ELEMENT: i18n._(
                "The root element on the page should be an <html> element.",
                error,
            ),
            ATTRIBUTE_IN_CLOSING_TAG: i18n._(
                'A closing "&lt;/%(closeTag_name)s&gt;" tag cannot contain any attributes.',
                error,
            ),
            CLOSE_TAG_FOR_VOID_ELEMENT: i18n._(
                'You have a closing "&lt;/%(closeTag_name)s&gt;" tag for a void element (and void elements don\'t need to be closed).',
                error,
            ),
            CSS_MIXED_ACTIVECONTENT: i18n._(
                'You have a css property "%(cssProperty_property)s" with a "url()" value that currently points to an insecure resource.',
                error,
            ),
            EVENT_HANDLER_ATTR_NOT_ALLOWED: i18n._(
                'Sorry, but security restrictions on this site prevent you from using the "%(attribute_name_value)s" JavaScript event handler attribute.',
                error,
            ),
            HTML_CODE_IN_CSS_BLOCK: i18n._(
                "Did you put HTML code inside a CSS area?",
                error,
            ),
            HTTP_LINK_FROM_HTTPS_PAGE: i18n._(
                'The <%(openTag_name)s> tag\'s "%(attribute_name_value)s" attribute currently points to an insecure resource.',
                error,
            ),
            INVALID_URL: i18n._(
                'The <%(openTag_name)s> tag\'s "%(attribute_name_value)s" attribute points to an invalid URL.  Did you include the protocol (http:// or https://)?',
                error,
            ),
            INVALID_ATTR_NAME: i18n._(
                'The attribute name "%(attribute_name_value)s" is not permitted under HTML5 naming conventions.',
                error,
            ),
            UNSUPPORTED_ATTR_NAMESPACE: i18n._(
                'The attribute "%(attribute_name_value)s" uses an attribute namespace that is not permitted under HTML5 conventions.',
                error,
            ),
            MULTIPLE_ATTR_NAMESPACES: i18n._(
                'The attribute "%(attribute_name_value)s" has multiple namespaces. Check your text and make sure there\'s only a single namespace prefix for the attribute.',
                error,
            ),
            INVALID_CSS_PROPERTY_NAME: i18n._(
                'The CSS property "%(cssProperty_property)s" does not exist.',
                error,
            ),
            IMPROPER_CSS_VALUE: i18n._(
                'The CSS value "%(cssValue_value)s" is malformed.',
                error,
            ),
            INVALID_TAG_NAME: i18n._(
                'A "&lt;" character appears to be the beginning of a tag, but is not followed by a valid tag name. If you want a "&lt;" to appear on your Web page, try using "&amp;lt;" instead. Otherwise, check your spelling.',
                error,
            ),
            JAVASCRIPT_URL_NOT_ALLOWED: i18n._(
                'Sorry, but security restrictions on this site prevent you from using the "javascript:" URL.',
                error,
            ),
            MISMATCHED_CLOSE_TAG: i18n._(
                'You have a closing "&lt;/%(closeTag_name)s&gt;" tag that doesn\'t pair with the opening "&lt;%(openTag_name)s&gt;" tag. This is likely due to a missing or misordered "&lt;/%(openTag_name)s&gt;" tag.',
                error,
            ),
            MISSING_CSS_BLOCK_CLOSER: i18n._(
                'You\'re missing either a "}" or another "property:value;" pair following "%(cssValue_value)s".',
                error,
            ),
            MISSING_CSS_BLOCK_OPENER: i18n._(
                'You\'re missing the "{" after "%(cssSelector_selector)s".',
                error,
            ),
            MISSING_CSS_PROPERTY: i18n._(
                'You\'re missing property for "%(cssSelector_selector)s".',
                error,
            ),
            MISSING_CSS_SELECTOR: i18n._(
                'You\'re missing either a new CSS selector or the "&lt;/style&gt;" tag.',
                error,
            ),
            MISSING_CSS_VALUE: i18n._(
                'You\'re missing value for "%(cssProperty_property)s".',
                error,
            ),
            SCRIPT_ELEMENT_NOT_ALLOWED: i18n._(
                'Sorry, but security restrictions on this site prevent you from using "&lt;script&gt;" tags.',
                error,
            ),
            OBSOLETE_HTML_TAG: i18n._(
                'The "%(openTag_name)s" tag is obsolete and may not function properly in modern browsers.',
                error,
            ),
            ELEMENT_NOT_ALLOWED: i18n._(
                'Sorry, but security restrictions on this site prevent you from using "&lt;%(openTag_name)s&gt;" tags.',
                error,
            ),
            SELF_CLOSING_NON_VOID_ELEMENT: i18n._(
                'The "&lt;%(name)s&gt;" tag can\'t be self-closed, because "&lt;%(name)s&gt;" is not a void element; it must be closed with a separate "&lt;/%(name)s&gt;" tag.',
                error,
            ),
            UNCAUGHT_CSS_PARSE_ERROR: i18n._(
                'A parse error occurred outside expected cases: "%(error_msg)s"',
                error,
            ),
            UNCLOSED_TAG: i18n._(
                'It looks like your "&lt;%(openTag_name)s&gt;" tag never closes.',
                error,
            ),
            UNEXPECTED_CLOSE_TAG: i18n._(
                'You have a closing "&lt;/%(closeTag_name)s&gt;" tag that doesn\'t pair with any matching opening tags.',
                error,
            ),
            UNFINISHED_CSS_PROPERTY: i18n._(
                'The CSS property "%(cssProperty_property)s" is missing a ":"',
                error,
            ),
            UNFINISHED_CSS_SELECTOR: i18n._(
                'The CSS selector "%(cssSelector_selector)s" needs to be followed by "{"',
                error,
            ),
            UNFINISHED_CSS_VALUE: i18n._(
                'The CSS value "%(cssValue_value)s" still needs to be finalized with ";"',
                error,
            ),
            UNKOWN_CSS_KEYWORD: i18n._(
                'The CSS @keyword "%(cssKeyword_value)s" does not match any known @keywords.',
                error,
            ),
            UNQUOTED_ATTR_VALUE: i18n._(
                "Make sure your attribute value starts with an opening double quote.",
                error,
            ),
            UNTERMINATED_ATTR_VALUE: i18n._(
                'It looks like your "&lt;%(openTag_name)s&gt;" tag\'s "%(attribute_name_value)s" attribute has a value that doesn\'t end with a closing double quote.',
                error,
            ),
            UNTERMINATED_CLOSE_TAG: i18n._(
                'It looks like your closing "&lt;/%(closeTag_name)s&gt;" tag doesn\'t end with a "&gt;".',
                error,
            ),
            UNTERMINATED_COMMENT: i18n._(
                'It looks like your comment doesn\'t end with a "--&gt;".',
                error,
            ),
            UNTERMINATED_CSS_COMMENT: i18n._(
                'It looks like your CSS comment doesn\'t end with a "*/".',
                error,
            ),
            UNTERMINATED_OPEN_TAG: i18n._(
                'It looks like your opening "&lt;%(openTag_name)s&gt;" tag doesn\'t end with a "&gt;".',
                error,
            ),
            UNKNOWN_SLOWPARSE_ERROR: i18n._(
                "Something's wrong with the HTML, but we're not sure what.",
            ),
            JAVASCRIPT_ERROR: i18n._('Javascript Error:\n"%(message)s"', error),
        }[error.type];
    }

    initTests(validate) {
        if (!validate) {
            return;
        }

        try {
            const code = "with(arguments[0]){\n" + validate + "\n}";
            new Function(code).apply({}, this.tester.testContext);
        } catch (e) {
            return e;
        }
    }

    test(userCode, tests, errors, callback) {
        const errorCount = errors.length;

        Object.assign(this.tester.testContext, {
            docSP: this.slowparseResults.document,
            cssRules: this.slowparseResults.rules,
        });

        this.tester.test(
            userCode,
            tests,
            errors,
            function(errors, testResults) {
                if (errorCount !== errors.length) {
                    // Note: Scratchpad challenge checks against the exact
                    // translated text "A critical problem occurred..." to
                    // figure out whether we hit this case.
                    const message = i18n._("Error: %(message)s", {
                        message: errors[errors.length - 1].message,
                    });
                    this.tester.testContext.assert(
                        false,
                        message,
                        i18n._(
                            "A critical problem occurred in your program " +
                                "making it unable to run.",
                        ),
                    );
                }

                if (this.foundRunTimeError) {
                    errors.push(runtimeError);
                }
                callback(errors, testResults);
            }.bind(this),
        );
    }

    // Prefixes a URL with the URL of a redirecting proxy,
    //  if one has been specified.
    transformUrl(url) {
        if (url.match(/^https?:\/\/([\w\d]+\.)?khanacademy\.org(\/|$)/)) {
            return url;
        }
        const redirectUrl = this.props.redirectUrl;
        if (redirectUrl && url.indexOf(redirectUrl) !== 0) {
            return redirectUrl + "?url=" + encodeURIComponent(url);
        }
        return url;
    }

    postProcessing() {
        // Change external links to a redirecting proxy
        this.frameDoc.querySelectorAll("a").forEach((a) => {
            const url = a.getAttribute("href");
            if (
                url &&
                url[0] !== "#" &&
                url.substring(0, 10) !== "javascript"
            ) {
                a.setAttribute("target", "_blank");
                a.setAttribute("href", this.transformUrl(url));
            }
        });

        // Monitor changes to the title tag
        const titleTag = this.frameDoc.querySelector("head > title");
        const titleText = titleTag && titleTag.innerText;
        if (titleText && titleText !== this.oldPageTitle) {
            this.oldPageTitle = titleText;
            this.props.onTitleChange(titleText);
        }
    }

    runCode(userCode, timestamp) {
        this.stateScrubber.clearAll();
        this.KA_INFINITE_LOOP = false;
        this.foundRunTimeError = false;
        this.frameDoc.open();
        // It's necessary in FF/IE to redefine KAInfiniteLoopProtect here
        try {
            this.frameRef.current.contentWindow.KAInfiniteLoopProtect = this.loopProtector.KAInfiniteLoopProtect;
        } catch (e) {
            // But it will error in strict mode, if already assigned
        }
        this.frameRef.current.contentWindow.addEventListener("error", () => {
            this.foundRunTimeError = true;
        });

        this.frameDoc.write(this.slowparseResults.code);
        this.frameDoc.close();

        this.postProcessing();

        const errors = [];
        if (this.KA_INFINITE_LOOP) {
            errors.push(infiniteLoopError);
        }
        this.props.onCodeRun({code: userCode, errors: errors, timestamp});
    }

    kill() {
        // Completely stop and clear the output
    }

    render() {
        return (
            <iframe
                ref={this.frameRef}
                style={{width: "100%", height: "100%", border: 0}}
            />
        );
    }
}
