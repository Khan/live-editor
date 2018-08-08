const i18n = require("i18n");
import classNames from 'classnames';
import React, {Component} from "react";

import {StyleSheet, css} from "aphrodite/no-important";
import {CircularSpinner} from "@khanacademy/wonder-blocks-progress-spinner";

import SharedStyles from "./shared-styles.js";

class OutputSide extends Component {

    props: {
        execFile: string,
        sandboxProps: string,
        imagesDir: string,
        iframeRef: Object,
        canRecord: boolean,
        isResizable: boolean,
        drawCanvas: Object,
        errorBuddy: Object,
        hideEditor: boolean,
        disablePointerEvents: boolean,
        showDisableOverlay: boolean,
        outputLoaded: boolean,
        width: string,
        height: string,
        onOutputFrameLoad: Function,
        onDisableClick: Function,
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
                onLoad={this.props.onOutputFrameLoad}
                className={css(
                    SharedStyles.noBorder,
                    SharedStyles.outputFullSize,
                    styles.outputFrame,
                    isResizable &&
                        hideEditor &&
                        styles.outputFrameNoEditorResizable,
                    this.props.disablePointerEvents && styles.pointerEventsNone
                )}
                sandbox={this.props.sandboxProps}
                src={this.props.execFile}
                data-src={this.props.execFile}
                style={{width: "100%"}}
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

        let disableOverlay;
        // Show an invisible overlay that blocks interactions with
        // the editor and canvas areas (preventing the user from
        // being able to disturb playback)
        if (this.props.showDisableOverlay) {
            disableOverlay = <div
                    className={css(
                        SharedStyles.overlay,
                        SharedStyles.disableOverlay,
                    )}
                    onClick={this.props.onDisableClick}
                />;
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
                style={{width: this.props.width}}
            >
                <div
                    id="output"
                    className={css(
                        styles.output,
                        isResizable &&
                            hideEditor &&
                            styles.outputNoEditorResizable,
                    )}
                    style={{height: this.props.height}}
                >
                    {this.renderOutputFrame()}
                    {this.props.drawCanvas}
                    {disableOverlay}
                    {this.props.errorBuddy}
                    {loadingOverlay}
                </div>
            </div>
        );
    }
}

const defaultDim = 400;

const styles = StyleSheet.create({
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
    },
    pointerEventsNone: {
        pointerEvents: "none"
    }
});

module.exports = OutputSide;
