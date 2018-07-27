const i18n = require("i18n");
import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";

class EditorToolbar extends Component {

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
        alignSelf: "flex-start",
        display: "flex",
        marginRight: "auto",
        height: 38,
    },
    right: {
        alignSelf: "flex-end",
        display: "flex",
        marginLeft: "auto",
        height: 38,
    },
    toolbar: {
        display: "flex",
        alignItems: "center",
    },
});

module.exports = EditorToolbar;