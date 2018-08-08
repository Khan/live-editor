import React, {Component} from "react";

export default class LazyLoadMedia extends Component {
    props: {
        parentScrollMax: number,
        placeholderSrc: string,
        src: string,
        type: string,
        className: string,
        alt: string,
    };

    // props: scrollposition, src, placeholdrsrc, type (audio or image)
    // state: isloaded
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
        let mediaSrc = this.props.placeholderSrc;
        if (this.state.isVisible) {
            mediaSrc = this.props.src;
        }
        let media;
        if (this.props.type === "audio") {
            media = (
                <audio
                    className={this.props.className}
                    ref={this.mediaRef}
                    src={mediaSrc}
                    controls
                />
            );
        } else {
            media = (
                <img
                    className={this.props.className}
                    ref={this.mediaRef}
                    src={mediaSrc}
                    alt={this.props.alt}
                />
            );
        }
        return media;
    }
}