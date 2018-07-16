const $ = require("jquery");
const Backbone = require("backbone");
Backbone.$ = require("jquery");
const React = require("react");
const ReactDOM = require("react-dom");

const MediaPickerTooltip = require("./media-picker-tooltip.jsx");
const TooltipBase = require("../../ui/tooltip-base.js");
const TooltipEngine = require("../../ui/tooltip-engine.js");

/* This file contains both the imageModal and soundModal tooltip, which share
 the same Modal() View, but have fairly different ways that they hook into
 the editor and replace the code.
 The imageModal is currently used only by webpages,
 and the soundModal is currently used only by programs.
 In the future, the imageModal might also be used by programs,
 as students seem to prefer that UI to the imagePicker UI.
 */
(function() {

    const ImageModal = TooltipBase.extend({
        initialize: function(options) {
            this.options = options;
            this.options.files = ExtendedOutputImages;
            this.parent = options.parent;
            this.autofill = true;
            this.render();
            this.bindToRequestTooltip();
            if (this.options.record) {
                Object.assign(this.options.record.handlers, {
                    "imagemodal.show": this.showModal.bind(this),
                    "imagemodal.hide": this.hideModal.bind(this),
                    "imagemodal.selectImg": this.selectImg.bind(this)
                });
            }

        },

        detector: function(event) {
            if (!/<img\s+[^>]*?\s*src\s*=\s*["']([^"']*)$/.test(event.pre)) {
                return;
            }
            var urlStart = event.col - RegExp.$1.length;
            var url = event.line.slice(urlStart).match(/^[^"']*/)[0];
            this.aceLocation = {
                start: urlStart,
                length: url.length,
                row: event.row
            };
            this.aceLocation.tooltipCursor = this.aceLocation.start + this.aceLocation.length + 1;

            this.updateTooltip(url);
            this.placeOnScreen();
            event.stopPropagation();
            ScratchpadAutosuggest.enableLiveCompletion(false);
        },

        updateTooltip: function(url) {
            if (url !== this.currentUrl) {
                this.currentUrl = url.trim();
                if (url === "") {
                        this.renderPreview({
                            mediaSrc: "",
                            errorMessage: i18n._("Enter an image URL."),
                            errorType: "notice"
                        });
                    return;
                }
                var allowedHosts = /(\.|^)?(khanacademy\.org|kastatic\.org|kasandbox\.org|ka-perseus-images\.s3\.amazonaws\.com|wikimedia\.org|localhost:\d+)$/i;
                var match = /\/\/([^\/]*)(?:\/|\?|#|$)/.exec(url);
                var host = match ? match[1] : "";
                if (!host || allowedHosts.test(host)) {
                    this.renderPreview({
                        mediaSrc: url,
                        errorMessage: ""
                    });
                } else {
                    this.renderPreview({
                        mediaSrc: "",
                        errorMessage: i18n._("Sorry! That server is not permitted."),
                        errorType: "error"
                    });
                }
            }
        },

        renderPreview: function(props) {
            props = props || {};
            props.mediaType = "image";
            props.onFileSelect = (fileInfo) => {
                this.activeFileInfo = fileInfo;
                this.logForRecording("selectImg", fileInfo.groupAndName);
            };
            props.onModalShow = () => {
                this.logForRecording("show");
            };
            props.onModalClose = () => {
                this.logForRecording("hide");
                if (!this.activeFileInfo) return;
                let updatePath = this.activeFileInfo.fullImgPath;
                this.updateTooltip(updatePath);
                this.updateText(updatePath);
            }
            props.imagesDir = this.options.imagesDir;
            props.mediaClasses = this.options.files;

            ReactDOM.render(
                React.createElement(MediaPickerTooltip, props, null),
                this.$el.find(".media-preview-wrapper")[0]);
        },

        render: function() {
            var self = this;

            this.$el = $("<div class='tooltip mediapicker-preview'>" +
                        "<div class='media-preview-wrapper'/>" +
                        "<div class='arrow'></div></div>")
                .addClass("mediapicker__image")
                .appendTo("body").hide();

            this.renderPreview();
        },

        remove: function() {
            this.$el.remove();
            // TODO: Remove react
            this.unbindFromRequestTooltip();
        },

        // Related to talkthrough playback:
        // TODO

        showModal: function() {
            // TODO: how to open programmatically?
        },

        hideModal: function() {
            // TODO: how to hide programmatically?
        },

        selectFile: function(dataPath) {
            // TODO: How to update programmatically?
            var $file = this.$(".mediapicker-modal-file[data-path='"+dataPath+"']");
            var $pane = $file.closest(".tab-pane");
            var $tab = this.$("a[href='#"+$pane.attr("id")+"']");
            $tab.tab("show");
            $pane.find(".mediapicker-modal-content").scrollTop(
                $file.position().top - 100);
            return $file;
        },

        selectImg: function(dataPath) {
            var $file = this.selectFile(dataPath);
            $file.find("img").click();
        },

        logForRecording: function(action, value) {
            var logAction = "imagemodal" + action;
            this.options.record && this.options.record.log(logAction, value);
        }
    });

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
            if (!/(\bgetSound\s*\()[^\)]*$/.test(event.pre)) {
                return;
            }
            // This is quite similar to code in image-picker.js,
            //  but my attempts to abstract it were thwarted by
            //  PhantomJS's inability to pass around RegEx objects in tests.
            //  That should be fixed in PhantomJS2.0, so we are eagerly
            //  awaiting the upgrade of gulp-mocha-phantomjs to that.
            // TODO: We use Chrome now!
            var functionStart = event.col - RegExp.lastMatch.length;
            var paramsStart = functionStart + RegExp.$1.length;

            var pieces = /^(\s*)(["']?[^\)]*?["']?)\s*(\);?|$)/.exec(event.line.slice(paramsStart));
            var leading = pieces[1];
            var pathStart = paramsStart + leading.length;
            var path = pieces[2];
            var closing = pieces[3];

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
                partialPath = partialPath.replace(/\"/g, "");
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
                if (!this.activeFileInfo) return;
                let updatePath = this.activeFileInfo.groupAndName;
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
            var self = this;

            this.$el = $("<div class='tooltip mediapicker-preview'>" +
                        "<div class='media-preview-wrapper'/>" +
                        "<div class='arrow'></div></div>")
                .addClass("mediapicker__sound")
                .appendTo("body").hide();

            this.renderPreview();
        },

        remove: function() {
            this.$el.remove();
            // TODO: Remove react
            this.unbindFromRequestTooltip();
        }
    });

    TooltipEngine.registerTooltip("imageModal", ImageModal);
    TooltipEngine.registerTooltip("soundModal", SoundModal);
})();
