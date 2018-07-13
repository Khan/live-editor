import Button from "@khanacademy/wonder-blocks-button";
import {ModalLauncher} from "@khanacademy/wonder-blocks-modal";
import React, {Component} from 'react';

const MediaPickerModal = require("./media-picker-modal.jsx");
const MediaPickerPreview = require("./media-picker-preview.jsx");

class MediaPickerTooltip extends Component {
    // props mediaType, mediaSrc, errorMessage, errorType, imagesDir, soundsDir, classes

    render() {
        const mediaPickerModal =
            ({closeModal}) => <MediaPickerModal {...this.props} onClose={closeModal}/>;

        return (
            <div className="mediapicker-preview-content">
                <MediaPickerPreview {...this.props}/>
                <ModalLauncher modal={mediaPickerModal} onClose={this.props.onModalClose}>
                    {({openModal}) =>
                    <Button
                        onClick={openModal}
                        style={{display: "block", margin: "0 auto"}}
                    >
                        {i18n._("Pick file:")}
                    </Button>
                    }
                </ModalLauncher>
            </div>
        );
    }

}

module.exports = MediaPickerTooltip;