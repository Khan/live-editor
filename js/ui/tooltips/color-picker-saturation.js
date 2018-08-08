import React from "react";
import {StyleSheet, css} from "aphrodite/no-important";
import Color from "color";

const containerSize = 150;

export default class SaturationPicker extends React.Component {
    props: {
        color: Object, // h, s, l
        onColorChange: Function,
    };

    constructor(props) {
        super(props);
        this.state = {
            color: Color(props.color),
        };
        this.containerRef = React.createRef();
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidUpdate(prevProps) {
        if (this.props.color.string() !== prevProps.color.string()) {
            // eslint-disable-next-line react/no-did-update-set-state
            this.setState({color: Color(this.props.color)});
        }
    }

    handleMouseEvent(e, eventType) {
        const {saturation, lightness} = this.calculateVal(e);
        if (
            saturation === this.state.color.object().s &&
            lightness === this.state.color.object().l
        ) {
            return;
        }
        const newColor = Color.hsl(
            this.state.color.object().h,
            saturation,
            lightness,
        );
        this.setState({color: newColor});
        this.props.onColorChange(newColor, eventType);
    }

    handleMouseDown(e) {
        this.handleMouseEvent(e, "startScrub");
        this.setState({isScrubbing: true});
    }

    handleMouseUp(e) {
        this.handleMouseEvent(e, "stopScrub");
        this.setState({isScrubbing: false});
    }

    handleMouseMove(e) {
        if (!this.state.isScrubbing) {
            return;
        }
        this.handleMouseEvent(e, "midScrub");
        this.handleMouseEvent(e);
    }

    handleMouseLeave(e) {
        this.setState({isScrubbing: false});
    }

    handleClick(e) {
        this.setState({isScrubbing: false});
        this.handleMouseEvent(e, "click");
    }

    calculateScrubberPos() {
        const left = containerSize * (this.state.color.object().s / 100);
        const top =
            containerSize - containerSize * (this.state.color.object().l / 100);
        return {left: Math.round(left) + "px", top: Math.round(top) + "px"};
    }

    calculateVal(e) {
        const container = this.containerRef.current;
        const x = typeof e.pageX === "number" ? e.pageX : e.touches[0].pageX;
        const y = typeof e.pageY === "number" ? e.pageY : e.touches[0].pageY;
        let left =
            x - (container.getBoundingClientRect().left + window.pageXOffset);
        let top =
            y - (container.getBoundingClientRect().top + window.pageYOffset);
        if (left < 0) {
            left = 0;
        } else if (left > containerSize) {
            left = containerSize;
        }
        if (top < 0) {
            top = 0;
        } else if (top > containerSize) {
            top = containerSize;
        }

        const saturation = (left * 100) / containerSize;
        const lightness = -((top * 100) / containerSize) + 100;
        return {saturation, lightness};
    }

    calcBackgroundColor() {
        return Color.hsl(this.state.color.object().h, 100, 50).string();
    }

    render() {
        const {left, top} = this.calculateScrubberPos();
        return (
            <div
                ref={this.containerRef}
                className={css(styles.container)}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
                onMouseLeave={this.handleMouseLeave}
                onClick={this.handleClick}
            >
                <div
                    className={css(styles.overlay)}
                    style={{backgroundColor: this.calcBackgroundColor()}}
                >
                    <div className={css(styles.overlay, styles.light)}>
                        <div className={css(styles.overlay, styles.dark)} />
                        <div
                            className={css(styles.scrubber)}
                            style={{left, top}}
                        />
                    </div>
                </div>
            </div>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        background:
            "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        cursor: "crosshair",
        height: `${containerSize}px`,
        position: "relative",
        width: `${containerSize}px`,
    },
    overlay: {
        bottom: 0,
        left: 0,
        position: "absolute",
        top: 0,
        right: 0,
    },
    light: {
        background:
            "linear-gradient(to right, rgb(255, 255, 255), rgba(255, 255, 255, 0))",
    },
    dark: {
        background: "linear-gradient(to top, rgb(0, 0, 0), rgba(0, 0, 0, 0))",
    },
    scrubber: {
        background: "rgb(255, 255, 255)",
        border: "1px solid white",
        borderRadius: "50%",
        cursor: "crosshair",
        height: "8px",
        left: 0,
        position: "absolute",
        top: 0,
        transform: "translateX(-4px, -4px)",
        width: "8px",
    },
});
