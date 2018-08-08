import {StyleSheet} from "aphrodite/no-important";

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
    /**
     * Overlays
     * --------
     *
     * Transparent or translucent overlays placed on top of the editor and/or canvas
     * in order to disable interaction with them. The closest parent with
     * position: relative or position: absolute determines the scope of the page
     * blocked by the overlay.
     */
    overlay: {
        height: "100%",
        left: "0px",
        margin: 0,
        /* Ensure the overlay can be scrolled behind, like for SQL */
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