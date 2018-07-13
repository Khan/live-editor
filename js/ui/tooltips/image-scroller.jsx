import React, {Component} from 'react';

const LazyLoadImage = require("./lazy-load-image.jsx");

class ImageScroller extends Component {

    // props: imagesDir, imageGroups, currentImage, onMouseLeave, onImageSelect
    constructor(props) {
        super(props);
        this.state = {
            activeImage: this.props.currentImage,
            scrollTop: 0,
            isHovering: false
        };
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleImageClick = this.handleImageClick.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.throttledOnScroll = _.throttle(this.handleScroll, 200);
        this.scrollerRef = React.createRef();
    }

    componentDidMount () {
        this.calculateDomPosition();
    }

    handleMouseEnter() {
        this.setState({isHovering: true});
        this.calculateDomPosition();
    }

    handleMouseLeave () {
        this.setState({isHovering: false});
        this.props.onMouseLeave();
    }

    handleImageClick (imageName) {
        this.setState({activeImage: imageName});
        this.props.onImageSelect(imageName);
    }

    handleScroll () {
        this.calculateDomPosition();
    }

    calculateDomPosition() {
        if (!this.scrollerRef.current) {
            return;
        }
        this.setState({
            scrollTop: this.scrollerRef.current.scrollTop
        })
    }

    render () {
        const spinnerPath = `${this.props.imagesDir}spinner.gif`;
        const scrollMax = this.state.scrollTop + (300 * 2);

        const groupsDivs = this.props.imageGroups.map((group) => {
            let citeP;
            if (group.cite) {
                citeP = (
                    <p>
                        <a href="{group.citeLink}" target="_blank">
                        {group.cite}
                        </a>
                    </p>);
            }
            const imagesDivs = group.images.map((fileName) => {
                const imageName = `${group.groupName}/${fileName}`;
                const imagePath = `${this.props.imagesDir}${imageName}.png`;
                let divClass = "image";
                if (imageName === this.state.activeImage) {
                    divClass += " active";
                }
                return (
                    <div className={divClass}
                        key={imageName}
                        onClick={(e) => this.handleImageClick(imageName, e)}>
                        <LazyLoadImage
                            alt={fileName}
                            src={imagePath}
                            placeholderSrc={spinnerPath}
                            parentScrollMax={scrollMax}
                            />
                        <span className="name">{fileName}</span>
                    </div>
                );
            });
            return (
                <div className="media-group" key={group.groupName}>
                    <h3>{group.groupName}</h3>
                    {citeP}
                    {imagesDivs}
                </div>
            );
        });

        let currentPath = `${this.props.imagesDir}cute/Blank.png`;
        if (this.props.currentImage) {
            currentPath = `${this.props.imagesDir}${this.props.currentImage}.png`;
        }

        let currentImageDiv;
        if (!this.state.isHovering) {
            currentImageDiv = <div className="current-media">
                    <img src={currentPath}/>
                </div>;
        }
        let imageGroupsDiv;
        if (this.state.isHovering) {
            imageGroupsDiv = <div className="media-groups" ref={this.scrollerRef} onScroll={this.handleScroll}>
                <div style={{position: "relative"}}>
                {groupsDivs}
                </div>
            </div>;
        }

        return (
            <div
                onMouseEnter={this.handleMouseEnter}
                onMouseLeave={this.handleMouseLeave}
                >
            {currentImageDiv}
            {imageGroupsDiv}
            </div>
        );
    }
}

module.exports = ImageScroller;