import i18n from "i18n";
import Button from "@khanacademy/wonder-blocks-button";
import {ModalLauncher} from "@khanacademy/wonder-blocks-modal";
import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";

import MediaPickerModal from "./media-picker-modal.jsx";
import MediaPickerPreview from "./media-picker-preview.jsx";

export default class MediaPickerTooltip extends Component {
    // Most of these are for passing on to children
    props: {
        errorMessage: string,
        mediaClasses: Array<Object>,
        mediaDir: string,
        mediaSrc: string,
        mediaType: string,
        onFileSelect: (info: Object) => void,
        onModalClose: () => void,
        onModalRefCreate: (ref: Object) => void,
    };

    render() {
        const mediaPickerModal = ({closeModal}) => (
            <MediaPickerModal
                {...this.props}
                closeModal={closeModal}
                onClose={() => { this.props.onModalClose(); closeModal();}}
            />
        );

        const divClass = css(
            styles.tooltipBox,
            this.props.mediaType === "audio" ? styles.audio : styles.image,
        );

        return (
            <div className={divClass}>
                <MediaPickerPreview {...this.props} />
                <ModalLauncher
                    modal={mediaPickerModal}
                    onClose={this.props.onModalClose}
                    onRefCreate={this.props.onModalRefCreate}
                >
                    {({openModal}) => (
                        <Button
                            onClick={openModal}
                            style={styles.launcherButton}
                        >
                            {i18n._("Choose file")}
                        </Button>
                    )}
                </ModalLauncher>
            </div>
        );
    }
}

// TODO: Doesn't work!
const styles = StyleSheet.create({
    tooltipBox: {
        backgroundColor: "#FFF",
        padding: "5px",
        marginRight: "0",
    },
    audio: {
        width: "250px",
    },
    image: {
        height: "150px",
        width: "120px",
    },
    launcherButton: {
        display: "block",
        margin: "5px auto",
    },
});
