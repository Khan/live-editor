import React, {Component} from "react";
import Button from "@khanacademy/wonder-blocks-button";

class MediaPickerPreview extends Component {
    // props mediaType, mediaSrc, errorMessage, errorType

    constructor(props) {
        super(props);
        this.state = {
            imageLoaded: false
        }
        this.handleImageLoad = this.handleImageLoad.bind(this);
        this.handleImageError = this.handleImageError.bind(this);
    }

    handleImageLoad() {
        this.setState({imageLoaded: true});
    }

    handleImageError() {
        /*
        TODO: wutt
        if (self.currentUrl !== $(this).attr("src")) {
            return;
        }*/
        this.setState({errorMessage: i18n._("That is not a valid image URL.")})
    }

    render() {

        let mediaPreview;
        if (this.props.mediaType === "audio") {
            mediaPreview = <div>
                    <audio controls className="mediapicker-preview-file" src={this.props.mediaSrc}></audio>
                    <div className="thumb-error"></div>
                </div>;
        } else {
            // Only show throbber while we're waiting for image to load
            let loadingImg;
            if (!this.state.imageLoaded && this.props.mediaSrc) {
                loadingImg = <img
                    src="/images/spinner.gif"
                    className="thumb-throbber"
                    />;
            }
            let errorDiv;
            let errorMessage = this.state.errorMessage || this.props.errorMessage;
            let errorClass = "thumb-error";
            if (this.props.errorType === "error") {
                errorClass += "domain-error";
            }
            if (errorMessage) {
                errorDiv = <div className="thumb-error">
                    {errorMessage}
                    </div>;
            }
            mediaPreview = <div>
                    {loadingImg}
                    <div className="thumb-shell">
                        <img className="thumb"
                            src={this.props.mediaSrc}
                            onLoad={this.handleImageLoad}
                            onError={this.handleImageError}
                        />
                        {errorDiv}
                    </div>
                </div>;
        }

        return mediaPreview;
    }
}

module.exports = MediaPickerPreview;