import {StyleSheet, css} from "aphrodite/no-important";

const defaultDim = 400;

const styles = StyleSheet.create({
    noBorder: {
        border: "none",
    },
    outputFullSize: {
        position: "absolute",
        top: 0,
        left: "auto",
        bottom: "auto",
        right: 0
    },
    overlay: {
        height: "100%",
        left: "0px",
        margin: 0,
        /* Ensure the output can be scrolled behind, like for SQL */
        pointerEvents: "none",
        position: "absolute",
        top: "0px",
        width: "100%",
        zIndex: "1000"
    },
    disableOverlay: {
        background: "rgba(255,255,255,0.9)",
        cursor: "pointer",
        opacity: 0,
        zIndex: "880"
    }
});

module.exports = styles;