import React, {Component} from "react";

import "../../css/ui/debugger.css";

export default class DebuggerControls extends Component {
    render() {
        // This is just a very simple port from Handlebars
        // If KA/anyone decides to enable debugger in the future,
        // this should be ported to fully utilize React
        return (
            <div>
                {$._("Debug Mode")}
                <input type="checkbox" className="debug-mode" />
                <span
                    className="debugger-level"
                    style={{display: "none", marginLeft: "20px"}}
                >
                    {$._("Level")}
                    <select
                        className="debugger-level-select"
                        defaultValue="beginner"
                    >
                        <option value="beginner">{$._("Beginner")}</option>
                        <option value="advanced">{$._("Advanced")}</option>
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
                        {$._("Begin")}
                    </button>
                    <button className="step-in" disabled>
                        {$._("Step")}
                    </button>
                    <button
                        className="debug-end"
                        disabled
                        style={{marginLeft: "20px"}}
                    >
                        {$._("End")}
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
                        {$._("Restart")}
                    </button>
                    <button className="step-over" disabled>
                        {$._("Step Over")}
                    </button>
                    <button className="step-in" disabled>
                        {$._("Step In")}
                    </button>
                    <button className="step-out" disabled>
                        {$._("Step Out")}
                    </button>
                    <button
                        className="debug-continue"
                        disabled
                        style={{marginLeft: "10px"}}
                    >
                        {$._("Continue")}
                    </button>
                </div>
            </div>
        );
    }
}
