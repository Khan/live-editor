/**
 * This is called tipbar for historical reasons.
 * Originally, it appeared as a red bar sliding up from the bottom of the
 * canvas. Now it powers the error reporting mechanism, which no longer
 * looks like a bar.
 */
const $ = require("jquery");
import React, {Component} from 'react';

class TipBar extends Component {
    // props: liveEditor, isHidden, errors
    static defaultProps = {
        errors: [],
        isHidden: true
    }

    constructor(props) {
        super(props);
        this.state = {
            errorNum: props.errorNum || 0
        }
        this.handleShowMeClick = this.handleShowMeClick.bind(this);
        this.handlePrevClick = this.handlePrevClick.bind(this);
        this.handleNextClick = this.handleNextClick.bind(this);
        this.handleCloseClick = this.handleCloseClick.bind(this);
    }

    handleShowMeClick () {
        const error = this.props.errors[this.state.errorNum];
        this.props.liveEditor.editor.setCursor(error);
        this.props.liveEditor.editor.setErrorHighlight(true);
    }

    handleCloseClick () {
        this.props.liveEditor.setThinkingState();
    }

    handlePrevClick () {
        this.setState((prevState, props) => ({
            errorNum: Math.max(0, prevState.errorNum - 1)
        }));
        this.props.liveEditor.editor.focus();
    }

    handleNextClick () {
        this.setState((prevState, props) => ({
            errorNum: Math.min(prevState.errorNum + 1, this.props.errors.length - 1)
        }));
        this.props.liveEditor.editor.focus();
    }

    render() {
        if (this.props.isHidden || !this.props.errors.length) {
            return null;
        }

        const errors = this.props.errors;
        const errorNum = errors[this.state.errorNum] == null ?
            0 :
            this.state.errorNum;
        const currentError = errors[errorNum];

        const messageHtml = {
            __html: currentError.text || currentError || ""
        };

        let showMeDiv;
        if (currentError.row > -1) { // it could be undefined, null, or -1
            showMeDiv = (
                <div className="show-me">
                    <a
                        href="javascript:void(0)"
                        onClick={this.handleShowMeClick}
                    >
                    {i18n._("Show me where")}
                    </a>
                </div>
            );
        }

        let navDiv;
        if (errors.length > 1) {

            let prevClasses = "prev";
            if (errorNum <= 0) {
                prevClasses += " ui-state-disabled";
            }
            let nextClasses = "next";
            if (errorNum >= errors.length - 1) {
                nextClasses += " ui-state-disabled";
            }
            const numText = errors.length > 1 ?
                (errorNum + 1) + "/" + errors.length :
                "";

            navDiv = (
                <div className="tipnav">
                    <a
                        href="javascript:void(0)"
                        className={prevClasses}
                        onClick={this.handlePrevClick}
                        title={i18n._("Previous error")}
                    >
                        <span className="ui-icon ui-icon-circle-triangle-w"></span>
                    </a>
                    <span className="current-pos">{numText}</span>
                    <a
                        href="javascript:void(0)"
                        className={nextClasses}
                        onClick={this.handleNextClick}
                        title={i18n._("Next error")}
                    >
                        <span className="ui-icon ui-icon-circle-triangle-e"></span>
                    </a>
                </div>
            );
        }


         // Make the error dialog draggable
        // Replace with react-draggable
        /*
        if ($.fn.draggable) {
            this.$el.find(".tipbar").draggable({
                containment: "parent",
                handle: ".error-buddy",
                axis: "y"
            });
        }
        */

        return (
            <div>
                <div className="overlay error-overlay">
                </div>
                <div className="tipbar">
                    <div className="speech-arrow"></div>
                    <div className="error-buddy"></div>
                    <div className="text-wrap">
                        <button
                            className="close"
                            type="button"
                            onClick={this.handleCloseClick}
                            aria-label="Close">
                            {i18n.i18nDoNotTranslate("\u00D7")}
                        </button>
                        <div className="oh-no">{i18n._("Oh noes!")}</div>
                        <div className="message"
                            dangerouslySetInnerHTML={messageHtml}
                        />
                        {showMeDiv}
                        {navDiv}
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = TipBar;