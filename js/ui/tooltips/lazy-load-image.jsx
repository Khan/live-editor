const $ = require("jquery");
import React, {Component} from 'react';

class LazyLoadImage extends Component {

    // props: scrollposition, src, placeholdrsrc
    // state: isloaded
    constructor(props) {
        super(props);
        this.state = {
            isVisible: false
        }
        this.imageRef = React.createRef();
    }
    componentDidMount () {
        this.calculateVisibility();
    }

    componentDidUpdate () {
        this.calculateVisibility();
    }

    calculateVisibility() {
        const imageDom = this.imageRef.current;
        if (this.state.isVisible || imageDom.offsetTop === 0) {
            return;
        }
        if (imageDom.offsetTop < this.props.parentScrollMax) {
            this.setState({isVisible: true})
        }
    }

    render() {
        let imgSrc = this.props.placeholderSrc;
        if (this.state.isVisible) {
            imgSrc = this.props.src;
        }
        return (
            <img
                className={this.props.className}
                ref={this.imageRef}
                src={imgSrc}
                alt={this.props.alt}
                />
        );
    }
}

module.exports = LazyLoadImage;