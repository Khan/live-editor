import React from "react";
import {StyleSheet, css} from "aphrodite/no-important";
import Color from "color";

export default class HuePicker extends React.Component {
    props: {
        color: Object, // h, s, l
        onColorChange: Function,
    };

    constructor(props) {
        super(props);
        this.state = {
            color: Color(props.color),
        };
        this.hueRef = React.createRef();
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }

    handleMouseEvent(e, eventType) {
        const newHue = this.calculateVal(e);
        if (newHue === this.state.color.object().h) {
            return;
        }
        const newColor = Color.hsl(
            newHue,
            this.state.color.object().s,
            this.state.color.object().l,
        );
        this.setState({color: newColor});
        this.props.onColorChange(newColor, eventType);
    }

    handleMouseDown(e) {
        this.handleMouseEvent(e, "startScrub");
        this.setState({isDraggingHue: true});
    }

    handleMouseUp(e) {
        this.handleMouseEvent(e, "stopScrub");
        this.setState({isDraggingHue: false});
    }

    handleMouseMove(e) {
        if (!this.state.isDraggingHue) {
            return;
        }
        this.handleMouseEvent(e, "midScrub");
        this.handleMouseEvent(e);
    }

    handleMouseLeave(e) {
        this.setState({isDraggingHue: false});
    }

    handleClick(e) {
        this.setState({isDraggingHue: false});
        this.handleMouseEvent(e, "click");
    }

    calculateScrubberLeft() {
        const xOff = 150 * (this.state.color.object().h / 360);
        return Math.round(xOff);
    }

    calculateVal(e) {
        const container = this.hueRef.current;
        const containerWidth = container.clientWidth;
        const x = typeof e.pageX === "number" ? e.pageX : e.touches[0].pageX;
        const left =
            x - (container.getBoundingClientRect().left + window.pageXOffset);

        let hue;
        if (left < 0) {
            hue = 0;
        } else if (left > containerWidth) {
            hue = 359;
        } else {
            const percent = (left * 100) / containerWidth;
            hue = (360 * percent) / 100;
        }

        return hue;
    }

    render() {
        const scrubberLeft = this.calculateScrubberLeft();
        return (
            <div
                ref={this.hueRef}
                className={css(styles.container)}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseUp}
                onMouseLeave={this.handleMouseLeave}
                onClick={this.handleClick}
            >
                <div
                    className={css(styles.scrubber)}
                    style={{left: scrubberLeft}}
                />
            </div>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        background:
            "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
        cursor: "crosshair",
        height: "20px",
        position: "relative",
        width: "100%",
    },
    scrubber: {
        background: "rgb(255, 255, 255)",
        borderRadius: "1px",
        boxShadow: "rgba(0, 0, 0, 0.6) 0px 0px 2px",
        height: "100%",
        position: "absolute",
        top: 0,
        transform: "translateX(-2px)",
        width: "4px",
    },
});
