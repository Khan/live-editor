/**
 * This is called tipbar for historical reasons.
 * Originally, it appeared as a red bar sliding up from the bottom of the
 * canvas. Now it powers the error reporting mechanism, which no longer
 * looks like a bar.
 */
/* globals i18n */
import Draggable from "react-draggable";
import {icons} from "@khanacademy/wonder-blocks-icon";
import Button from "@khanacademy/wonder-blocks-button";
import IconButton from "@khanacademy/wonder-blocks-icon-button";
import {StyleSheet, css} from "aphrodite/no-important";
import React, {Component} from "react";

import SharedStyles from "./shared-styles.js";

export default class TipBar extends Component {
    props: {
        imagesDir: string,
        isHidden: boolean,
        errors: Array<string>,
        errorNum: number,
        onErrorShowRequested: Function,
        onLoseFocus: Function,
        onDismissed: Function,
    };

    static defaultProps = {
        errors: [],
        isHidden: true,
    };

    constructor(props) {
        super(props);
        this.state = {
            errorNum: props.errorNum || 0,
        };
        this.handleShowMeClick = this.handleShowMeClick.bind(this);
        this.handlePrevClick = this.handlePrevClick.bind(this);
        this.handleNextClick = this.handleNextClick.bind(this);
        this.handleCloseClick = this.handleCloseClick.bind(this);
    }

    handleShowMeClick() {
        const error = this.props.errors[this.state.errorNum];
        this.props.onErrorShowRequested(error);
    }

    handleCloseClick() {
        this.props.onDismissed();
    }

    handlePrevClick() {
        this.setState((prevState, props) => ({
            errorNum: Math.max(0, prevState.errorNum - 1),
        }));
        this.props.onLoseFocus();
    }

    handleNextClick() {
        this.setState((prevState, props) => ({
            errorNum: Math.min(
                prevState.errorNum + 1,
                this.props.errors.length - 1,
            ),
        }));
        this.props.onLoseFocus();
    }

    renderMessage(errorMsg) {
        const messageParts = errorMsg.split('"').map((str, i) => {
            if (str.length === 0) {
                return;
            }
            if (i % 2 === 0) {
                return <span key={i}>{str}</span>;
            } else {
                // text inside quotes, used for suggesting how to use functions
                return (
                    <span key={i} className={css(styles.quoted)}>
                        {str}
                    </span>
                );
            }
        });
        return <div className={css(styles.message)}>{messageParts}</div>;
    }

    render() {
        if (this.props.isHidden || !this.props.errors.length) {
            return null;
        }
        const errors = this.props.errors;
        const errorNum =
            errors[this.state.errorNum] == null ? 0 : this.state.errorNum;
        const currentError = errors[errorNum];

        const message = currentError.text || currentError || "";

        let showMeDiv;
        if (currentError.row > -1) {
            // it could be undefined, null, or -1
            showMeDiv = (
                <Button
                    style={styles.showMeButton}
                    onClick={this.handleShowMeClick}
                    kind="tertiary"
                >
                    {i18n._("Show me where")}
                </Button>
            );
        }

        let navDiv;
        if (errors.length > 1) {
            const numText =
                errors.length > 1 ? errorNum + 1 + "/" + errors.length : "";
            navDiv = (
                <div className={css(styles.errorNav)}>
                    <IconButton
                        icon={icons.caretLeft}
                        aria-label={i18n._("Previous error")}
                        onClick={this.handlePrevClick}
                        disabled={errorNum <= 0}
                    />
                    <span className={css(styles.errorNums)}>{numText}</span>
                    <IconButton
                        icon={icons.caretRight}
                        aria-label={i18n._("Next error")}
                        onClick={this.handleNextClick}
                        disabled={errorNum >= errors.length - 1}
                    />
                </div>
            );
        }
        const ebImg = `${this.props.imagesDir}scratchpads/error-buddy.png`;
        const arImg = `${this.props.imagesDir}scratchpads/speech-arrow.png`;

        // Note: enableUserSelectHack below is very important.
        // Without it, the editor loses focus whenever this component unmounts.
        // See https://github.com/mzabriskie/react-draggable/issues/315
        return (
            <React.Fragment>
                <div
                    className={css(SharedStyles.overlay, styles.errorOverlay)}
                />
                <Draggable
                    axis="y"
                    bounds="parent"
                    enableUserSelectHack={false}
                    handle=".error-buddy"
                >
                    <div className={css(styles.errorBuddyWrapper)}>
                        <div
                            className={css(styles.speechArrow)}
                            style={{background: `url(${arImg})`}}
                        />
                        <div
                            className={css(styles.errorBuddyImg)}
                            style={{background: `url(${ebImg})`}}
                        />
                        <div className={css(styles.messageBubble)}>
                            <IconButton
                                style={styles.closeButton}
                                icon={icons.dismiss}
                                aria-label={i18n._("Close")}
                                kind="tertiary"
                                onClick={this.handleCloseClick}
                            />
                            <div className={css(styles.ohNoHeader)}>
                                {i18n._("Oh noes!")}
                            </div>
                            {this.renderMessage(message)}
                            {showMeDiv}
                            {navDiv}
                        </div>
                    </div>
                </Draggable>
            </React.Fragment>
        );
    }
}

const styles = StyleSheet.create({
    errorOverlay: {
        background: "rgba(255,255,255,0.6)",
        zIndex: "auto",
    },
    errorBuddyWrapper: {
        borderRadius: "10px",
        /* Needs to match the background image */
        background: "#F9F9F9",
        border: "1px solid #EEE",
        boxShadow: "2px 2px 5px rgba(0, 0, 0, 0.5)",
        color: "#000",
        fontFamily: "Helvetica, sans-serif",
        fontWeight: "normal",
        left: "125px",
        margin: "auto",
        minHeight: "40px",
        position: "absolute",
        top: "100px",
        width: "260px",
    },
    errorBuddyImg: {
        cursor: "move",
        height: "116px",
        left: "-140px",
        opacity: 0.75,
        position: "absolute",
        top: "-12px",
        width: "130px",
    },
    speechArrow: {
        backgroundRepeat: "no-repeat",
        height: "24px",
        left: "-14px",
        position: "absolute",
        top: "40px",
        width: "14px",
    },
    messageBubble: {
        lineHeight: "1.4em",
        margin: "8px",
    },
    quoted: {
        background: "#fff",
        border: "1px solid #EEE",
        borderRadius: "5px",
        display: "inline-block",
        fontFamily: "Consolas, Courier New, monospace",
        fontSize: "14px",
        lineHeight: "22px",
        margin: "0px 2px",
        padding: "1px 4px",
        textAlign: "left",
    },
    message: {
        lineHeight: "20px",
        margin: "10px 0px",
        textAlign: "left",
    },
    closeButton: {
        float: "right",
    },
    ohNoHeader: {
        fontSize: "13px",
        fontWeight: "bold",
    },
    showMeButton: {
        float: "left",
    },
    errorNav: {
        float: "right",
    },
    errorNums: {
        verticalAlign: "middle",
        display: "inline-block",
        paddingBottom: "10px",
    },
});
