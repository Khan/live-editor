import Button from "@khanacademy/wonder-blocks-button";
import {OneColumnModal} from "@khanacademy/wonder-blocks-modal";
import { StyleSheet, css } from 'aphrodite/no-important';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import React, {Component} from 'react';
import 'react-tabs/style/react-tabs.css';

const MediaPickerScroller = require("./media-picker-scroller.jsx");

class MediaPickerModal extends Component {

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
                        soundsDir={this.props.soundsDir}
                        onFileSelect={this.props.onFileSelect}
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
                    <Button onClick={this.props.onClose}>
                    {i18n._("Ok")}
                    </Button>
                }
            />);
    }
}

module.exports = MediaPickerModal;
