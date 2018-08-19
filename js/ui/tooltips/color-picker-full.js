import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";
import Color from "color";

import HuePicker from "./color-picker-hue.js";
import SaturationPicker from "./color-picker-saturation.js";

export default class ColorPickerFull extends Component {
    props: {
        color: Object,
        onColorChange: Function,
    };

    static defaultProps = {
        mode: "rgb",
    };

    constructor(props) {
        super(props);
        // We use hsl behind the scenes,
        // but we recieve and send back rgb
        this.state = {
            color: Color(props.color).hsl(),
        };
        this.handleColorChange = this.handleColorChange.bind(this);
    }

    handleColorChange(newColor, eventType) {
        const colorToSend = newColor.rgb().object();
        colorToSend.r = Math.round(colorToSend.r);
        colorToSend.g = Math.round(colorToSend.g);
        colorToSend.b = Math.round(colorToSend.b);
        this.setState({color: newColor});
        this.props.onColorChange(colorToSend, eventType);
    }

    render() {
        return (
            <div className={css(styles.picker)}>
                <div>
                    <HuePicker
                        color={this.state.color}
                        onColorChange={this.handleColorChange}
                    />
                </div>
                <div className={css(styles.saturation)}>
                    <SaturationPicker
                        color={this.state.color}
                        onColorChange={this.handleColorChange}
                    />
                </div>
            </div>
        );
    }
}

const styles = StyleSheet.create({
    picker: {
        height: "180px",
        width: "150px",
    },
    saturation: {
        marginTop: "6px",
    },
});
