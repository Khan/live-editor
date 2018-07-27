const i18n = require("i18n");
import classNames from 'classnames';
import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";
import {CircularSpinner} from "@khanacademy/wonder-blocks-progress-spinner";

class OutputSide extends Component {
    static defaultProps = {
        width: 400,
        height: 400
    }

    props: {
        colors: Array<string>,
        execFile: string,
        sandboxProps: string,
        imagesDir: string,
        canRecord: boolean,
        isResizable: boolean,
        hideEditor: boolean,
        width: number,
        height: number
    };

    constructor(props) {
        super(props);
    }

    renderOutputFrame() {
        const execFile = this.props.execFile;
        const isResizable = this.props.isResizable;
        const hideEditor = this.props.hideEditor;

        if (!execFile) {
            return null;
        }

        {
        /* Extra data-src attribute to work around cross-origin access
           policies. */
        }
        return (
            <iframe
                id="output-frame"
                ref={this.props.iframeRef}
                onLoad={this.props.onOutputFrameLoaded}
                className={css(
                    styles.noBorder,
                    styles.outputFrame,
                    isResizable &&
                        hideEditor &&
                        styles.outputFrameNoEditorResizable,
                )}
                sandbox={this.props.sandboxProps}
                src={this.props.execFile}
                data-src={this.props.execFile}
                style={{width: "100%"}}
            />
        );
    }

    renderDrawCanvas() {
        return (
            <canvas
                className="scratchpad-draw-canvas"
                style={{display: "none"}}
                width={this.props.width}
                height={this.props.height}
            />
        );
    }

    render() {
        const isResizable = this.props.isResizable;
        const hideEditor = this.props.hideEditor;

        let loadingOverlay;
        if (!this.props.outputLoaded) {
            loadingOverlay = <div className={css(styles.loadingIcon)}>
                    <CircularSpinner size="large" />
                </div>;
        }
        return (
            <div
                className={classNames(
                    "scratchpad-canvas-wrap",
                    css(
                        this.props.hideEditor && styles.canvasWrapNoEditor,
                        styles.canvasWrap,
                    ),
                )}
            >
                <div
                    id="output"
                    className={css(
                        styles.output,
                        isResizable &&
                            hideEditor &&
                            styles.outputNoEditorResizable,
                    )}
                >
                    {this.renderOutputFrame()}
                    {this.renderDrawCanvas()}

                    <div
                        className="overlay disable-overlay"
                        style={{display: "none"}}
                    />
                    {this.props.errorBuddy}
                    {loadingOverlay}
                </div>
            </div>
        );
    }
}

const defaultDim = 400;

const styles = StyleSheet.create({
    noBorder: {
        border: "none",
    },
    output: {
        border: "none",
        margin: "auto",
        minHeight: defaultDim,
        minWidth: defaultDim,
    },
    outputNoEditorResizable: {
        minWidth: "100%",
    },
    outputFrame: {
        // NOTE(jeresig): LiveEditor assumes that the canvas output will
        // still have a 1px border around it, so we need to fake it to
        // ensure that the height calculations are correct.
        borderBottom: "1px transparent solid",
        borderTop: "1px transparent solid",
        marginTop: -1,
        minWidth: defaultDim,
    },
    outputFrameNoEditorResizable: {
        minWidth: "100%",
        left: 0,
    },
    canvasWrap: {
        flexShrink: 0,
    },
    canvasWrapNoEditor: {
        margin: "0 auto",
    },
    loadingIcon: {
        left: "40%",
        position: "absolute",
        top: "30%",
        zIndex: "1000"
    }
});

module.exports = OutputSide;
