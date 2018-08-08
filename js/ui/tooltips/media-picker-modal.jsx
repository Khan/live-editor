import i18n from "i18n";
import Button from "@khanacademy/wonder-blocks-button";
import {OneColumnModal} from "@khanacademy/wonder-blocks-modal";
import {Tab, Tabs, TabList, TabPanel} from "react-tabs";
import React, {Component} from "react";
import "react-tabs/style/react-tabs.css";

import MediaPickerScroller from "./media-picker-scroller.jsx";

export default class MediaPickerModal extends Component {
    props: {
        mediaClasses: Array<Object>,
        mediaDir: string,
        onClose: () => void,
        onFileSelect: (info: Object) => void,
        onModalRefCreate: (ref: Object) => void,
    };

    constructor(props) {
        super(props);

        // This ref is created purely so that it can be passed back
        //  to TooltipEngine, so that it can determine if blur events
        //  are outside a modal and should thus close the tooltip
        // Another approach would be to track modal open/close,
        //  but wonder-blocks-modal does not expose onOpen yet
        this.modalRef = React.createRef();
    }

    componentDidMount() {
        // TODO: Remove if wonder-blocks adds onOpen for Modal
        this.props.onModalRefCreate(this.modalRef);
    }

    render() {
        // state: activeClass
        // props: mediaClasses

        // First make the tabs
        const classesTabs = this.props.mediaClasses.map((mediaClass) => {
            const tabKey = `${mediaClass.className}-tab`;
            return <Tab key={tabKey}>{mediaClass.className}</Tab>;
        });

        // Now make the tab panels with the media for each class
        const classesTabPanels = this.props.mediaClasses.map(
            (mediaClass, ind) => {
                const panelKey = `${mediaClass.className}-panel`;
                return (
                    <TabPanel key={panelKey}>
                        <MediaPickerScroller
                            groups={mediaClass.groups}
                            mediaDir={this.props.mediaDir}
                            onFileSelect={this.props.onFileSelect}
                        />
                    </TabPanel>
                );
            },
        );

        return (
            <OneColumnModal
                content={
                    <div ref={this.modalRef}>
                        <Tabs>
                            <TabList>{classesTabs}</TabList>
                            {classesTabPanels}
                        </Tabs>
                    </div>
                }
                footer={
                    <Button onClick={this.props.onClose}>{i18n._("Ok")}</Button>
                }
            />
        );
    }
}