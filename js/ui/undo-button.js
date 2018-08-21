/* globals i18n */
import Button from "@khanacademy/wonder-blocks-button";
import React, {Component} from "react";

export default class UndoButton extends Component {
    props: {
        isHidden: boolean,
        onClick: Function,
    };

    render() {
        if (this.props.isHidden) {
            return null;
        }
        return (
            <Button kind="secondary" size="small" onClick={this.props.onClick}>
                {i18n._("Undo")}
            </Button>
        );
    }
}
