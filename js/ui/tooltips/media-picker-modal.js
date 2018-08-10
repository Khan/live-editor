/* globals i18n */
import Button from "@khanacademy/wonder-blocks-button";
import {OneColumnModal} from "@khanacademy/wonder-blocks-modal";
import {View} from "@khanacademy/wonder-blocks-core";
import React, {Component} from "react";

import MediaPickerScroller from "./media-picker-scroller.js";

export default class MediaPickerModal extends Component {
    props: {
        mediaClasses: Array<Object>,
        mediaDir: string,
        onClose: () => void,
        onFileSelect: (info: Object) => void,
    };

    handleClick(e) {
        e.stopPropagation();
    }

    render() {
        const modalContent = (
            <MediaPickerScroller
                mediaClasses={this.props.mediaClasses}
                mediaDir={this.props.mediaDir}
                onFileSelect={this.props.onFileSelect}
            />
        );

        return (
            <OneColumnModal
                content={modalContent}
                footer={
                    <View>
                        <Button onClick={this.props.onClose}>
                            {i18n._("Ok")}
                        </Button>
                    </View>
                }
            />
        );
    }
}
