/* global i18n */
const $ = require("jquery");
const Backbone = require("backbone");
Backbone.$ = require("jquery");
const React = require("react");
const ReactDOM = require("react-dom");

const MediaPickerTooltip = require("./media-picker-tooltip.jsx");
const OutputSounds = require("../../shared/sounds.js");
const ScratchpadAutosuggest = require("../../ui/autosuggest.js");
const TooltipBase = require("../../ui/tooltip-base.js");
const TooltipEngine = require("../../ui/tooltip-engine.js");

const SoundModal = TooltipBase.extend({
    defaultFile: "\"rpg/metal-clink\"",
    initialize: function(options) {
        this.options = options;
        this.options.files = OutputSounds;
        this.parent = options.parent;
        this.autofill = true;
        this.render();
        this.bindToRequestTooltip();
    },

    detector: function(event) {
        if (!/(\bgetSound\s*\()[^)]*$/.test(event.pre)) {
            return;
        }
        // This is quite similar to code in image-picker.js,
        //  but my attempts to abstract it were thwarted by
        //  PhantomJS's inability to pass around RegEx objects in tests.
        //  That should be fixed in PhantomJS2.0, so we are eagerly
        //  awaiting the upgrade of gulp-mocha-phantomjs to that.
        // TODO: We use Chrome now!
        const functionStart = event.col - RegExp.lastMatch.length;
        const paramsStart = functionStart + RegExp.$1.length;

        const pieces = /^(\s*)(["']?[^)]*?["']?)\s*(\);?|$)/.exec(event.line.slice(paramsStart));
        const leading = pieces[1];
        const pathStart = paramsStart + leading.length;
        let path = pieces[2];
        let closing = pieces[3];

        if (leading.length === 0 &&
            path.length === 0 &&
            closing.length === 0 &&
            event.source &&
            event.source.action === "insert" &&
            event.source.lines[0].length === 1 && this.autofill) {
            closing = ")" + (this.isInParenthesis(
                event.pre.slice(0, functionStart)) ? "" : ";");
            this.insert({
                row: event.row,
                column: pathStart
            }, closing);

            path = this.defaultFile;
            this.updateText(path);
        }

        this.aceLocation = {
            start: pathStart,
            length: path.length,
            row: event.row
        };
        this.aceLocation.tooltipCursor = this.aceLocation.start +
            this.aceLocation.length + closing.length;

        this.updateTooltip(path);
        this.placeOnScreen();
        event.stopPropagation();
        ScratchpadAutosuggest.enableLiveCompletion(false);
    },

    updateTooltip: function(partialPath) {
        if (partialPath !== this.currentUrl) {
            partialPath = partialPath.replace(/"/g, "");
            this.currentUrl = this.options.soundsDir + partialPath + ".mp3";
            if (partialPath === "") {
                this.renderPreview({
                    mediaSrc: "",
                    errorMessage: i18n._("Invalid sound file."),
                    errorType: "notice"
                });
                return;
            }
        }
        this.renderPreview({
            mediaSrc: this.currentUrl,
            errorMessage: ""
        });
    },

    renderPreview: function(props) {
        props = props || {};
        props.mediaType = "audio";
        props.onFileSelect = (fileInfo) => {
            this.activeFileInfo = fileInfo;
        };
        props.onModalClose = () => {
            if (!this.activeFileInfo) {return;}
            const updatePath = this.activeFileInfo.groupAndName;
            this.updateTooltip(updatePath);
            this.updateText(`"${updatePath}"`);

        }
        props.soundsDir = this.options.soundsDir;
        props.mediaClasses = this.options.files;
        ReactDOM.render(
            React.createElement(MediaPickerTooltip, props, null),
            this.$el.find(".media-preview-wrapper")[0]);
    },

    render: function() {
        this.$el = $("<div class='tooltip mediapicker-preview'>" +
                    "<div class='media-preview-wrapper'/>" +
                    "<div class='arrow'></div></div>")
            .addClass("mediapicker__sound")
            .appendTo("body").hide();

        this.renderPreview();
    },

    remove: function() {
        ReactDOM.unmountComponentAtNode(this.$(".media-preview-wrapper")[0]);
        this.$el.remove();
        this.unbindFromRequestTooltip();
    }
});

TooltipEngine.registerTooltip("soundModal", SoundModal);

module.exports = SoundModal;