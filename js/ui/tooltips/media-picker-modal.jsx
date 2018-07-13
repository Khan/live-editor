import Button from "@khanacademy/wonder-blocks-button";
import {OneColumnModal} from "@khanacademy/wonder-blocks-modal";
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import React, {Component} from 'react';
import 'react-tabs/style/react-tabs.css';

const LazyLoadImage = require("./lazy-load-image.jsx");
const MediaPickerScroller = require("./media-picker-scroller.jsx");

class MediaPickerModal extends Component {

    constructor(props) {
        super(props);
        this.handleButtonClick = this.handleButtonClick.bind(this);
        this.handleCloseClick = this.handleCloseClick.bind(this);
    }

    handleButtonClick() {
        console.log("Twas the night before clickmas")
    }

    handleCloseClick() {
        console.log("Twas closed?")
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
        const classesTabPanels = this.props.mediaClasses.map((mediaClass, ind) => {
            const panelKey = `${mediaClass.className}-panel`;
            return <TabPanel key={panelKey}>
                    <MediaPickerScroller
                        groups={mediaClass.groups}
                        imagesDir={this.props.imagesDir}
                        />
                </TabPanel>;
        });

        return (
            <OneColumnModal
                content={
                    <Tabs>
                        <TabList>
                            {classesTabs}
                        </TabList>
                        {classesTabPanels}
                    </Tabs>
                }
                footer={
                    <Button
                        onClick={this.handleButtonClick}
                    >
                    {i18n._("Ok")}
                    </Button>
                }
                onClickCloseButton={() => alert("This would close the modal.")}

            />
            );
    }
}

module.exports = MediaPickerModal;
