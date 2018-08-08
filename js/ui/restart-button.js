import i18n from "i18n";
import Button from "@khanacademy/wonder-blocks-button";
import Icon from "@khanacademy/wonder-blocks-icon";
import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";

export default class RestartButton extends Component {
    props: {
        animateNow: boolean,
        isDisabled: boolean,
        isHidden: boolean,
        // The label to use for the restart button, varies per content type
        labelText: string,
        onClick: Function,
    };

    constructor(props) {
        super(props);
        this.state = {
            isAnimating: this.props.animateNow || false,
        };
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.animate();
        this.props.onClick();
    }

    animate() {
        this.setState({isAnimating: true});
        window.setTimeout(() => this.setState({isAnimating: false}), 500);
    }

    render() {
        if (this.props.isHidden) {
            return null;
        }
        const labelText = this.props.labelText || i18n._("Restart");
        return (
            <Button
                onClick={this.handleClick}
                kind="secondary"
                disabled={this.props.isDisabled}
            >
                <span className={css(styles.restartLabel)}>
                    <Icon
                        icon={refreshIcon}
                        size="xlarge"
                        style={[
                            styles.restartIcon,
                            this.state.isAnimating && styles.restartFlip,
                        ]}
                    />
                    <span>{labelText}</span>
                </span>
            </Button>
        );
    }
}

const refreshIcon = {
    xlarge:
        "M50.046 83.391q8.778 0 16.302-4.218t12.084-11.685q.741-1.083 3.477-7.638.513-1.482 1.938-1.482l12.483 0q.855.057 1.482.627t.627 1.14-.057.741q-4.104 17.499-17.442 28.329t-31.179 10.83q-9.519 0-18.411-3.591t-15.846-10.203l-8.379 8.379q-1.254 1.254-2.964 1.254-1.653 0-2.907-1.254t-1.254-2.907l0-29.184q0-1.71 1.254-2.964t2.907-1.197l29.184 0q1.71 0 2.964 1.254 1.197 1.197 1.197 2.907t-1.197 2.907l-8.949 8.949q9.747 9.006 22.686 9.006zm49.989-75.069l0 29.184q.057 1.71-1.197 2.964t-2.964 1.197l-29.184 0q-1.71 0-2.964-1.254t-1.197-2.907q0-1.71 1.254-2.907l9.006-9.006q-9.633-8.949-22.743-8.949-8.721.057-16.302 4.275t-12.141 11.628q-.741 1.083-3.42 7.638-.513 1.482-1.938 1.482l-12.996 0q-.855 0-1.482-.627t-.57-1.425l0-.456q4.218-17.442 17.556-28.272t31.293-10.887q9.462 0 18.468 3.591t15.96 10.203l8.493-8.379q1.197-1.254 2.907-1.254t2.964 1.254 1.197 2.907z",
};

const styles = StyleSheet.create({
    restartLabel: {
        display: "flex",
        alignItems: "center",
    },
    restartIcon: {
        display: "block",
        marginRight: 5,
        width: "0.9em",
        height: "0.9em",
    },
    restartFlip: {
        animationName: {
            "0%": {
                transform: "rotate(0deg)",
            },
            "100%": {
                transform: "rotate(360deg)",
            },
        },
        animationDuration: "0.5s",
        animationIterationCount: "infinite",
    },
});
