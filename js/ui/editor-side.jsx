const i18n = require("i18n");

import classNames from 'classnames';
import React, {Component} from "react";
import {CircularSpinner} from "@khanacademy/wonder-blocks-progress-spinner";
import {StyleSheet, css} from "aphrodite/no-important";

const EditorToolbar = require("./editor-toolbar.jsx");

class EditorSide extends Component {

    props: {
        customEditorFontClass: string,
        youtubeUrl: string,
        hasAudio: boolean,
        hideEditor: boolean,
        contentType: string,
        onRestartClicked: Function,
        onDisableClicked: Function
    };

    renderYoutubePlaybackLink() {
        if (!this.props.youtubeUrl) {
            return null;
        }

        return (
            <div
                className="scratchpad-editor-youtube-link alert alert-info"
                style={{display: "none"}}
            >
                <span className="close" data-dismiss="alert">
                    &#215;
                </span>
                <a href={this.props.youtubeUrl} target="_blank">
                    {i18n._("If the audio never loads, reload the page or watch on Youtube.")}
                </a>
            </div>
        );
    }

    renderAudioPlayButton() {
        if (!this.props.hasAudio) {
            return null;
        }

        return (
            <div>
                <div
                    className="overlay disable-overlay"
                    onClick={this.props.onDisableClicked}
                />
                <div className="scratchpad-editor-bigplay-loading">
                    <CircularSpinner size="large" />
                    <span className="hide-text">
                        {i18n._("Loading...")}
                    </span>
                </div>

                {/* This cannot be removed, if we want Flash to keep working! */}
                <div id="sm2-container">
                    {i18n._("Enable Flash to load audio:")}
                    <br />
                </div>
                {this.renderYoutubePlaybackLink()}
                <button
                    className="scratchpad-editor-bigplay-button"
                    style={{display: "none"}}
                >
                    <Icon icon={icons.play} />
                    <span className="hide-text">
                        {i18n._("Play")}
                    </span>
                </button>
            </div>
        );
    }

    maybeCustomEditorFontClass() {
        return  ""
    }

    render() {
        const isDocument = this.props.contentType === "document";

        let toolbar;
        if (!this.props.toolbar) {
            toolbar = <EditorToolbar {...this.props}/>
        }
        return (
            <div
                className={classNames(
                    "scratchpad-editor-wrap",
                    "overlay-container",
                    css(
                        styles.editorWrap,
                        this.props.hideEditor && styles.editorHidden,
                    ),
                )}
            >
                <div
                    className={classNames(
                        "scratchpad-editor-tabs",
                        css(styles.editorContainer, styles.noBorder),
                    )}
                >
                    <div
                        id="scratchpad-code-editor-tab"
                        className={classNames(
                            // This is applied on an ancestor of .ace_editor,
                            // as setting class directly on the element breaks
                            // the editor when class is changed dynamically.
                            this.props.customEditorFontClass,
                            css(
                                styles.editorTab,
                                isDocument && styles.editorTabDocument,
                            ),
                        )}
                    >
                        {this.props.aceEditorWrapper}
                        {this.renderAudioPlayButton()}
                    </div>
                </div>
                {!this.props.hasAudio && (
                    <div className={css(styles.toolbarWrap)}>
                        {toolbar}
                    </div>
                )}
            </div>
        );
    }
}

const defaultDim = 400;
const defaultBorder = `2px solid #D6D8DA`;

const styles = StyleSheet.create({
    editorWrap: {
        borderRight: defaultBorder,
        display: "flex",
        flexDirection: "column",
        marginRight: "auto",
        minHeight: defaultDim,
        flexGrow: 1,
        flexShrink: 1,
    },
    editorHidden: {
        display: "none",
    },
    editorContainer: {
        display: "flex",
        flexDirection: "column",
        flexGrow: 1,
        flexShrink: 1,
        position: "relative",
    },
    // This is ambiguously named -- refers to the contents of a tab, *NOT*
    // the tab button or buttons at the top of the challenge content editor.
    editorTab: {
        position: "absolute",
        padding: 0,
        height: "100%",
        width: "100%",
    },
    editorTabDocument: {
        position: "static",
    },
    noBorder: {
        border: "none",
    },
    toolbarWrap: {
        borderTop: defaultBorder,
        padding: 5,
    }
});


module.exports = EditorSide;
