import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";

export default class EditorToolbar extends Component {
    props: {
        leftComponents: Array,
        rightComponents: Array,
    };

    render() {
        return (
            <div className={css(styles.toolbar)}>
                <div className={css(styles.left)}>
                    {this.props.leftComponents}
                </div>
                <div className={css(styles.right)}>
                    {this.props.rightComponents}
                </div>
            </div>
        );
    }
}

const styles = StyleSheet.create({
    left: {
        alignItems: "center",
        alignSelf: "flex-start",
        display: "flex",
        marginRight: "auto",
    },
    right: {
        alignSelf: "flex-end",
        display: "flex",
        marginLeft: "auto",
    },
    toolbar: {
        alignItems: "center",
        display: "flex",
        height: "40px",
    },
});
