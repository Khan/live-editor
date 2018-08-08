import classNames from "classnames";
import i18n from "i18n";
import React, {Component} from "react";
import Button from "@khanacademy/wonder-blocks-button";
import {icons} from "@khanacademy/wonder-blocks-icon";
import IconButton from "@khanacademy/wonder-blocks-icon-button";
import {CircularSpinner} from "@khanacademy/wonder-blocks-progress-spinner";
import {StyleSheet, css} from "aphrodite/no-important";

import EditorToolbar from "./editor-toolbar.js";
import SharedStyles from "./shared-styles.js";

export default class EditorSide extends Component {
    props: {
        customEditorFontClass: string,
        youtubeUrl: string,
        hasAudio: boolean,
        hideEditor: boolean,
        showAudioPlayButton: boolean,
        showAudioSpinner: boolean,
        showDisableOverlay: boolean,
        contentType: string,
        onDisableClick: Function,
        onBigPlayClick: Function,
        showYoutubeLink: boolean,
        toolbar: Object,
        aceEditorWrapper: Object,
    };

    constructor(props) {
        super(props);
        this.state = {
            closedYoutubeLink: false,
        };
    }

    renderYoutubePlaybackLink() {
        // TODO: Trigger after timeout, see webapp
        if (
            !(this.props.youtubeUrl && this.props.showYoutubeLink) ||
            this.state.closedYoutubeLink
        ) {
            return null;
        }
        return (
            <div className={css(styles.youtubeLink)}>
                <IconButton
                    icon={icons.dismiss}
                    aria-label="Close message"
                    onClick={(e) => this.setState({closedYoutubeLink: true})}
                />
                <a href={this.props.youtubeUrl} target="_blank">
                    {i18n._(
                        "If the audio never loads, reload the page or watch on YouTube.",
                    )}
                </a>
            </div>
        );
    }

    renderBigPlayButton() {
        return (
            <Button
                style={[styles.middleOfEditor, styles.bigPlayButton]}
                aria-label={i18n._("Play")}
                onClick={this.props.onBigPlayClick}
            >
                <svg
                    role="img"
                    aria-hidden="true"
                    focusable="false"
                    width="66"
                    height="66"
                    viewBox="0 0 10 10"
                >
                    <path fill="currentColor" d={playIcon} />
                </svg>
            </Button>
        );
    }

    renderAudioPlayButton() {
        if (!this.props.hasAudio) {
            return null;
        }
        let playButton;
        if (this.props.showAudioPlayButton) {
            playButton = this.renderBigPlayButton();
        } else if (this.props.showAudioSpinner) {
            playButton = (
                <CircularSpinner style={[styles.middleOfEditor]} size="large" />
            );
        }

        return (
            <div>
                {playButton}
                {this.renderYoutubePlaybackLink()}
                {/* This cannot be removed, if we want Flash to keep working! */}
                <div id="sm2-container">
                    {i18n._("Enable Flash to load audio:")}
                    <br />
                </div>
            </div>
        );
    }

    maybeCustomEditorFontClass() {
        return "";
    }

    render() {
        const isDocument = this.props.contentType === "document";

        let toolbar;
        if (!this.props.toolbar) {
            toolbar = <EditorToolbar {...this.props} />;
        }
        let disableOverlay;
        // Show an invisible overlay that blocks interactions with
        // the editor and canvas areas (preventing the user from
        // being able to disturb playback)
        if (this.props.showDisableOverlay) {
            disableOverlay = (
                <div
                    className={css(
                        SharedStyles.overlay,
                        SharedStyles.disableOverlay,
                    )}
                    onClick={this.props.onDisableClick}
                />
            );
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
                        css(styles.editorContainer, SharedStyles.noBorder),
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
                        {disableOverlay}
                        {this.renderAudioPlayButton()}
                    </div>
                </div>
                {!this.props.hasAudio && (
                    <div className={css(styles.toolbarWrap)}>{toolbar}</div>
                )}
            </div>
        );
    }
}

const playIcon = `M1.6,9.9C1.5,10,1.3,10,1.2,10C1.1,10,1,10,0.9,9.9C0.7,9.8,0.6,9.6,
        0.6,9.4V0.6c0-0.2,0.2-0.4,0.4-0.5C1.1,0,1.4,0,1.6,0.1l7.6,4.5c0.2,0.1,
        0.3,0.3,0.3,0.5c0,0.2-0.1,0.4-0.3,0.5L1.6,9.9z`;

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
    toolbarWrap: {
        borderTop: defaultBorder,
        padding: 5,
    },
    middleOfEditor: {
        left: "40%",
        position: "absolute",
        top: "30%",
        zIndex: "1000",
    },
    youtubeLink: {
        left: "20%",
        bottom: "20px",
        marginBottom: "0",
        position: "absolute",
        textAlign: "center",
        zIndex: 1000,
        background: "#eee",
        padding: "10px",
        borderRadius: "6px",
    },
    bigPlayButton: {
        background: "#ddd",
        border: "none",
        borderRadius: "10px",
        boxShadow: "none",
        color: "white",
        cursor: "pointer",
        fontSize: "66px",
        lineHeight: "1em",
        opacity: 0.7,
        padding: "18px 23px 18px 31px",
        width: "120px",
        height: "110px",
        ":hover": {
            opacity: 1.0,
        },
    },
});
