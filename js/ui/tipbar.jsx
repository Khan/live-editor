/**
 * This is called tipbar for historical reasons.
 * Originally, it appeared as a red bar sliding up from the bottom of the
 * canvas. Now it powers the error reporting mechanism, which no longer
 * looks like a bar.
 */
import i18n from "i18n";
import Draggable from "react-draggable";

import {icons} from "@khanacademy/wonder-blocks-icon";
import Button from "@khanacademy/wonder-blocks-button";
import IconButton from "@khanacademy/wonder-blocks-icon-button";
import {StyleSheet, css} from "aphrodite/no-important";
import React, {Component} from "react";

import SharedStyles from "./shared-styles.js"

class TipBar extends Component {
    props: {
        isHidden: boolean,
        errors: Array<string>,
        errorNum: number,
        onErrorShowRequested: Function,
        onDismissed: Function
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
        // TODO: It's unclear why the editor needs to be focus'd here
        //this.props.liveEditor.editor.focus();
    }

    handleNextClick() {
        this.setState((prevState, props) => ({
            errorNum: Math.min(
                prevState.errorNum + 1,
                this.props.errors.length - 1,
            ),
        }));
        // TODO: It's unclear why the editor needs to be focus'd here
        //this.props.liveEditor.editor.focus();
    }

    render() {
        if (this.props.isHidden || !this.props.errors.length) {
            return null;
        }

        const errors = this.props.errors;
        const errorNum =
            errors[this.state.errorNum] == null ? 0 : this.state.errorNum;
        const currentError = errors[errorNum];

        const messageHtml = {
            __html: currentError.text || currentError || "",
        };

        let showMeDiv;
        if (currentError.row > -1) {
            // it could be undefined, null, or -1
            showMeDiv = (
                <Button
                    className={css(styles.showMeButton)}
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

        return (
            <React.Fragment>
                <div className={css(SharedStyles.overlay, styles.errorOverlay)}/>
                <Draggable
                    axis="y"
                    handle=".error-buddy"
                    bounds="parent"
                >
                    <div className="tipbar">
                        <div className="speech-arrow" />
                        <div className="error-buddy" />
                        <div className="text-wrap">
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
                            <div
                                className="message"
                                dangerouslySetInnerHTML={messageHtml}
                            />
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

module.exports = TipBar;
