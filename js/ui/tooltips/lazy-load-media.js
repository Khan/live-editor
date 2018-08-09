import React, {Component} from "react";
import {CircularSpinner} from "@khanacademy/wonder-blocks-progress-spinner";

export default class LazyLoadMedia extends Component {
    props: {
        parentScrollMax: number,
        spinnerClassName: string,
        src: string,
        type: string,
        className: string,
        alt: string,
    };

    constructor(props) {
        super(props);
        this.state = {
            isVisible: false,
        };
        this.mediaRef = React.createRef();
    }

    componentDidMount() {
        this.calculateVisibility();
    }

    componentDidUpdate() {
        this.calculateVisibility();
    }

    calculateVisibility() {
        const mediaDom = this.mediaRef.current;
        if (this.state.isVisible || mediaDom.offsetTop === 0) {
            return;
        }
        if (mediaDom.offsetTop < this.props.parentScrollMax) {
            this.setState({isVisible: true});
        }
    }

    render() {
        let media;
        if (!this.state.isVisible) {
            media = <div ref={this.mediaRef} className={this.props.spinnerClassName}>
                        <CircularSpinner size="small"/>
                    </div>
        } else {
            if (this.props.type === "audio") {
                media = (
                    <audio
                        className={this.props.className}
                        ref={this.mediaRef}
                        src={this.props.src}
                        controls
                    />
                );
            } else {
                media = (
                    <img
                        className={this.props.className}
                        ref={this.mediaRef}
                        src={this.props.src}
                        alt={this.props.alt}
                    />
                );
            }
        }
        return media;
    }
}
