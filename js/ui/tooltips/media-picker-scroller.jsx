import Button from "@khanacademy/wonder-blocks-button";
import { StyleSheet, css } from 'aphrodite';
const LazyLoadImage = require("./lazy-load-image.jsx");
import React, {Component} from 'react';
const slugify = require('slugify');

class MediaPickerScroller extends Component {

    constructor(props) {
        super(props);
        this.state = {
            scrollTop: 0,
            scrollHeight: 320
        };

        this.handleScroll = this.handleScroll.bind(this);
        this.throttledOnScroll = _.throttle(this.handleScroll, 200);
        this.scrollerRef = React.createRef();

        // Add link IDs and node refs to each group
        this.props.groups.forEach((group) => {
            group.linkId = "im-group-" + slugify(group.groupName);
            group.nodeRef = React.createRef();
        });
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
        const scrollTop = this.scrollerRef.current.scrollTop;

        // Figure out which is the last visible group
        let visibleGroup;
        this.props.groups.forEach((group) => {
            // There will be no nodeRef for a single-group scroller
            if (group.nodeRef.current &&
                group.nodeRef.current.offsetTop <= scrollTop) {
                visibleGroup = group.groupName;
            }
        });

        this.setState({
            scrollTop: scrollTop,
            visibleGroup: visibleGroup
        })
    }

    render() {
        const groups = this.props.groups;
        const spinnerPath = `${this.props.imagesDir}/spinner.gif`;
        const scrollMax = this.state.scrollTop + (320 * 2);

        const areMultipleGroups = groups.length > 1;


        // Build list of sidebar links if multiple groups
        let groupsLinks;
        if (areMultipleGroups) {
            const sidebarItems = groups.map((group, ind) => {
                let isActive = false;
                if (group.groupName === this.state.visibleGroup ||
                    (!this.state.visibleGroup && ind === 0)) {
                    isActive = true;
                }
                const aClassName = css(
                    styles.groupsLinksItemA,
                    isActive && styles.groupsLinksItemActiveA
                    );
                const liKey = `${group.groupName}-link`;
                return (
                    <li key={liKey} className={css(styles.groupsLinksItem)}>
                        <a href={`#${group.linkId}`}
                           className={aClassName}>
                           {group.groupName}
                        </a>
                    </li>
                );
            });
            groupsLinks = (
                <ul className={css(styles.groupsLinksList)}>
                    {sidebarItems}
                </ul>
            )
        }

        // Build scrolling divs
        const groupsDivs = groups.map((group) => {
            let groupHeader;
            if (areMultipleGroups) {
                groupHeader = (
                    <h3 key={group.linkRef}
                        ref={group.nodeRef}
                        id={group.linkId}
                        >
                        {group.groupName}
                    </h3>);
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
            const divKey = `${group.groupName}-wrapper`;
            return (
                <div key={divKey}>
                    {groupHeader}
                    {citeLink}
                    {images}
                    {sounds}
                </div>
            );
        });

        // Note that position:relative is inlined so that offsetParent
        // is calculated properly for the lazy-loaded images
        return (
            <div>
                <div className={css(styles.groupsLinksBox)}>
                {groupsLinks}
                </div>
                <div className={css(styles.scrollArea)}
                    style={{position: "relative"}}
                    ref={this.scrollerRef}
                    onScroll={this.handleScroll}
                    >
                {groupsDivs}
                </div>
            </div>
        );
    }
}

const styles = StyleSheet.create({
    scrollArea: {
        color: "rgb(85, 85, 85)",
        width: "520px",
        height: "320px",
        overflowY: "auto",
        float: "left",
        position: "relative",
        boxSizing: "border-box",
        padding: "0 120px 0 20px"
    },
    fileBox: {
        cursor: "pointer",
        fontSize: "14px"
    },
    imageBox: {
        display: "inline-block",
        height: "100px",
        width: "100px",
        marginRight: "20px",
        marginBottom: "20px",
        textAlign: "center",
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
        fontStyle: "italic",
        marginTop: "5px"
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
        display: "inline-block",
        marginTop: "5px"
    },
    soundPreview: {
        width: "250px",
        background: "black"
    },
    groupsLinksBox: {
        float: "right",
        width: "100px",
        top: "10px",
        right: "20px"
    },
    groupsLinksList: {
        marginLeft: "0",
        marginBottom: "20px",
        listStyle: "none"
    },
    groupsLinksItem: {
        float: "left"
    },
    groupsLinksItemA: {
        borderRadius: "5px",
        display: "block",
        lineHeight: "14px",
        margin: "2px 2px 2px 0px",
        padding: "8px 12px"
    },
    groupsLinksItemActiveA: {
        color: "#ffffff",
        backgroundColor: "#0088cc"
    }
});

module.exports = MediaPickerScroller;