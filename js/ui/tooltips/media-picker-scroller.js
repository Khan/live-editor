import slugify from "slugify";
import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";
import Color from "@khanacademy/wonder-blocks-color";

import LazyLoadMedia from "./lazy-load-media.js";

export default class MediaPickerScroller extends Component {
    props: {
        groups: Array<Object>,
        mediaDir: string,
        onFileSelect: (info: Object) => void,
    };

    constructor(props) {
        super(props);
        this.state = {
            scrollTop: 0,
            scrollHeight: 320,
            activeFileInfo: {},
        };

        this.scrollerRef = React.createRef();
        this.handleScroll = this.handleScroll.bind(this);
        this.handleFileSelect = this.handleFileSelect.bind(this);

        // Add link IDs and node refs to each group
        this.props.groups.forEach((group) => {
            group.linkId = "im-group-" + slugify(group.groupName);
            group.nodeRef = React.createRef();

            const thumbsDir = group.thumbsDir || "";
            group.imagesInfo =
                group.images &&
                group.images.map((fileName) => {
                    return {
                        fullImgPath: `${this.props.mediaDir}${
                            group.groupName
                        }/${fileName}.png`,
                        fullThumbPath: `${this.props.mediaDir}${
                            group.groupName
                        }${thumbsDir}/${fileName}.png`,
                        groupAndName: `${group.groupName}/${fileName}`,
                        name: fileName,
                    };
                });
            group.soundsInfo =
                group.sounds &&
                group.sounds.map((fileName) => {
                    return {
                        fullPath: `${this.props.mediaDir}${
                            group.groupName
                        }/${fileName}.mp3`,
                        groupAndName: `${group.groupName}/${fileName}`,
                        name: fileName,
                    };
                });
        });
    }

    componentDidMount() {
        this.calculateDomPosition();
        // Ideally, this would be an onScroll event, but the modal parent
        //  is actually the one recieving that event, so we use
        //  our dear old friend, window.setInterval
        this.checkScrollTimer = window.setInterval(this.handleScroll, 300);
    }

    componentWillUnmount() {
        window.clearInterval(this.checkScrollTimer);
    }

    handleFileSelect(fileInfo) {
        this.setState({activeFileInfo: fileInfo});
        this.props.onFileSelect(fileInfo);
    }

    handleScroll(e) {
        this.calculateDomPosition();
    }

    handleGroupClick(group) {
        this.setState({visibleGroup: group});
    }

    calculateDomPosition() {
        if (!this.scrollerRef.current) {
            return;
        }
        // The offsetParent's offsetParent is the one that it's scrolling inside
        // TODO(pamela): Compute this in a less hard-coded way
        const scrollParent = this.scrollerRef.current.offsetParent.offsetParent;
        const scrollTop = scrollParent.scrollTop;
        const parentHeight = scrollParent.getBoundingClientRect().height;

        // Figure out which is the last visible group
        let visibleGroup = this.props.groups[0].groupName;
        this.props.groups.forEach((group) => {
            // There will be no nodeRef for a single-group scroller
            if (
                group.nodeRef.current &&
                group.nodeRef.current.offsetTop < scrollTop
            ) {
                visibleGroup = group.groupName;
            }
        });

        this.setState({
            scrollMax: scrollTop + parentHeight * 1.5,
            visibleGroup: visibleGroup,
        });
    }

    render() {
        const groups = this.props.groups;
        const spinnerPath = `${this.props.mediaDir}/spinner.gif`;
        const areMultipleGroups = groups.length > 1;

        // Build list of sidebar links if multiple groups
        let groupsLinks;
        if (areMultipleGroups) {
            const sidebarItems = groups.map((group, ind) => {
                let isActive = false;
                if (
                    group.groupName === this.state.visibleGroup ||
                    (!this.state.visibleGroup && ind === 0)
                ) {
                    isActive = true;
                }
                const aClassName = css(
                    styles.groupsLinksItemA,
                    isActive && styles.groupsLinksItemActiveA,
                );
                const liKey = `${group.groupName}-link`;
                return (
                    <li key={liKey} className={css(styles.groupsLinksItem)}>
                        <a
                            href={`#${group.linkId}`}
                            className={aClassName}
                            onClick={(e) =>
                                this.handleGroupClick(group.groupName, e)
                            }
                        >
                            {group.groupName}
                        </a>
                    </li>
                );
            });
            groupsLinks = (
                <ul className={css(styles.groupsLinksList)}>{sidebarItems}</ul>
            );
        }

        // Build scrolling divs
        const groupsDivs = groups.map((group) => {
            let groupHeader;
            if (areMultipleGroups) {
                groupHeader = (
                    <h3
                        key={group.linkRef}
                        ref={group.nodeRef}
                        id={group.linkId}
                    >
                        {group.groupName}
                    </h3>
                );
            }
            let citeLink;
            if (group.cite) {
                citeLink = (
                    <p style={styles.cite}>
                        <a href={group.cite} target="_blank">
                            {group.cite}
                        </a>
                    </p>
                );
            }

            const images =
                group.imagesInfo &&
                group.imagesInfo.map((info) => {
                    const isActive =
                        this.state.activeFileInfo &&
                        info.name === this.state.activeFileInfo.name;
                    const divClass = css(
                        styles.fileBox,
                        styles.imageBox,
                        isActive && styles.fileBoxActive,
                    );
                    return (
                        <div
                            className={divClass}
                            key={info.groupAndName}
                            onClick={(e) => this.handleFileSelect(info, e)}
                        >
                            <figure className={css(styles.imagePreviewWrapper)}>
                                <figcaption
                                    className={css(styles.imageCaption)}
                                >
                                    {info.name}
                                </figcaption>
                                <LazyLoadMedia
                                    className={css(styles.imagePreview)}
                                    alt={info.name}
                                    src={info.fullThumbPath}
                                    placeholderSrc={spinnerPath}
                                    parentScrollMax={this.state.scrollMax}
                                />
                            </figure>
                        </div>
                    );
                });
            const sounds =
                group.soundsInfo &&
                group.soundsInfo.map((info) => {
                    const isActive =
                        this.state.activeFileInfo &&
                        info.name === this.state.activeFileInfo.name;
                    const divClass = css(
                        styles.fileBox,
                        styles.soundBox,
                        isActive && styles.fileBoxActive,
                    );
                    return (
                        <div
                            className={divClass}
                            key={info.groupAndName}
                            onPlay={(e) => this.handleFileSelect(info, e)}
                        >
                            <LazyLoadMedia
                                className={css(styles.soundPreview)}
                                type="audio"
                                src={info.fullPath}
                                placeholderSrc=""
                                parentScrollMax={this.state.scrollMax}
                            />
                            <span className={css(styles.soundCaption)}>
                                {info.name}
                            </span>
                        </div>
                    );
                });
            const divKey = `${group.groupName}-wrapper`;
            return (
                <div key={divKey}>
                    {groupHeader}
                    {citeLink}
                    <div className={css(styles.mediaGrid)}>
                        {images}
                        {sounds}
                    </div>
                </div>
            );
        });

        // Note that position:relative is inlined so that offsetParent
        // is calculated properly for the lazy-loaded images
        return (
            <div onScroll={this.handleScroll}>
                <div className={css(styles.groupsLinksBox)}>{groupsLinks}</div>
                <div
                    className={css(styles.scrollArea)}
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
        //width: "520px",
        //height: "320px",
        overflowY: "auto",
        float: "left",
        position: "relative",
        boxSizing: "border-box",
        padding: "0 120px 0 20px",
        width: "90%",
    },
    mediaGrid: {
        display: "flex",
        flexWrap: "wrap",
    },
    fileBox: {
        borderRadius: "4px",
        cursor: "pointer",
        fontSize: "14px",
        flex: "1 1 80px",
        padding: "4px",
    },
    fileBoxActive: {
        boxShadow: "0 0 10px 1px rgb(24, 101, 242)",
    },
    imageBox: {
        display: "inline-block",
        marginBottom: "8px",
        marginRight: "4px",
        textAlign: "center",
    },
    imagePreviewWrapper: {
        margin: "0",
        overflow: "hidden",
    },
    imagePreview: {
        maxWidth: "100%",
        height: "auto",
        display: "block",
        verticalAlign: "middle",
    },
    imageCaption: {
        fontSize: "11px",
        fontStyle: "italic",
        marginBottom: "6px",
    },
    soundBox: {
        borderRadius: "6px",
        marginBottom: "6px",
        padding: "4px 2px 2px 4px",
    },
    soundCaption: {
        fontStyle: "italic",
        verticalAlign: "top",
        paddingTop: "5px",
        display: "inline-block",
        marginTop: "5px",
    },
    soundPreview: {
        width: "250px",
        background: "white",
    },
    cite: {
        fontSize: "12px"
    },
    groupsLinksBox: {
        float: "right",
        position: "sticky",
        top: "10px",
        right: "20px",
        width: "10%",
    },
    groupsLinksList: {
        listStyle: "none",
        marginLeft: "0",
        padding: "0px",
    },
    groupsLinksItem: {
        display: "inline-block",
    },
    groupsLinksItemA: {
        borderRadius: "4px",
        borderColor: Color.offBlack50,
        borderWidth: "1px",
        borderStyle: "solid",
        color: Color.blue,
        display: "block",
        lineHeight: "14px",
        margin: "2px 2px 15px 0px",
        padding: "8px 12px",
        textDecoration: "none",
        width: "40px",
    },
    groupsLinksItemActiveA: {
        borderColor: Color.blue,
        borderWidth: 2,
    },
});
