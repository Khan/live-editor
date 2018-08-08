import React, {Component} from "react";
import {StyleSheet, css} from "aphrodite/no-important";

export default class AutoSuggestPopup extends Component {
    props: {
        functionData: Object, // Function data - name, exampleURL, description, params
        paramsToCursor: string, // The params specified so far
    };

    constructor(props) {
        super(props);
        this.state = {};

        this.handleFunctionNameClick = this.handleFunctionNameClick.bind(this);
        this.handleMouseEnter = this.handleMouseEnter.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
    }

    handleFunctionNameClick(e) {
        const exampleURL = this.props.functionData.exampleURL;
        if (exampleURL) {
            window.open(exampleURL, "_blank");
        }
    }

    handleMouseEnter(description, e) {
        this.setState({currentDescription: description});
    }

    handleMouseLeave(e) {
        this.setState({currentDescription: null});
    }

    render() {
        const funcData = this.props.functionData;
        // The index of the last parameter the user typed:
        let lastParamInd = this.props.paramsToCursor.split(",").length - 1;

        // The name actually contains all the params too, so split that up:
        const funcParts = funcData.name.split("(");

        // Render the name and make it a link to exampleURL, if one exists
        const funcName = funcParts[0];
        let funcNameEl;
        if (funcData.exampleURL) {
            funcNameEl = (
                <a className={css(styles.funcName)} href={funcData.exampleURL} target="_blank">
                    {funcName}
                </a>
            );
        } else {
            funcNameEl = <span>{funcName}</span>;
        }
        funcNameEl = (
            <span
                onMouseEnter={(e) =>
                    this.handleMouseEnter(funcData.description, e)
                }
                onMouseLeave={this.handleMouseLeave}
            >
                {funcNameEl}
            </span>
        );

        // Now split the parameters into an array
        const paramsStr =
            funcParts.length > 1
                ? funcParts[1].substring(0, funcParts[1].length - 1)
                : "";
        const paramNames = paramsStr.split(",");

        // Render a warning if too many params were specified
        let errorEl;
        if (lastParamInd >= paramNames.length && funcName !== "debug") {
            lastParamInd = paramNames.length - 1;
            errorEl = (
                <div className={css(styles.error)}>
                    i18n._("Too many arguments passed!")
                </div>
            );
        }

        // Render the params, specially styling the one the user just typed
        const paramEls = paramNames.map((param, paramI) => {
            const isCurrent = paramI === lastParamInd;
            const className = css(
                styles.param,
                isCurrent && styles.currentParam,
            );
            const paramDescrip = funcData.params[paramI];
            return (
                <React.Fragment key={paramI}>
                    {!!paramI && ", "}
                    <span
                        className={className}
                        onMouseEnter={(e) => this.handleMouseEnter(paramDescrip, e)}
                        onMouseLeave={this.handleMouseLeave}
                    >
                        {param}
                    </span>
                </React.Fragment>
            );
        });

        // If the user is hovering over the func name or param, show its description
        let descriptionEl;
        if (this.state.currentDescription) {
            descriptionEl = (
                <div className={css(styles.description)}>
                    {this.state.currentDescription}
                </div>
            );
        }

        return (
            <div className={css(styles.popup)}>
                {funcNameEl}
                <span className={css(styles.paramsGroup)}>
                    <span>(</span>
                    {paramEls}
                    <span>)</span>
                </span>
                {errorEl}
                {descriptionEl}
            </div>
        );
    }
}

const styles = StyleSheet.create({
    popup: {
        color: "white",
        fontFamily: "monospace",
        fontSize: "12px",
        maxWidth: "500px",
        width: "auto",
    },
    funcName: {
        color: "white",
        ":visited": {
            color: "white"
        }
    },
    paramsGroup: {
        marginLeft: "2px",
    },
    param: {
        ":hover": {
            backgroundColor: "#FFFF00",
            color: "black",
        },
    },
    currentParam: {
        color: "lightblue",
        fontSize: "15px",
        fontWeight: "900",
    },
    error: {
        color: "red",
    },
    description: {
        color: "#ddd",
        marginTop: "5px",
    },
});