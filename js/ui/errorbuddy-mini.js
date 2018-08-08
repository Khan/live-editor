import i18n from "i18n";
import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";

export default class ErrorBuddyMini extends Component {
    props: {
        isHidden: boolean,
        imagesDir: string,
        errorState: string, // happy or thinking
        onClick: Function,
    };

    render() {
        if (this.props.isHidden) {
            return null;
        }
        let errorMood;

        if (this.props.errorState === "happy") {
            errorMood = (
                <div
                    className={css(styles.errorBuddyWrapper)}
                    style={{height: 15}}
                >
                    <img
                        alt={i18n._("Error buddy sees no errors")}
                        src={`${
                            this.props.imagesDir
                        }creatures/OhNoes-Happy.png`}
                    />
                </div>
            );
        } else {
            errorMood = (
                <button
                    className={css(
                        styles.errorBuddyWrapper,
                        styles.wiggleAnimation,
                    )}
                    onClick={this.props.onClick}
                >
                    <img
                        alt={i18n._("Error buddy sees a possible error")}
                        src={`${this.props.imagesDir}creatures/OhNoes-Hmm.png`}
                    />
                    {/* I18N: The CS error buddy is thinking there might be an
                    * error in your code and is waiting for you to fix it. */}
                    {i18n._("Hmm...")}
                </button>
            );
        }
        return (
            <div className={css(styles.errorBuddyContainer)}>
                <div className="error-buddy-resting">{errorMood}</div>
            </div>
        );
    }
}

const wiggleKeyframes = {
    "0%": {
        transform: "translateX(0)",
    },
    "20%": {
        transform: "translateX(-2px)",
    },
    "40%": {
        transform: "translateX(2px)",
    },
    "60%": {
        transform: "translateX(-2px)",
    },
    "80%": {
        transform: "translateX(2px)",
    },
    "100%": {
        transform: "translateX(0)",
    },
};

const styles = StyleSheet.create({
    errorBuddyContainer: {
        display: "inline-block",
        marginLeft: 5,
        marginRight: 5,
        position: "relative",
    },
    errorBuddyWrapper: {
        background: "transparent",
        border: "none",
        position: "absolute",
        textDecoration: "none",
    },
    wiggleAnimation: {
        animationName: [wiggleKeyframes],
        animationDuration: "1000ms",
    },
});
