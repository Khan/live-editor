import Button from "@khanacademy/wonder-blocks-button";
import { StyleSheet, css } from 'aphrodite';
const LazyLoadImage = require("./lazy-load-image.jsx");
import React, {Component} from 'react';
const slugify = require('slugify');

class MediaPickerScroller extends Component {

    constructor(props) {
        super(props);
        this.state = {
            scrollTop: 0
        };

        this.handleScroll = this.handleScroll.bind(this);
        this.throttledOnScroll = _.throttle(this.handleScroll, 200);
        this.scrollerRef = React.createRef();
    }

    componentDidMount () {
        this.calculateDomPosition();
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

    render() {
        const groups = this.props.groups;
        const spinnerPath = `${this.props.imagesDir}/spinner.gif`;
        const scrollMax = this.state.scrollTop + (300 * 2);
        console.log(scrollMax);

        const areMultipleGroups = groups.length > 1;
        // Add linkRefs to each group
        groups.forEach((group) => {
            group.linkRef = "im-group-" + slugify(group.groupName);
        });

        // Build list of sidebar links if multiple groups
        let groupsLinks;
        if (areMultipleGroups) {
            const sidebarItems = groups.map((group, ind) => {
                let itemClass;
                if (ind === 0) {
                    itemClass = "active";
                }
                return (
                    <li className={itemClass}>
                        <a href={group.linkRef}>{group.groupName}</a>
                    </li>
                );
            });
            groupsLinks = (
                <ul className="nav nav-pills nav-stackable">
                    {sidebarItems}
                </ul>
            )
        }

        // Build scrolling divs
        const groupsDivs = groups.map((group) => {
            let groupHeader;
            if (areMultipleGroups) {
                groupHeader = <h3 id={group.linkRef}>{group.groupName}</h3>
            }
            let citeLink;
            if (group.cite) {
                citeLink = (
                    <p>
                        <a href="{group.cite}" target="_blank">
                        {group.cite}
                        </a>
                    </p>
                );
            }
            console.log(group);
            const thumbsDir = group.thumbsDir || "";
            const images = group.images && group.images.map((fileName) => {
                const imageName = `${group.groupName}/${fileName}`;
                const imagePath = `${this.props.imagesDir}${group.groupName}${thumbsDir}/${fileName}.png`;
                return (
                    <div className={css(styles.fileBox, styles.imageBox)}
                        key={imageName}
                        onClick={(e) => this.handleImageClick(imageName, e)}>
                        <LazyLoadImage
                            className={css(styles.imagePreview)}
                            alt={fileName}
                            src={imagePath}
                            placeholderSrc={spinnerPath}
                            parentScrollMax={scrollMax}
                            />
                        <span className={css(styles.imageCaption)}>{fileName}</span>
                    </div>
                );
            });
            const sounds = group.sounds && group.sounds.map((fileName) => {
                const soundName = `${group.groupName}/${fileName}`;
                const soundPath = `${this.props.soundsDir}${group.groupName}${fileName}.mp3`;
                return (
                    <div className={css(styles.fileBox, styles.soundBox)}
                        key={soundName}
                        onClick={(e) => this.handleSoundClick(soundName, e)}>
                        <LazyLoadImage
                            className={css(styles.soundPreview)}
                            type="audio"
                            src={soundPath}
                            parentScrollMax={scrollMax}
                            />
                        <span className={css(styles.soundCaption)}>
                            {fileName}
                        </span>
                    </div>
                );
            });

            return (
                <div className="mediapicker-modal-group">
                    {groupHeader}
                    {citeLink}
                    {images}
                    {sounds}
                </div>
            );
        });

        return (
            <div >
                <div className={css(styles.groupsLinks)}>
                {groupsLinks}
                </div>
                <div ref={this.scrollerRef}
                    onScroll={this.handleScroll}
                    style={{
                        width: "520px",
                        height: "320px",
                        overflowY: "auto",
                        float: "left",
                        position: "relative",
                        boxSizing: "border-box",
                        padding: "0 120px 0 20px"
                    }}
                    >
                {groupsDivs}
                </div>
            </div>
        );
    }
}

const styles = StyleSheet.create({
    fileBox: {
        cursor: "pointer"
    },
    imageBox: {
        display: "inline-block",
        width: "100px",
        marginRight: "20px",
        marginBottom: "20px"
    },
    imagePreview: {
        maxWidth: "100%",
        maxHeight: "100%",
        display: "inline-block",
        verticalAlign: "middle"
    },
    imageCaption: {
        width: "100%",
        display: "inline-block",
        textAlign: "center",
        fontStyle: "italic"
    },
    soundBox: {
        borderRadius: "6px",
        marginBottom: "6px",
        padding: "4px 2px 2px 4px"
    },
    soundCaption: {
        fontStyle: "italic",
        verticalAlign: "top",
        paddingTop: "5px",
        display: "inline-block"
    },
    soundPreview: {
        width: "250px",
        background: "black"
    },
    groupsLinks: {
        float: "right",
        width: "100px",
        top: "10px",
        right: "20px"
    },
});

module.exports = MediaPickerScroller;