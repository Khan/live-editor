const _ = require("lodash");
import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";

const LazyLoadMedia = require("./lazy-load-media.jsx");

class ImageScroller extends Component {
    props: {
        currentImage: string,
        imagesDir: string,
        imageGroups: Array<Object>,
        onMouseLeave: () => void,
        onImageSelect: (name: string) => void,
    };

    constructor(props) {
        super(props);
        this.state = {
            activeImage: this.props.currentImage,
            scrollTop: 0,
            isHovering: false,
        };
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleImageClick = this.handleImageClick.bind(this);
        this.handleScroll = this.handleScroll.bind(this);
        this.throttledOnScroll = _.throttle(this.handleScroll, 200);
        this.scrollerRef = React.createRef();
    }

    componentDidMount() {
        this.calculateDomPosition();
    }

    handleMouseEnter() {
        this.setState({isHovering: true});
        this.calculateDomPosition();
    }

    handleMouseLeave() {
        this.setState({isHovering: false});
        this.props.onMouseLeave();
    }

    handleImageClick(imageName) {
        this.setState({activeImage: imageName});
        this.props.onImageSelect(imageName);
    }

    handleScroll() {
        this.calculateDomPosition();
    }

    calculateDomPosition() {
        if (!this.scrollerRef.current) {
            return;
        }
        this.setState({
            scrollTop: this.scrollerRef.current.scrollTop,
        });
    }

    render() {
        const spinnerPath = `${this.props.imagesDir}spinner.gif`;
        const scrollMax = this.state.scrollTop + 300 * 2;

        const groupsDivs = this.props.imageGroups.map((group) => {
            let citeP;
            if (group.cite) {
                citeP = (
                    <p className={css(styles.citeP)}>
                        <a href="{group.citeLink}" target="_blank">
                            {group.cite}
                        </a>
                    </p>
                );
            }
            const imagesDivs = group.images.map((fileName) => {
                const imageName = `${group.groupName}/${fileName}`;
                const imagePath = `${this.props.imagesDir}${imageName}.png`;
                const divClass = css(
                    styles.imageBox,
                    imageName === this.state.activeImage && styles.active,
                );
                return (
                    <div
                        className={divClass}
                        key={imageName}
                        onClick={(e) => this.handleImageClick(imageName, e)}
                    >
                        <LazyLoadMedia
                            alt={fileName}
                            src={imagePath}
                            className={css(styles.img)}
                            placeholderSrc={spinnerPath}
                            parentScrollMax={scrollMax}
                        />
                        <span>{fileName}</span>
                    </div>
                );
            });
            return (
                <div className={css(styles.group)} key={group.groupName}>
                    <h3 className={css(styles.groupH)}>{group.groupName}</h3>
                    {citeP}
                    {imagesDivs}
                </div>
            );
        });

        let currentPath = `${this.props.imagesDir}cute/Blank.png`;
        if (this.props.currentImage) {
            currentPath = `${this.props.imagesDir}${
                this.props.currentImage
            }.png`;
        }

        let currentImageDiv;
        if (!this.state.isHovering) {
            currentImageDiv = (
                <div className={css(styles.previewBox)}>
                    <img
                        className={css(styles.previewImg)}
                        src={currentPath}
                        alt={this.props.currentImage}
                    />
                </div>
            );
        }
        let imageGroupsDiv;
        if (this.state.isHovering) {
            // It's necessary to specify position: relative as an inline style
            // so that the browser calculates correct offsetParent for scrolling
            imageGroupsDiv = (
                <div
                    className={css(styles.groups)}
                    ref={this.scrollerRef}
                    onScroll={this.handleScroll}
                >
                    <div style={{position: "relative"}}>{groupsDivs}</div>
                </div>
            );
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

const styles = StyleSheet.create({
    previewBox: {
        background: "#FFF",
        padding: "2px",
    },
    previewImg: {
        maxWidth: "50px",
        maxHeight: "50px",
    },
    groups: {
        background: "white",
        maxHeight: "300px",
        overflowY: "scroll",
    },
    group: {
        overflow: "auto",
    },
    groupH: {
        margin: "5px",
    },
    citeP: {
        fontSize: "12px",
        margin: "5px",
    },
    imageBox: {
        background: "white",
        border: "2px solid #EEE",
        cursor: "pointer",
        float: "left",
        height: "50px",
        margin: "5px",
        overflow: "hidden",
        padding: "5px",
        whiteSpace: "nowrap",
        width: "140px",
    },
    img: {
        maxHeight: "50px",
        maxWidth: "50px",
        marginRight: "5px",
        verticalAlign: "middle",
    },
    active: {
        boxShadow: "rgb(24, 101, 242) 0px 0px 10px 1px",
    },
});

module.exports = ImageScroller;
