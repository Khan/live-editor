/* NOTE: This file is not currently used, as debugger is never enabled. */
import React, {Component} from "react";

import "../../css/ui/debugger.css";

export default class DebuggerControls extends Component {
    render() {
        // This is just a very simple port from Handlebars
        // If KA/anyone decides to enable debugger in the future,
        // this should be ported to fully utilize React
        return (
            <div>
                {"Debug Mode"}
                <input type="checkbox" className="debug-mode" />
                <span
                    className="debugger-level"
                    style={{display: "none", marginLeft: "20px"}}
                >
                    {"Level"}
                    <select
                        className="debugger-level-select"
                        defaultValue="beginner"
                    >
                        <option value="beginner">{"Beginner"}</option>
                        <option value="advanced">{"Advanced"}</option>
                    </select>
                </span>
                <div
                    className="debugger-simple"
                    style={{display: "none", marginTop: "5px"}}
                >
                    <button
                        className="debug-begin"
                        style={{marginRight: "20px"}}
                    >
                        {"Begin"}
                    </button>
                    <button className="step-in" disabled>
                        {"Step"}
                    </button>
                    <button
                        className="debug-end"
                        disabled
                        style={{marginLeft: "20px"}}
                    >
                        {"End"}
                    </button>
                </div>
                <div
                    className="debugger-complex"
                    style={{display: "none", marginTop: "5px"}}
                >
                    <button
                        className="debug-restart"
                        style={{marginRight: "10px"}}
                    >
                        {"Restart"}
                    </button>
                    <button className="step-over" disabled>
                        {"Step Over"}
                    </button>
                    <button className="step-in" disabled>
                        {"Step In"}
                    </button>
                    <button className="step-out" disabled>
                        {"Step Out"}
                    </button>
                    <button
                        className="debug-continue"
                        disabled
                        style={{marginLeft: "10px"}}
                    >
                        {"Continue"}
                    </button>
                </div>
            </div>
        );
    }
}
