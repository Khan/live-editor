/**
 * A fairly simple media playback component that keeps track of play state
 * as well as playback time. This is _almost_ a purely presentational component,
 * but we keep track of the seek state while the user is dragging the bar.
 */
/* globals i18n */
import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";
import Button from "@khanacademy/wonder-blocks-button";
import Color from "@khanacademy/wonder-blocks-color";
import Icon from "@khanacademy/wonder-blocks-icon";

// Get a constrained seek position that accounts for null/zero values
const getSeekPosition = (current, total) =>
    !(current || total) ? 0 : Math.min(1, Math.max(0, current / total));

// Get a reasonable CSS percentage value rounded to nearest 1/100th
const getCSSPercentage = (position) =>
    (Math.round(100 * 100 * position) / 100).toString() + "%";

// Get a time value string from milliseconds
const getTimeValue = (ms) => {
    const seconds = Math.floor(ms / 1000);
    const displayMinutes = Math.floor(seconds / 60).toString();
    let displaySeconds = (seconds % 60).toString();
    if (displaySeconds.length === 1) {
        displaySeconds = "0" + displaySeconds;
    }
    return displayMinutes + ":" + displaySeconds;
};

export default class PlaybackBar extends Component {
    props: {
        // Current point in playback (ms)
        currentTime: number,
        // A callback fired when the play/pause button is clicked
        onClickPlay: Function,
        // A callback fired while we are seeking
        onSeek: Function,
        // A callback fired when we finish seeking
        onSeekEnd: Function,
        // A callback fired when we start seeking
        onSeekStart: Function,
        // Whether we are currently playing
        playing: boolean,
        // Whether the LiveEditor has deemed the audio ready to play
        readyToPlay: boolean,
        // The total playback time
        totalTime: number,
        // Optional link to YouTube version
        youtubeUrl: string,
    };

    static defaultProps = {
        currentTime: 0,
    };

    constructor(props) {
        super(props);
        this.state = {
            dragging: false,
            seekPosition: null,
        };
        this.handleSeekDown = this.handleSeekDown.bind(this);
        this.handleSeekMove = this.handleSeekMove.bind(this);
        this.handleSeekRelease = this.handleSeekRelease.bind(this);
    }

    handleSeekDown(e) {
        // We're going to release on the next mouseUp event
        this.setState({dragging: true});
        document.addEventListener("mousemove", this.handleSeekMove);
        document.addEventListener("mouseup", this.handleSeekRelease);
        // Apply some CSS to the document body to prevent text selection
        // and to keep cursor: pointer while dragging
        document.body.classList.add(css(bodyStyles.seeking));
        this.handleSeekMove(e);
        if (this.props.onSeekStart) {
            this.props.onSeekStart();
        }
    }

    handleSeekMove(e) {
        const seek = this.refs.seek;
        const bounds = seek.getBoundingClientRect();
        const seekPosition = Math.max(
            Math.min(1, (e.clientX - bounds.left) / bounds.width),
            0,
        );
        this.setState({seekPosition});
        this.props.onSeek(seekPosition * this.props.totalTime);
    }

    handleSeekRelease(e) {
        document.removeEventListener("mousemove", this.handleSeekMove);
        document.removeEventListener("mouseup", this.handleSeekRelease);
        document.body.classList.remove(css(bodyStyles.seeking));
        this.setState({
            dragging: false,
            seekPosition: null,
        });
        this.props.onSeekEnd();
    }

    render() {
        const {
            currentTime,
            onClickPlay,
            playing,
            readyToPlay,
            totalTime,
            youtubeUrl,
        } = this.props;
        const {dragging, seekPosition} = this.state;
        const seekPositionCSS = getCSSPercentage(
            seekPosition !== null
                ? seekPosition
                : getSeekPosition(currentTime, totalTime),
        );
        const iconLabel = (
            <Icon
                style={{marginTop: "6px", marginLeft: "8px"}}
                icon={readyToPlay && playing ? icons.pause : icons.play}
                size="medium"
            />
        );
        return (
            <div className={css(styles.wrap, !readyToPlay && styles.waiting)}>
                <Button
                    aria-label={
                        readyToPlay && playing
                            ? i18n._("Pause")
                            : i18n._("Play")
                    }
                    style={[styles.button, styles.buttonPlay]}
                    onClick={onClickPlay}
                    kind="secondary"
                >
                    {iconLabel}
                </Button>
                <div
                    className={css(styles.seek)}
                    onMouseDown={this.handleSeekDown}
                    ref="seek"
                >
                    <div className={css(styles.seekInner)}>
                        <div
                            className={css(styles.seekProgress)}
                            style={{
                                width: seekPositionCSS,
                            }}
                        />
                    </div>
                    <div
                        className={css(
                            styles.seekHandle,
                            dragging && styles.seekHandleActive,
                        )}
                        style={{
                            left: seekPositionCSS,
                        }}
                    />
                </div>
                {!!totalTime && (
                    <div className={css(styles.time)}>
                        {getTimeValue(
                            seekPosition !== null
                                ? seekPosition * totalTime
                                : currentTime,
                        )}
                        {"/"}
                        {getTimeValue(totalTime)}
                    </div>
                )}
                {youtubeUrl && (
                    <Button
                        style={[styles.button, styles.buttonYoutube]}
                        aria-label={i18n._("Watch this talkthrough on YouTube")}
                        href={youtubeUrl}
                        kind="tertiary"
                    >
                        <Icon
                            style={{marginTop: "6px"}}
                            size="medium"
                            icon={icons.youtube}
                        />
                    </Button>
                )}
            </div>
        );
    }
}

const icons = {
    play: {
        medium:
            "M2.4 14.85C2.25 15 1.95 15 1.8 15 1.65 15 1.5 15 1.35 14.85 1.05 14.7.9 14.4.9 14.1V.9c0-.3.3-.6.6-.75C1.65 0 2.1 0 2.4.15l11.4 6.75c.3.15 .45.45 .45.75 0 .3-.15.6-.45.75L2.4 14.85z",
    },
    pause: {
        medium:
            "M16.005.666l0 14.674q.009.273-.191.474t-.474.191l-5.335 0q-.265 0-.465-.201t-.201-.465l0-14.674q0-.273.201-.474t.465-.191l5.335 0q.273-.009.474 .191t.191.474zm-9.339 0 0 14.674q.009.273-.191.474t-.474.191l-5.335 0q-.265 0-.465-.201t-.201-.465l0-14.674q0-.273.201-.474t.465-.191l5.335 0q.273-.009.474 .191t.191.474z",
    },
    youtube: {
        medium:
            "M17.205 8.608q0-.494-.4-.729l-6.891-4.304q-.412-.27-.858-.024t-.459.753l0 8.597q0 .506.447 .753.223 .106.459 .106t.412-.129l6.891-4.304q.4-.223.4-.717zm6.88 0q0 1.294-.024 2.705t-.412 3.128q-.223.976-.929 1.646t-1.658.776q-2.987.341-9.02.341t-9.02-.341q-.953-.106-1.67-.776t-.929-1.588-.306-2.176q-.118-1.247-.118-3.128t.024-3.305.412-3.116q.212-.976.917-1.658.717-.67 1.67-.776 2.987-.341 9.02-.341t9.02.341q.953.106 1.67.776t.929 1.599.306 2.034.106 1.835.012 2.023z",
    },
};

const seekHeight = 20;

const bodyStyles = StyleSheet.create({
    // Applied to the body while we're seeking with the slider
    seeking: {
        cursor: "pointer",
        userSelect: "none",
    },
});

const styles = StyleSheet.create({
    button: {
        alignItems: "center",
        boxSizing: "border-box",
        display: "flex",
        justifyContent: "center",
        height: 32,
        width: 32,
    },
    buttonPlay: {
        marginRight: 5,
    },
    buttonYoutube: {
        marginLeft: 5,
        padding: 4,
    },
    seek: {
        alignItems: "center",
        cursor: "pointer",
        display: "flex",
        flex: 1,
        height: seekHeight,
        minWidth: 400,
        position: "relative",
    },
    seekInner: {
        background: "#D6D8DA",
        height: "25%",
        width: "100%",
    },
    seekProgress: {
        height: "100%",
    },
    seekHandle: {
        background: Color.blue,
        borderColor: "transparent",
        borderWidth: seekHeight / 4,
        display: "block",
        height: "100%",
        marginLeft: -seekHeight / 8,
        position: "absolute",
        top: 0,
        width: seekHeight / 4,
        ":hover": {
            marginLeft: -seekHeight / 4,
            width: seekHeight / 2,
        },
    },
    seekHandleActive: {
        marginLeft: -seekHeight / 4,
        width: seekHeight / 2,
    },
    time: {
        paddingLeft: 10,
        textAlign: "center",
        // Keep width constant even as time changes
        // This is good for two-digit numbers of minutes
        // Hopefully none of our talkthroughs are longer than that
        // That would make Sal pretty upset.
        width: 80,
    },
    waiting: {
        opacity: 0.5,
        pointerEvents: "none",
    },
    wrap: {
        alignItems: "center",
        display: "flex",
        justifyContent: "space-between",
        userSelect: "none",
    },
});
