import React, {Component} from "react";

export default class TextareaEditor extends Component {
    props: {
        code: string,
        config: Object,
        type: string,
        autoFocus: boolean,
        onChange: Function,
    };

    constructor(props) {
        super(props);

        this.config = props.config;
        this.config.editor = this;

        this.editorRef = React.createRef();
        this.handleInput = this.handleInput.bind(this);
    }

    componentDidMount() {
        this.reset();
    }

    handleInput() {
        this.props.onChange();
    }

    reset(code, focus) {
        code = code || this.props.code;

        this.config.runCurVersion(this.props.type + "_editor", this);

        // Reset the editor
        this.text(code);
        this.setCursor({start: 0, end: 0}, focus);
    }

    // Focus the editor
    focus() {
        if (this.autoFocus !== false) {
            this.editorRef.current.focus();
        }
    }

    getCursor() {
        return {
            start: this.editorRef.current.selectionStart,
            end: this.editorRef.current.selectionEnd,
        };
    }

    getSelectionIndices() {
        return this.getCursor();
    }

    // Set the cursor position on the editor
    setCursor(cursorPos, focus) {
        if (this.editorRef.current.setSelectionRange) {
            this.editorRef.current.focus();
            this.editorRef.current.setSelectionRange(
                cursorPos.start,
                cursorPos.end,
            );
        } else if (this.editorRef.current.createTextRange) {
            const range = this.editorRef.current.createTextRange();
            range.collapse(true);
            range.moveEnd("character", cursorPos.end);
            range.moveStart("character", cursorPos.start);
            range.select();
        }

        if (focus !== false && this.autoFocus !== false) {
            this.editorRef.current.focus();
        }
    }

    setSelection(selection) {
        this.setCursor(selection);
    }

    setReadOnly(readOnly) {
        this.editorRef.current.readOnly = readOnly;
    }

    text(text) {
        if (text != null) {
            this.editorRef.current.value = text;
        } else {
            return this.editorRef.current.value;
        }

        return this;
    }

    undo() {}

    render() {
        return (
            <textarea
                ref={this.editorRef}
                style={{fontSize: "16px", height: "100%", width: "100%"}}
                onInput={this.handleInput}
            />
        );
    }
}
