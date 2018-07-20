const $ = require("jquery");
const Backbone = require("backbone");
Backbone.$ = require("jquery");
const React = require("react");
const ReactDOM = require("react-dom");

const ImageScroller = require("./image-scroller.jsx")
const OutputImages = require("../../shared/images.js").OutputImages;
const ScratchpadAutosuggest = require("../../ui/autosuggest.js");
const TooltipBase = require("../../ui/tooltip-base.js");
const TooltipEngine = require("../../ui/tooltip-engine.js");

// A description of general tooltip flow can be found in tooltip-engine.js
const ImagePicker = TooltipBase.extend({
    defaultImage: "cute/None",

    initialize: function(options) {
        this.options = options;
        this.parent = options.parent;
        this.autofill = true;
        this.render();
        this.bindToRequestTooltip();
    },

    detector: function(event) {
        if (!/(\bgetImage\s*\()[^)]*$/.test(event.pre)) {
            return;
        }
        const functionStart = event.col - RegExp.lastMatch.length;
        const paramsStart = functionStart + RegExp.$1.length;

        const pieces = /^(\s*)(["']?[^)]*?["']?)\s*(\);?|$)/.exec(event.line.slice(paramsStart));
        const leadingPadding = pieces[1];
        const pathStart = paramsStart + leadingPadding.length;
        let path = pieces[2];
        this.closing = pieces[3];

        this.aceLocation = {
            start: pathStart,
            length: path.length,
            row: event.row
        };
        this.aceLocation.tooltipCursor = this.aceLocation.start + this.aceLocation.length + this.closing.length;

        // TODO(kevinb) extract this into a method on TooltipBase
        if (leadingPadding.length === 0 && path.length === 0 && this.closing.length === 0 &&
            event.source && event.source.action === "insert" && event.source.lines[0].length === 1 && this.autofill) {

            this.closing = ")" + (this.isAfterAssignment(event.pre.slice(0, functionStart)) ? ";" : "");
            this.insert({
                row: event.row,
                column: pathStart
            }, this.closing);

            path = this.defaultImage;
            this.updateText(path);
        }
        this.updateTooltip(path);
        this.placeOnScreen();
        event.stopPropagation();
        ScratchpadAutosuggest.enableLiveCompletion(false);
    },
    renderImageScroller: function(currentImage) {

        const props = {
            currentImage: currentImage,
            imagesDir: this.options.imagesDir,
            imageGroups: OutputImages,
            onMouseLeave: () => {
                this.options.editor.clearSelection();
                this.options.editor.focus();
            },
            onImageSelect: (imageName) => {
                this.updateText(imageName);
                this.updateTooltip(`"${imageName}"`);
            }
        };
        ReactDOM.render(
            React.createElement(ImageScroller, props, null),
            this.$el.find(".image-scroller-wrapper")[0]);
    },

    render: function() {
        this.$el = $("<div class='tooltip mediapicker'>" +
                     "<div class='image-scroller-wrapper'/>" +
                     "<div class='arrow'></div></div>")
            .appendTo("body").hide();
        this.renderImageScroller();
    },

    remove: function() {
        ReactDOM.unmountComponentAtNode(this.$(".image-scroller-wrapper")[0]);
        this.$el.remove();
        this.unbindFromRequestTooltip();
    },

    updateTooltip: function(rawPath) {
        let foundPath = this.defaultImage;

        const path = /^["']?(.*?)["']?$/.exec(rawPath)[1];
        const pathParts = path.split("/");
        const groupName = pathParts[0];
        const fileName = pathParts[1];
        OutputImages.forEach((group) => {
            if (group.groupName === groupName) {
                group.images.forEach((imageName) => {
                    if (imageName === fileName) {
                        foundPath = groupName + "/" + fileName;
                    }
                });
            }
        });

        this.renderImageScroller(foundPath);

        this.value = path;
    },

    updateText: function(newPath) {
        const newText = '"' + newPath + '"';
        TooltipBase.prototype.updateText.call(this, newText);
        this.aceLocation.tooltipCursor = this.aceLocation.start + this.aceLocation.length + this.closing.length;
    }
});

TooltipEngine.registerTooltip("imagePicker", ImagePicker);

module.exports = ImagePicker;