import i18n from "i18n";
import Button from "@khanacademy/wonder-blocks-button";
import {OneColumnModal} from "@khanacademy/wonder-blocks-modal";
import {View} from "@khanacademy/wonder-blocks-core";
import {Tab, Tabs, TabList, TabPanel} from "react-tabs";
import React, {Component} from "react";
import "react-tabs/style/react-tabs.css";

import MediaPickerScroller from "./media-picker-scroller.js";

export default class MediaPickerModal extends Component {
    props: {
        mediaClasses: Array<Object>,
        mediaDir: string,
        onClose: () => void,
        onFileSelect: (info: Object) => void,
    };

    handleClick(e) {
        e.stopPropagation();
    }

    render() {
        let modalContent;
        if (this.props.mediaClasses.length < 2) {
            modalContent = (
                <MediaPickerScroller
                    groups={this.props.mediaClasses[0].groups}
                    mediaDir={this.props.mediaDir}
                    onFileSelect={this.props.onFileSelect}
                />
            );
        } else {
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
            modalContent = (
                <Tabs>
                    <TabList>{classesTabs}</TabList>
                    {classesTabPanels}
                </Tabs>
            );
        }

        return (
            <OneColumnModal
                content={<View>{modalContent}</View>}
                footer={
                    <View>
                        <Button onClick={this.props.onClose}>
                            {i18n._("Ok")}
                        </Button>
                    </View>
                }
            />
        );
    }
}
