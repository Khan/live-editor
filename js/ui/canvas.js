import React, {Component} from "react";
import {css} from "aphrodite/no-important";

import SharedStyles from "./shared-styles.js";

export default class DrawCanvas extends Component {
    props: {
        width: number,
        height: number,
        onColorSet: Function,
        record: Object,
    };

    static defaultProps = {
        width: 400,
        height: 400,
    };

    constructor(props) {
        super(props);
        this.state = {
            isDrawing: false,
        };

        this.canvasRef = React.createRef();

        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseAway = this.handleMouseAway.bind(this);
        this.bindRecordView();
    }

    componentDidMount() {
        this.ctx = this.canvasRef.current.getContext("2d");
        this.ctx.shadowBlur = 2;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.lineWidth = 1;

        this.clear(true);
    }

    handleMouseDown(e) {
        // Left mouse button
        if (this.props.record.recording && e.button === 0) {
            this.startLine(e.offsetX, e.offsetY);
            e.preventDefault();
        }
    }

    handleMouseMove(e) {
        if (this.props.record.recording) {
            this.drawLine(e.offsetX, e.offsetY);
        }
    }

    handleMouseAway(e) {
        if (this.props.record.recording) {
            this.endLine();
        }
    }

    bindRecordView() {
        const record = this.props.record;

        record.on("runSeek", () => {
            this.clear(true);
            this.endDraw();
        });

        // Handle record seek caching
        record.seekCachers.canvas = {
            getState: () => {
                if (!this.state.isDrawing) {
                    return;
                }

                // Copy the canvas contents
                const tmpCanvas = document.createElement("canvas");
                tmpCanvas.width = tmpCanvas.height = this.props.width;
                tmpCanvas
                    .getContext("2d")
                    .drawImage(this.canvasRef.current, 0, 0);

                // Store Canvas state
                return {
                    x: this.state.x,
                    y: this.state.y,
                    down: this.state.down,
                    color: this.state.color,
                    canvas: tmpCanvas,
                };
            },

            restoreState: (cacheData) => {
                this.startDraw();

                // Restore Canvas state
                this.setState({
                    x: cacheData.x,
                    y: cacheData.y,
                    down: cacheData.down,
                });
                this.setColor(cacheData.color);

                // Restore canvas image
                // Disable shadow (otherwise the image will have a shadow!)
                const oldShadow = this.ctx.shadowColor;
                this.ctx.shadowColor = "rgba(0,0,0,0.0)";
                this.ctx.drawImage(cacheData.canvas, 0, 0);
                this.ctx.shadowColor = oldShadow;
            },
        };

        // Initialize playback commands
        const commands = [
            "startLine",
            "drawLine",
            "endLine",
            "setColor",
            "clear",
        ];
        commands.forEach((name) => {
            record.handlers[name] = () => {
                this[name](...arguments);
            };
        });
    }

    startLine(x, y) {
        if (!this.state.down) {
            this.setState({x, y, down: true});
            this.props.record.log("startLine", x, y);
        }
    }

    drawLine(x, y) {
        if (this.state.down && this.state.x != null && this.state.y != null) {
            this.ctx.beginPath();
            this.ctx.moveTo(this.state.x, this.state.y);
            this.ctx.lineTo(x, y);
            this.ctx.stroke();
            this.ctx.closePath();

            this.setState({x, y});
            this.props.record.log("drawLine", x, y);
        }
    }

    endLine() {
        if (this.state.down) {
            this.setState({down: false});
            this.props.record.log("endLine");
        }
    }

    setColor(color) {
        const colors = {
            black: [0, 0, 0],
            red: [255, 0, 0],
            orange: [255, 165, 0],
            green: [0, 128, 0],
            blue: [0, 0, 255],
            lightblue: [173, 216, 230],
            violet: [128, 0, 128],
        };

        if (color != null) {
            if (!this.state.isDrawing) {
                this.startDraw(true);
            }

            this.setState({color});

            this.ctx.shadowColor = "rgba(" + colors[color] + ",0.5)";
            this.ctx.strokeStyle = "rgba(" + colors[color] + ",1.0)";

            this.props.record.log("setColor", color);
        }
        this.props.onColorSet(color);
    }

    clear(force) {
        // Clean off the canvas
        this.ctx.clearRect(0, 0, 600, 480);
        this.setState({x: null, y: null, down: false});

        if (force !== true) {
            this.props.record.log("clear");
        }
    }

    startDraw(colorDone) {
        if (this.state.isDrawing) {
            return;
        }

        this.setState({isDrawing: true});
        if (colorDone !== true) {
            this.setColor("black");
        }
    }

    endDraw() {
        if (!this.state.isDrawing) {
            return;
        }

        this.setState({isDrawing: false});
        this.setColor(null);
    }

    render() {
        const displayProp = this.state.isDrawing ? "block" : "none";
        return (
            <canvas
                ref={this.canvasRef}
                className={css(SharedStyles.outputFullSize)}
                style={{display: displayProp}}
                width={this.props.width}
                height={this.props.height}
                onMouseDown={this.handleMouseDown}
                onMouseMove={this.handleMouseMove}
                onMouseUp={this.handleMouseAway}
                onMouseOut={this.handleMouseAway}
            />
        );
    }
}
